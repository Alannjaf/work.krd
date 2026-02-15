'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, CreditCard } from 'lucide-react'

export function AdminQuickActions() {
  const router = useRouter()

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Users
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/resumes')}
        >
          <FileText className="h-4 w-4 mr-2" />
          View All Resumes
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/payments')}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Review Payments
        </Button>
      </div>
    </Card>
  )
}
