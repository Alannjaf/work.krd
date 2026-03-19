'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  Crown,
  Shield,
  Tag,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    GammalTech?: {
      login: () => Promise<void>
      isLoggedIn: () => boolean
      payCard: (
        amount: number,
        currency: string,
        description: string,
        onDelivery: (txnId: string) => void
      ) => void
      settlePending: () => void
    }
  }
}

type PaymentStep = 'ready' | 'logging-in' | 'paying' | 'confirming' | 'success' | 'error'

export default function CardPaymentPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [step, setStep] = useState<PaymentStep>('ready')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasReferralDiscount, setHasReferralDiscount] = useState(false)
  const [amount, setAmount] = useState(5000)
  const settleCalled = useRef(false)

  // Fetch referral discount status
  useEffect(() => {
    fetch('/api/user/referral')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isReferred) {
          setHasReferralDiscount(true)
          setAmount(4000)
        }
      })
      .catch(() => {})
  }, [])

  // Settle pending payments on load (critical for recovering interrupted payments)
  useEffect(() => {
    if (sdkLoaded && window.GammalTech && !settleCalled.current) {
      settleCalled.current = true
      try {
        window.GammalTech.settlePending()
      } catch (err) {
        console.error('[CardPayment] settlePending error:', err)
      }
    }
  }, [sdkLoaded])

  const confirmPayment = useCallback(
    async (txnId: string) => {
      setStep('confirming')
      try {
        const response = await fetch('/api/payments/card-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txnId }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to confirm payment')
        }

        setStep('success')
        toast.success('Payment successful! Pro plan activated.')
      } catch (error) {
        console.error('[CardPayment] Confirm error:', error)
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to confirm payment'
        )
        setStep('error')
      }
    },
    []
  )

  const handlePayWithCard = useCallback(async () => {
    if (!window.GammalTech) {
      toast.error('Payment system is loading. Please try again.')
      return
    }

    try {
      // Step 1: Login if needed
      if (!window.GammalTech.isLoggedIn()) {
        setStep('logging-in')
        await window.GammalTech.login()

        // Verify login succeeded
        if (!window.GammalTech.isLoggedIn()) {
          setStep('ready')
          toast.error('Login was cancelled. Please try again.')
          return
        }
      }

      // Step 2: Initiate card payment
      setStep('paying')
      window.GammalTech.payCard(
        amount,
        'IQD',
        'work.krd Pro Plan - Monthly Subscription',
        (txnId: string) => {
          // This callback fires when payment is delivered
          confirmPayment(txnId)
        }
      )
    } catch (error) {
      console.error('[CardPayment] Payment error:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Payment failed. Please try again.'
      )
      setStep('error')
    }
  }, [amount, confirmPayment])

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        src="https://api.gammal.tech/sdk-web.js"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
        onError={() => {
          console.error('[CardPayment] Failed to load Gammal Tech SDK')
          toast.error('Failed to load payment system')
        }}
      />

      <AppHeader
        title={t('billing.cardPayment.pageTitle') !== 'billing.cardPayment.pageTitle'
          ? t('billing.cardPayment.pageTitle')
          : 'Card Payment'}
        showBackButton={true}
        backButtonText={t('billing.pay.backToBilling')}
        backButtonHref="/billing"
      />

      <main className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        {/* Success State */}
        {step === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Your Pro plan is now active. Enjoy all premium features!
            </p>
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => router.push('/billing')}
              >
                View Billing
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-500 mb-2">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              If money was deducted, it will be recovered automatically on your next visit.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base"
                onClick={() => {
                  setStep('ready')
                  setErrorMessage('')
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => router.push('/billing')}
              >
                Back to Billing
              </Button>
            </div>
          </div>
        )}

        {/* Ready / Loading / Paying States */}
        {step !== 'success' && step !== 'error' && (
          <div>
            {/* Plan Summary Card */}
            <Card className="p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Pro Plan</h2>
                  <p className="text-sm text-gray-500">Monthly Subscription</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-600">Total</span>
                  <div className="text-right">
                    {hasReferralDiscount ? (
                      <>
                        <span className="text-lg line-through text-gray-400 mr-2">
                          5,000 IQD
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          4,000 IQD
                        </span>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1 justify-end">
                          <Tag className="h-3.5 w-3.5" />
                          {t('referral.discountApplied') !== 'referral.discountApplied'
                            ? t('referral.discountApplied')
                            : 'Referral discount applied'}
                        </div>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        5,000 IQD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Button */}
            <Button
              className="w-full h-14 text-base mb-4"
              onClick={handlePayWithCard}
              disabled={!sdkLoaded || step === 'logging-in' || step === 'paying' || step === 'confirming'}
            >
              {!sdkLoaded ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading payment system...
                </>
              ) : step === 'logging-in' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : step === 'paying' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing payment...
                </>
              ) : step === 'confirming' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Activating Pro plan...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay {hasReferralDiscount ? '4,000' : '5,000'} IQD with Card
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg">
              <Shield className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Payments are processed securely by Gammal Tech. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
