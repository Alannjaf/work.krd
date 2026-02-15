'use client'

import { useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  Copy,
  CheckCircle,
  Upload,
  ImageIcon,
  X,
  Crown,
  Loader2,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

const PAYMENT_PHONE = '0750 770 2073'
const PAYMENT_PHONE_RAW = '07507702073'
const PAYMENT_NAME = 'Alan Ahmed'
const PAYMENT_AMOUNT = '5,000'
const PAYMENT_AMOUNT_RAW = '5000'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { t } = useLanguage()

  const plan = searchParams.get('plan') || 'pro'
  const userEmail = user?.emailAddresses[0]?.emailAddress || ''
  const reference = `work.krd ${plan.toUpperCase()} - ${userEmail}`

  const [copied, setCopied] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }, [])

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

      setSubmitted(true)
      toast.success(t('billing.pay.submitSuccess'))
    } catch (error) {
      console.error('[Payment] Submit error:', error)
      toast.error(
        error instanceof Error ? error.message : t('billing.pay.submitError')
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Success state after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader
          title={t('billing.pay.pageTitle')}
          showBackButton={true}
          backButtonText={t('billing.pay.backToBilling')}
          backButtonHref="/billing"
        />
        <main className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('billing.pay.successTitle')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('billing.pay.successDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/billing')}>
              {t('billing.pay.backToBilling')}
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              {t('billing.pay.goToDashboard')}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title={t('billing.pay.pageTitle')}
        showBackButton={true}
        backButtonText={t('billing.pay.backToBilling')}
        backButtonHref="/billing"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
              1
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 hidden sm:inline">
              {t('billing.pay.planSummary')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
              2
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 hidden sm:inline">
              {t('billing.pay.step2Title')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
              3
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 hidden sm:inline">
              {t('billing.pay.step3Title')}
            </span>
          </div>
        </div>

        {/* Step 1: Plan Summary */}
        <Card className="p-4 sm:p-5 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('billing.pay.planSummary')}
            </h2>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('billing.proPlan.title')}
                </h3>
                <p className="text-xs text-gray-600">
                  {t('billing.pay.allFeaturesIncluded')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {t('billing.proPlan.price')}
              </div>
              <div className="text-xs text-gray-500">
                /{t('billing.proPlan.perMonth')}
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: FIB Payment Details */}
        <Card className="p-4 sm:p-5 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('billing.pay.step2Title')}
            </h2>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
              <QRCodeSVG
                value={PAYMENT_PHONE_RAW}
                size={180}
                level="H"
                includeMargin={true}
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                {t('billing.pay.scanQR')}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            {/* Account Name */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('billing.pay.accountName')}
                </p>
                <p className="font-medium text-gray-900">{PAYMENT_NAME}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(PAYMENT_NAME, 'name')}
                className="flex-shrink-0 ml-2"
              >
                {copied === 'name' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Phone Number */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('billing.pay.phoneNumber')}
                </p>
                <p className="font-medium text-gray-900 text-lg tracking-wide">
                  {PAYMENT_PHONE}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(PAYMENT_PHONE, 'phone')}
                className="flex-shrink-0 ml-2"
              >
                {copied === 'phone' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-primary/70 uppercase tracking-wide font-medium">
                  {t('billing.pay.amount')}
                </p>
                <p className="font-bold text-xl text-primary">
                  {PAYMENT_AMOUNT} IQD
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(PAYMENT_AMOUNT_RAW, 'amount')}
                className="flex-shrink-0 ml-2"
              >
                {copied === 'amount' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Reference */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">
                  {t('billing.pay.reference')}
                </p>
                <p className="font-medium text-yellow-900 text-sm break-all">
                  {reference}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(reference, 'reference')}
                className="flex-shrink-0 ml-2"
              >
                {copied === 'reference' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            {t('billing.pay.instructions')}
          </p>
        </Card>

        {/* Step 3: Upload Screenshot */}
        <Card className="p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('billing.pay.step3Title')}
            </h2>
          </div>

          {/* Drop Zone */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {t('billing.pay.dragDrop')}
              </p>
              <p className="text-xs text-gray-500">
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
            <div className="relative">
              <div className="rounded-lg overflow-hidden border bg-gray-50">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Payment screenshot preview"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-3 p-2 bg-gray-50 rounded-lg">
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

          {/* Submit Button */}
          <Button
            className="w-full mt-4"
            size="lg"
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
        </Card>
      </main>
    </div>
  )
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
