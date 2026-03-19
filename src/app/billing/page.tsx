'use client'

// GammalTech types in src/types/gammal-tech.d.ts

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  Check,
  Crown,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Infinity,
  Tag,
  CreditCard,
  Building2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { PLAN_NAMES } from '@/lib/constants'

interface PaymentStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  adminNote?: string
  plan?: string
  createdAt?: string
}

export default function BillingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(true)
  const [hasReferralDiscount, setHasReferralDiscount] = useState(false)
  const [showPaymentChoice, setShowPaymentChoice] = useState(false)
  const [gammalSdkReady, setGammalSdkReady] = useState(false)

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch('/api/payments/status')
        if (response.ok) {
          const data = await response.json()
          // API returns { payments: [...] }, extract the most recent one
          const latest = data.payments?.[0]
          if (latest) {
            setPaymentStatus({
              status: latest.status,
              adminNote: latest.adminNote,
              plan: latest.plan,
              createdAt: latest.createdAt,
            })
          }
        }
      } catch (error) {
        console.error('[Billing] Failed to fetch payment status:', error)
      } finally {
        setPaymentLoading(false)
      }
    }

    fetchPaymentStatus()

    // Check referral discount
    fetch('/api/user/referral')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.isReferred) setHasReferralDiscount(true)
      })
      .catch(() => {})
  }, [])

  const isPro = subscription?.plan === PLAN_NAMES.PRO

  const freeFeatures = [
    t('billing.freePlan.feature1'),
    t('billing.freePlan.feature2'),
    t('billing.freePlan.feature3'),
    t('billing.freePlan.feature4'),
  ]

  const proFeatures = [
    t('billing.proPlan.feature1'),
    t('billing.proPlan.feature2'),
    t('billing.proPlan.feature3'),
    t('billing.proPlan.feature4'),
    t('billing.proPlan.feature6'),
    t('billing.proPlan.feature8'),
  ]

  // Settle pending Gammal Tech payments on page load
  useEffect(() => {
    if (!gammalSdkReady) return
    // Wait for SDK object to be available
    const check = setInterval(() => {
      if (window.GammalTech?.payment) {
        clearInterval(check)
        window.GammalTech.payment.settlePending().catch((err: unknown) => {
          console.error('[Billing] settlePending error:', err)
        })
      }
    }, 100)
    const timeout = setTimeout(() => clearInterval(check), 5000)
    return () => { clearInterval(check); clearTimeout(timeout) }
  }, [gammalSdkReady])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gammal Tech SDK for settlePending on interrupted payments */}
      <Script
        src="https://api.gammal.tech/sdk-web.js"
        strategy="afterInteractive"
        onLoad={() => setGammalSdkReady(true)}
      />

      <AppHeader
        title={t('billing.title')}
        showBackButton={true}
        backButtonText={t('pages.resumeBuilder.backToDashboard')}
        backButtonHref="/dashboard"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('billing.title')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('billing.subtitle')}</p>
        </div>

        {/* Payment Status Banner */}
        {!paymentLoading && paymentStatus?.status && (
          <div className="mb-6">
            {paymentStatus.status === 'PENDING' && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-900">
                    {t('billing.paymentStatus.pending')}
                  </p>
                </div>
              </div>
            )}
            {paymentStatus.status === 'APPROVED' && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="font-medium text-green-900">
                  {t('billing.paymentStatus.approved')}
                </p>
              </div>
            )}
            {paymentStatus.status === 'REJECTED' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">
                    {t('billing.paymentStatus.rejected')}
                  </p>
                  {paymentStatus.adminNote && (
                    <p className="text-sm text-red-700 mt-1">{paymentStatus.adminNote}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Plan Status */}
        {subscription && !subscriptionLoading && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('billing.currentPlan.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('billing.currentPlan.description', { plan: subscription.plan })}
                </p>
              </div>
              <Badge
                variant={isPro ? 'default' : 'secondary'}
                className="self-start sm:self-auto px-3 py-1"
              >
                {isPro && <Crown className="h-3 w-3 mr-1" />}
                {t('billing.currentPlan.planBadge', { plan: subscription.plan })}
              </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Resumes Used */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {subscription.resumeCount}/
                  {subscription.resumeLimit === -1 ? (
                    <Infinity className="inline h-5 w-5" />
                  ) : (
                    subscription.resumeLimit
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {t('billing.currentPlan.stats.resumesUsed')}
                </div>
                {subscription.resumeLimit !== -1 && (
                  <div
                    className="mt-2 w-full bg-gray-200 rounded-full h-1.5"
                    role="progressbar"
                    aria-valuenow={subscription.resumeCount}
                    aria-valuemin={0}
                    aria-valuemax={subscription.resumeLimit}
                  >
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (subscription.resumeCount / subscription.resumeLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* AI Usage */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {subscription.aiUsageCount}/
                  {subscription.aiUsageLimit === -1 ? (
                    <Infinity className="inline h-5 w-5" />
                  ) : (
                    subscription.aiUsageLimit
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {t('billing.currentPlan.stats.aiUsage')}
                </div>
                {subscription.aiUsageLimit !== -1 && (
                  <div
                    className="mt-2 w-full bg-gray-200 rounded-full h-1.5"
                    role="progressbar"
                    aria-valuenow={subscription.aiUsageCount}
                    aria-valuemin={0}
                    aria-valuemax={subscription.aiUsageLimit}
                  >
                    <div
                      className="bg-green-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (subscription.aiUsageCount / subscription.aiUsageLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* PDF Exports */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {subscription.exportCount}/
                  {subscription.exportLimit === -1 ? (
                    <Infinity className="inline h-5 w-5" />
                  ) : (
                    subscription.exportLimit
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {t('billing.currentPlan.stats.pdfExports')}
                </div>
                {subscription.exportLimit !== -1 && (
                  <div
                    className="mt-2 w-full bg-gray-200 rounded-full h-1.5"
                    role="progressbar"
                    aria-valuenow={subscription.exportCount}
                    aria-valuemin={0}
                    aria-valuemax={subscription.exportLimit}
                  >
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (subscription.exportCount / subscription.exportLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Resume Imports */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {subscription.resumeImportsCount}/
                  {subscription.resumeImportsLimit === -1 ? (
                    <Infinity className="inline h-5 w-5" />
                  ) : (
                    subscription.resumeImportsLimit
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {t('billing.currentPlan.stats.resumeImports')}
                </div>
                {subscription.resumeImportsLimit !== -1 && (
                  <div
                    className="mt-2 w-full bg-gray-200 rounded-full h-1.5"
                    role="progressbar"
                    aria-valuenow={subscription.resumeImportsCount}
                    aria-valuemin={0}
                    aria-valuemax={subscription.resumeImportsLimit}
                  >
                    <div
                      className="bg-orange-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (subscription.resumeImportsCount / subscription.resumeImportsLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {subscriptionLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">{t('billing.loading')}</p>
          </div>
        )}

        {/* Pricing Cards */}
        {!subscriptionLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* FREE Plan */}
            <Card className="p-5 sm:p-6 flex flex-col">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('billing.freePlan.title')}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {t('billing.freePlan.price')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {freeFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {!isPro ? (
                <Button variant="outline" className="w-full" disabled>
                  {t('billing.currentPlan.currentPlanButton')}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  {t('billing.freePlan.title')}
                </Button>
              )}
            </Card>

            {/* PRO Plan */}
            <Card className="p-5 sm:p-6 flex flex-col ring-2 ring-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                {t('billing.proPlan.title')}
              </Badge>

              <div className="mb-5 mt-2">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('billing.proPlan.title')}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {hasReferralDiscount ? (
                    <>
                      <span className="text-lg line-through text-gray-400">
                        {t('billing.proPlan.price')}
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        4,000 IQD
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {t('billing.proPlan.price')}
                    </span>
                  )}
                  <span className="text-gray-600 text-sm">
                    /{t('billing.proPlan.perMonth')}
                  </span>
                </div>
                {hasReferralDiscount && (
                  <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mb-2">
                    <Tag className="h-3.5 w-3.5" />
                    {t('referral.discountApplied')}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {isPro ? (
                <Button variant="outline" className="w-full" disabled>
                  {t('billing.currentPlan.currentPlanButton')}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPaymentChoice(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {t('billing.upgradeNow')}
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Payment Method Choice Modal */}
        {showPaymentChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowPaymentChoice(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Choose Payment Method
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Select how you&apos;d like to pay for your Pro plan
              </p>

              <div className="space-y-3">
                {/* Card Payment Option */}
                <button
                  onClick={() => {
                    setShowPaymentChoice(false)
                    router.push('/billing/card-payment')
                  }}
                  className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pay with Card</p>
                    <p className="text-sm text-gray-500">
                      Visa, Mastercard — instant activation
                    </p>
                  </div>
                </button>

                {/* FIB Transfer Option */}
                <button
                  onClick={() => {
                    setShowPaymentChoice(false)
                    router.push('/billing/payment-instructions?plan=pro')
                  }}
                  className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pay via FIB Transfer</p>
                    <p className="text-sm text-gray-500">
                      Bank transfer — reviewed within 24 hours
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('billing.howItWorks.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm text-gray-700">{t('billing.howItWorks.step1')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm text-gray-700">{t('billing.howItWorks.step2')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm text-gray-700">{t('billing.howItWorks.step3')}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-blue-800">
              {t('billing.howItWorks.note')}
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}
