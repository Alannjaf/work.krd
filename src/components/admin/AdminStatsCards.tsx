'use client'

import { Card } from '@/components/ui/card'
import { Users, DollarSign, FileText, CreditCard } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalResumes: number
  activeSubscriptions: number
  revenue: number
  payments?: {
    pending: number
    approved: number
    rejected: number
  }
}

interface AdminStatsCardsProps {
  stats: Stats | null
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const totalPayments = stats?.payments
    ? stats.payments.pending + stats.payments.approved + stats.payments.rejected
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Resumes</p>
            <p className="text-2xl font-bold">{stats?.totalResumes || 0}</p>
          </div>
          <FileText className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pro Subscriptions</p>
            <p className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</p>
          </div>
          <DollarSign className="h-8 w-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold">{(stats?.revenue || 0).toLocaleString()} IQD</p>
          </div>
          <DollarSign className="h-8 w-8 text-yellow-500" />
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Payments</p>
            <p className="text-2xl font-bold">{totalPayments}</p>
            {stats?.payments && (
              <div className="flex gap-3 mt-1 text-xs">
                <span className="text-amber-600">{stats.payments.pending} pending</span>
                <span className="text-green-600">{stats.payments.approved} approved</span>
                <span className="text-red-600">{stats.payments.rejected} rejected</span>
              </div>
            )}
          </div>
          <CreditCard className="h-8 w-8 text-indigo-500" />
        </div>
      </Card>
    </div>
  )
}
