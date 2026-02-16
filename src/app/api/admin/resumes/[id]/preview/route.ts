import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminWithId } from '@/lib/admin';
import { ResumeData, PersonalInfo, WorkExperience, Education, Skill, Language, Project, Certification } from '@/types/resume';
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from '@/lib/api-helpers';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdminWithId();

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-resume-preview' });
    if (!success) return rateLimitResponse(resetIn);

    // Validate ID format (cuid)
    if (!id || !/^c[a-z0-9]{20,}$/.test(id)) {
      return validationErrorResponse('Invalid resume ID format');
    }

    // Fetch resume with all related data
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' }},
        user: true}});

    if (!resume) {
      return notFoundResponse('Resume not found');
    }

    // Parse personalInfo as JSON if it's stored as JSON
    // JSON.parse() preserves UTF-8 encoding, including Kurdish Sorani and Arabic characters
    const defaultPersonalInfo: PersonalInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    };
    
    let personalInfo: PersonalInfo = defaultPersonalInfo;
    if (resume.personalInfo) {
      try {
        personalInfo = typeof resume.personalInfo === 'string' ? JSON.parse(resume.personalInfo) : resume.personalInfo;
      } catch (parseError) {
        console.warn(`Failed to parse personalInfo for resume ${id}:`, parseError);
        personalInfo = defaultPersonalInfo;
      }
    }

    // Transform database resume to ResumeData format
    const transformedData: ResumeData = {
      personal: {
        fullName: personalInfo?.fullName || resume.user.name || '',
        email: personalInfo?.email || resume.user.email,
        phone: personalInfo?.phone || '',
        location: personalInfo?.location || '',
        linkedin: personalInfo?.linkedin || '',
        website: personalInfo?.website || '',
        title: personalInfo?.title || '',
        profileImage: personalInfo?.profileImage || '',
        // Optional demographic fields
        dateOfBirth: personalInfo?.dateOfBirth || '',
        gender: personalInfo?.gender || '',
        nationality: personalInfo?.nationality || '',
        maritalStatus: personalInfo?.maritalStatus || '',
        country: personalInfo?.country || ''},
      summary: resume.summary || '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      certifications: []};

    // Transform sections based on their type
    resume.sections.forEach((section) => {
      if (!section.content || typeof section.content !== 'object') {
        console.warn(`Invalid section content for resume ${id}, section ${section.type}:`, typeof section.content);
        return;
      }
      const content = section.content as Record<string, unknown>;
      
      switch (section.type) {
        case 'WORK_EXPERIENCE':
          if (content.experiences && Array.isArray(content.experiences)) {
            transformedData.experience = (content.experiences as Array<Partial<WorkExperience> & Record<string, unknown>>).map((exp) => ({
              id: exp.id || Math.random().toString(),
              jobTitle: exp.jobTitle || '',
              company: exp.company || '',
              location: exp.location || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              current: exp.current || false,
              description: exp.description || ''}));
          } else if (content && typeof content === 'object') {
            // Sometimes content might be directly the experience data
            const expArray = Object.values(content).filter(item => 
              item && typeof item === 'object' && (item as Record<string, unknown>).jobTitle
            );
            if (expArray.length > 0) {
              transformedData.experience = (expArray as Array<Partial<WorkExperience> & Record<string, unknown>>).map((exp) => ({
                id: exp.id || Math.random().toString(),
                jobTitle: exp.jobTitle || '',
                company: exp.company || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                current: exp.current || false,
                description: exp.description || ''}));
            }
          }
          break;

        case 'EDUCATION':
          if (content.education && Array.isArray(content.education)) {
            transformedData.education = (content.education as Array<Partial<Education> & Record<string, unknown>>).map((edu) => ({
              id: edu.id || Math.random().toString(),
              degree: edu.degree || '',
              field: edu.field || '',
              school: edu.school || '',
              location: edu.location || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              gpa: edu.gpa || '',
              achievements: edu.achievements || ''}));
          }
          break;

        case 'SKILLS':
          if (content.skills && Array.isArray(content.skills)) {
            transformedData.skills = (content.skills as Array<Partial<Skill> & Record<string, unknown>>).map((skill) => ({
              id: skill.id || Math.random().toString(),
              name: skill.name || '',
              level: skill.level || ''}));
          }
          break;

        case 'LANGUAGES':
          if (content.languages && Array.isArray(content.languages)) {
            transformedData.languages = (content.languages as Array<Partial<Language> & Record<string, unknown>>).map((lang) => ({
              id: lang.id || Math.random().toString(),
              name: lang.name || '',
              proficiency: lang.proficiency || ''}));
          }
          break;

        case 'PROJECTS':
          if (content.projects && Array.isArray(content.projects)) {
            transformedData.projects = (content.projects as Array<Partial<Project> & Record<string, unknown>>).map((proj) => ({
              id: proj.id || Math.random().toString(),
              name: proj.name || '',
              description: proj.description || '',
              technologies: proj.technologies || '',
              link: proj.link || '',
              startDate: proj.startDate || '',
              endDate: proj.endDate || ''}));
          }
          break;

        case 'CERTIFICATIONS':
          if (content.certifications && Array.isArray(content.certifications)) {
            transformedData.certifications = (content.certifications as Array<Partial<Certification> & Record<string, unknown>>).map((cert) => ({
              id: cert.id || Math.random().toString(),
              name: cert.name || '',
              issuer: cert.issuer || '',
              date: cert.date || '',
              expiryDate: cert.expiryDate || '',
              credentialId: cert.credentialId || '',
              url: cert.url || ''}));
          }
          break;
      }
    });

    // Validate that we have at least some data
    if (!transformedData.personal || (!transformedData.personal.fullName && !transformedData.personal.email)) {
      console.warn(`Resume ${id} has incomplete personal information`);
    }

    // successResponse() automatically handles UTF-8 encoding for Unicode characters (Kurdish, Arabic, etc.)
    return successResponse(transformedData);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403);
    }
    console.error(`Error fetching resume ${id}:`, error);
    return errorResponse('Failed to fetch resume data', 500);
  }
}