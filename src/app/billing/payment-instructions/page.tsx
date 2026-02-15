'use client'

import { useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  Copy,
  CheckCircle,
  Upload,
  ImageIcon,
  X,
  Crown,
  Loader2,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

const PAYMENT_PHONE = '0750 491 0348'
const PAYMENT_PHONE_RAW = '07504910348'
const PAYMENT_NAME = 'Alan Ahmed'
const PAYMENT_AMOUNT = '5,000'
const PAYMENT_AMOUNT_RAW = '5000'

const TOTAL_STEPS = 4

// ── Progress Dots ──────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-8 bg-primary'
              : i + 1 < current
                ? 'w-2.5 bg-primary'
                : 'w-2.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { t } = useLanguage()

  const plan = (searchParams.get('plan') || 'PRO').toUpperCase()
  const userEmail = user?.emailAddresses[0]?.emailAddress || ''

  const [currentStep, setCurrentStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Step transition helper ──
  const goToStep = useCallback((step: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsTransitioning(false)
    }, 150)
  }, [])

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    toast.success(t('billing.pay.copied'))
    setTimeout(() => setCopied(null), 2000)
  }, [t])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('billing.pay.invalidFile'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('billing.pay.fileTooLarge'))
      return
    }
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [t])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [previewUrl])

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error(t('billing.pay.noFile'))
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('plan', plan)
      formData.append('screenshot', selectedFile)

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit payment')
      }

      toast.success(t('billing.pay.submitSuccess'))
      goToStep(4)
    } catch (error) {
      console.error('[Payment] Submit error:', error)
      toast.error(
        error instanceof Error ? error.message : t('billing.pay.submitError')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const proFeatures = [
    t('billing.proPlan.feature1'),
    t('billing.proPlan.feature2'),
    t('billing.proPlan.feature3'),
    t('billing.proPlan.feature4'),
    t('billing.proPlan.feature5'),
    t('billing.proPlan.feature6'),
    t('billing.proPlan.feature7'),
    t('billing.proPlan.feature8'),
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        title={t('billing.pay.pageTitle')}
        showBackButton={true}
        backButtonText={t('billing.pay.backToBilling')}
        backButtonHref="/billing"
      />

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-lg">
          <ProgressDots current={currentStep} total={TOTAL_STEPS} />

          <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

            {/* ── Step 1: Plan Details ── */}
            {currentStep === 1 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('billing.pay.wizard.step1Title')}
                </h1>
                <p className="text-gray-500 mb-6">
                  {t('billing.pay.wizard.step1Subtitle')}
                </p>

                {/* Price card */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 mb-6 border border-primary/10">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-1">
                    {t('billing.proPlan.price')} <span className="text-lg font-medium text-primary/70">{t('billing.proPlan.currency')}</span>
                  </div>
                  <div className="text-gray-500 mb-4">
                    /{t('billing.proPlan.perMonth')}
                  </div>

                  <div className="text-left space-y-2.5">
                    {proFeatures.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full h-12 text-base"
                  onClick={() => goToStep(2)}
                >
                  {t('billing.pay.wizard.next')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* ── Step 2: FIB Payment Instructions ── */}
            {currentStep === 2 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('billing.pay.step2Title')}
                </h1>
                <p className="text-gray-500 mb-6">
                  {t('billing.pay.wizard.step2Subtitle')}
                </p>

                {/* Send instruction - big and clear */}
                <div className="bg-blue-50 rounded-2xl p-5 sm:p-6 mb-5 border border-blue-100 text-left">
                  <p className="text-sm font-medium text-blue-700 mb-4">
                    {t('billing.pay.wizard.sendInstruction')}
                  </p>

                  {/* Phone Number - prominent */}
                  <div className="bg-white rounded-xl p-4 mb-3 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {t('billing.pay.wizard.fibNumber')}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide">
                          {PAYMENT_PHONE}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(PAYMENT_PHONE_RAW, 'phone')}
                        className="flex-shrink-0 ml-3 h-10 w-10 p-0"
                      >
                        {copied === 'phone' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="bg-white rounded-xl p-4 mb-3 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {t('billing.pay.wizard.recipient')}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">{PAYMENT_NAME}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(PAYMENT_NAME, 'name')}
                        className="flex-shrink-0 ml-3 h-10 w-10 p-0"
                      >
                        {copied === 'name' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {t('billing.pay.amount')}
                        </p>
                        <p className="text-xl font-bold text-primary">{PAYMENT_AMOUNT} IQD</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(PAYMENT_AMOUNT_RAW, 'amount')}
                        className="flex-shrink-0 ml-3 h-10 w-10 p-0"
                      >
                        {copied === 'amount' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reference note */}
                {userEmail && (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200 text-left">
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">
                      {t('billing.pay.reference')}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amber-900 break-all">
                        work.krd {plan.toUpperCase()} - {userEmail}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`work.krd ${plan.toUpperCase()} - ${userEmail}`, 'reference')}
                        className="flex-shrink-0 ml-2"
                      >
                        {copied === 'reference' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      {t('billing.pay.importantNote')}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                    onClick={() => goToStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('billing.pay.wizard.back')}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-12 text-base"
                    onClick={() => goToStep(3)}
                  >
                    {t('billing.pay.wizard.next')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Upload Screenshot ── */}
            {currentStep === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('billing.pay.step3Title')}
                </h1>
                <p className="text-gray-500 mb-6">
                  {t('billing.pay.wizard.step3Subtitle')}
                </p>

                {/* Drop Zone */}
                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors mb-6"
                  >
                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {t('billing.pay.dragDrop')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('billing.pay.imageFormats')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="rounded-2xl overflow-hidden border bg-gray-50">
                      {previewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Payment screenshot preview"
                          className="w-full max-h-64 object-contain"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                    onClick={() => goToStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('billing.pay.wizard.back')}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-12 text-base"
                    onClick={handleSubmit}
                    disabled={!selectedFile || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('billing.pay.submitting')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('billing.pay.submitPayment')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {currentStep === 4 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('billing.pay.successTitle')}
                </h1>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {t('billing.pay.wizard.step4Subtitle')}
                </p>

                {/* Review time badge */}
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-full text-sm font-medium mb-8">
                  <Clock className="h-4 w-4" />
                  {t('billing.pay.wizard.reviewTime')}
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full h-12 text-base"
                    onClick={() => router.push('/dashboard')}
                  >
                    {t('billing.pay.goToDashboard')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={() => router.push('/billing')}
                  >
                    {t('billing.pay.backToBilling')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
