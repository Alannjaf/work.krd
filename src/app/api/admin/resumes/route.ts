import { prisma } from '@/lib/prisma';
import { ResumeStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers';
import { requireAdminWithId, logAdminAction } from '@/lib/admin';
import { attachCsrfToken, validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf';
import { ADMIN_PAGINATION } from '@/lib/constants';

interface ResumeListItem {
  id: string;
  title: string;
  template: string;
  status: ResumeStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    sections: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAdminWithId();

    const searchParams = req.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').slice(0, 200);

    // Validate status against enum allowlist
    const rawStatus = searchParams.get('status');
    const ALLOWED_STATUSES: ResumeStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
    const status = rawStatus && ALLOWED_STATUSES.includes(rawStatus as ResumeStatus)
      ? (rawStatus as ResumeStatus)
      : null;

    // Validate template against safe pattern (alphanumeric + hyphens only)
    const rawTemplate = searchParams.get('template') || '';
    const template = /^[a-z0-9-]*$/.test(rawTemplate) ? rawTemplate : '';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(ADMIN_PAGINATION.MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(ADMIN_PAGINATION.RESUMES)) || ADMIN_PAGINATION.RESUMES));
    const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'template', 'status'] as const;
    const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

    const rawSortBy = searchParams.get('sortBy') || 'createdAt';
    const rawSortOrder = searchParams.get('sortOrder') || 'desc';
    const sortBy = ALLOWED_SORT_FIELDS.includes(rawSortBy as typeof ALLOWED_SORT_FIELDS[number]) ? rawSortBy : 'createdAt';
    const sortOrder = ALLOWED_SORT_ORDERS.includes(rawSortOrder as typeof ALLOWED_SORT_ORDERS[number]) ? rawSortOrder : 'desc';

    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
          ]} : {},
        status ? { status } : {},
        template ? { template } : {},
      ]};

    // Try to fetch resumes, but handle case where tables might not exist
    let resumes: ResumeListItem[] = [];
    let total = 0;

    try {
      [resumes, total] = await Promise.all([
        prisma.resume.findMany({
          where,
          select: {
            id: true,
            title: true,
            template: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true}},
            _count: {
              select: {
                sections: true}}},
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder }}),
        prisma.resume.count({ where }),
      ]);
    } catch (error) {
      console.error('[AdminResumes] Failed to fetch resumes from database:', error);
      // Return empty array if tables don't exist yet
    }

    const response = NextResponse.json({
      resumes: resumes as ResumeListItem[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1}});

    return attachCsrfToken(response, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403);
    }
    console.error('[AdminResumes] Failed to get resumes:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAdminWithId();

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req);
    if (!validateCsrfToken(userId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403);
    }

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return validationErrorResponse('Invalid request: ids must be a non-empty array');
    }

    // Cap the number of IDs to prevent abuse
    if (ids.length > 100) {
      return validationErrorResponse('Cannot delete more than 100 resumes at once');
    }

    // Verify all IDs exist before deletion — prevent silent no-ops
    const existingCount = await prisma.resume.count({
      where: { id: { in: ids } },
    });

    if (existingCount !== ids.length) {
      return validationErrorResponse(
        `Found ${existingCount} of ${ids.length} requested resumes. Some IDs may be invalid.`
      );
    }

    // Audit log the IDs being deleted before performing the deletion
    await logAdminAction(userId, 'DELETE_RESUMES', `resumes:${ids.length}`, {
      resumeIds: ids,
      count: ids.length,
    });

    await prisma.resume.deleteMany({
      where: { id: { in: ids } },
    });

    return successResponse({ success: true, deleted: existingCount });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403);
    }
    console.error('[AdminResumes] Failed to delete resumes:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
