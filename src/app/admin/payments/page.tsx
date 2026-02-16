import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { AdminPayments } from '@/components/admin/AdminPayments'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }
  return (
    <AdminErrorBoundary sectionName="Payment Management">
      <AdminPayments />
    </AdminErrorBoundary>
  )
}
