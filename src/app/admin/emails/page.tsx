import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { EmailDashboard } from '@/components/admin/email-dashboard'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'

export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }
  return (
    <AdminErrorBoundary sectionName="Email Dashboard">
      <EmailDashboard />
    </AdminErrorBoundary>
  )
}
