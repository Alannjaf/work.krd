import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { UserManagement } from '@/components/admin/UserManagement'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'

// Force dynamic rendering since this uses auth
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <AdminErrorBoundary sectionName="User Management">
      <UserManagement />
    </AdminErrorBoundary>
  )
}