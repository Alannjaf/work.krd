'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, CreditCard } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function AdminQuickActions() {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">{t('pages.admin.quickActions.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
        >
          <Users className="h-4 w-4 mr-2" />
          {t('pages.admin.quickActions.manageUsers')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/resumes')}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t('pages.admin.quickActions.viewAllResumes')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/payments')}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {t('pages.admin.quickActions.reviewPayments')}
        </Button>
      </div>
    </Card>
  )
}
