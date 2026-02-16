import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Resume, ResumeStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers';
import { attachCsrfToken, validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf';
import { ADMIN_PAGINATION } from '@/lib/constants';

interface ResumeWithUser extends Resume {
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
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    // Check if user table exists and has role column
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId }});

      if (!user || user.role !== 'ADMIN') {
        return forbiddenResponse();
      }
    } catch (error) {
      console.error('[AdminResumes] Failed to check user role:', error);
      // If role column doesn't exist, just check if user exists
      const userExists = await prisma.user.findUnique({
        where: { clerkId: userId }});

      if (!userExists) {
        return notFoundResponse('User not found');
      }
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as ResumeStatus | null;
    const template = searchParams.get('template') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(ADMIN_PAGINATION.RESUMES));
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
    let resumes: ResumeWithUser[] = [];
    let total = 0;

    try {
      [resumes, total] = await Promise.all([
        prisma.resume.findMany({
          where,
          include: {
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
      resumes: resumes as ResumeWithUser[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1}});

    return attachCsrfToken(response, userId);
  } catch (error) {
    console.error('[AdminResumes] Failed to get resumes:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }});

    if (!user || user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req);
    if (!validateCsrfToken(userId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403);
    }

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return validationErrorResponse('Invalid request');
    }

    await prisma.resume.deleteMany({
      where: { id: { in: ids } }});

    return successResponse({ success: true });
  } catch (error) {
    console.error('[AdminResumes] Failed to delete resumes:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
