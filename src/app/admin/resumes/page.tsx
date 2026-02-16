import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { ResumeManagement } from '@/components/admin/ResumeManagement';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { AppHeader } from '@/components/shared/AppHeader';

// Force dynamic rendering since this uses auth
export const dynamic = 'force-dynamic';

export default async function AdminResumesPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Resume Management"
        showBackButton={true}
        backButtonText="Back to Admin Dashboard"
        backButtonHref="/admin"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
          <p className="text-gray-600 mt-2">View, manage, and export all user resumes</p>
        </div>

        <AdminErrorBoundary sectionName="Resume Management">
          <ResumeManagement />
        </AdminErrorBoundary>
      </div>
    </div>
  );
}