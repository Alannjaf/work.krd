'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Users, Gift, Share2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface ReferralData {
  referralCode: string
  referralLink: string
  stats: {
    totalReferred: number
    completed: number
    rewarded: number
  }
}

export function ReferralCard() {
  const { t } = useLanguage()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/referral')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setData(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    if (!data) return
    navigator.clipboard.writeText(data.referralLink)
    setCopied(true)
    toast.success(t('referral.linkCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    if (!data) return
    const text = `${t('referral.shareMessage')} ${data.referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareTelegram = () => {
    if (!data) return
    const text = `${t('referral.shareMessage')} ${data.referralLink}`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent(t('referral.shareMessage'))}`, '_blank')
  }

  if (loading) return null
  if (!data?.referralCode) return null

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{t('referral.title')}</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">{t('referral.description')}</p>

      {/* Referral Link */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-700 truncate font-mono">
          {data.referralLink}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex-shrink-0 h-9 w-9 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-700">{data.stats.totalReferred}</div>
          <div className="text-xs text-blue-600">{t('referral.stats.referred')}</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-700">{data.stats.completed}</div>
          <div className="text-xs text-green-600">{t('referral.stats.upgraded')}</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-700">{data.stats.rewarded}</div>
          <div className="text-xs text-purple-600">{t('referral.stats.rewards')}</div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={shareWhatsApp}
          className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
        >
          <Share2 className="h-4 w-4 me-1.5" />
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={shareTelegram}
          className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Share2 className="h-4 w-4 me-1.5" />
          Telegram
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex-1"
        >
          <Copy className="h-4 w-4 me-1.5" />
          {t('referral.copyLink')}
        </Button>
      </div>
    </Card>
  )
}
