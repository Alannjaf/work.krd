'use client'

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/shared/AppHeader'
import { Copy, CheckCircle, Info, Smartphone, Clock, HelpCircle, CheckCheck, ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { translatePlanFeatures } from '@/lib/translate-features'

interface Plan {
  name: string
  price: number
  priceIQD: number
  description: string
  features: string[]
  buttonText: string
  popular: boolean
  available: boolean
}

function PaymentInstructionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { t } = useLanguage()
  const [copied, setCopied] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const planType = searchParams.get('plan') || 'basic'

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/pricing')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans)
        }
      } catch (error) {
        console.error('[PaymentInstructions] Failed to fetch pricing:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  const selectedPlan = plans.find(p => p.name.toLowerCase() === planType) || plans.find(p => p.name === 'Basic')

  const paymentInfo = {
    bankName: 'First Iraqi Bank (FIB)',
    accountName: 'Alan Jaf',
    accountNumber: '07504910348',
    notes: `ResumeAI ${selectedPlan?.name || 'Basic'} - ${user?.emailAddresses[0]?.emailAddress}`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        title={t('billing.paymentInstructions.pageTitle')}
        showBackButton={true}
        backButtonText={t('billing.paymentInstructions.buttons.backToBilling')}
        backButtonHref="/billing"
      >
        <Badge variant="secondary" className="flex items-center gap-1">
          <Smartphone className="h-3 w-3" />
          {t('billing.paymentInstructions.mobileBanking')}
        </Badge>
      </AppHeader>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">{t('billing.paymentInstructions.loading')}</p>
          </div>
        ) : selectedPlan ? (
          <>
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">{t('billing.paymentInstructions.progressSteps.review')}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">{t('billing.paymentInstructions.progressSteps.payment')}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">{t('billing.paymentInstructions.progressSteps.activation')}</span>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('billing.paymentInstructions.upgradeTitle', { 
                    plan: selectedPlan?.name === 'Free' ? t('pricing.plans.free.name') : 
                          selectedPlan?.name === 'Basic' ? t('pricing.plans.basic.name') : 
                          selectedPlan?.name === 'Pro' ? t('pricing.plans.pro.name') : selectedPlan?.name 
                  })}
                </h1>
                <p className="text-gray-600">{t('billing.paymentInstructions.followSteps')}</p>
              </div>
            </div>

            {/* Step 1: Review Your Plan */}
            <Card className="p-6 mb-6 border-l-4 border-l-primary">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('billing.paymentInstructions.step1.title')}</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('billing.paymentInstructions.step1.planType', { 
                        plan: selectedPlan.name === 'Free' ? t('pricing.plans.free.name') : 
                              selectedPlan.name === 'Basic' ? t('pricing.plans.basic.name') : 
                              selectedPlan.name === 'Pro' ? t('pricing.plans.pro.name') : selectedPlan.name 
                      })}
                    </h3>
                    <p className="text-gray-600">{t('billing.paymentInstructions.step1.monthlySubscription')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{selectedPlan.priceIQD.toLocaleString()} IQD</div>
                    <div className="text-sm text-gray-600">{t('billing.paymentInstructions.step1.perMonth')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {translatePlanFeatures(selectedPlan.features, t, 'pricing').map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Step 2: Make Your Payment */}
            <Card className="p-6 mb-6 border-l-4 border-l-primary">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('billing.paymentInstructions.step2.title')}</h2>
              </div>

              {/* Integrated Payment Steps with Account Details */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-4">
                  <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">{t('billing.paymentInstructions.step2.fibTitle')}</h3>
                </div>

                {/* Step 1: Open FIB App */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{t('billing.paymentInstructions.step2.step1Title')}</p>
                        <p className="text-sm text-blue-700">{t('billing.paymentInstructions.step2.step1Desc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Navigate to Transfer */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{t('billing.paymentInstructions.step2.step2Title')}</p>
                        <p className="text-sm text-blue-700">{t('billing.paymentInstructions.step2.step2Desc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Enter Account Details */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{t('billing.paymentInstructions.step2.step3Title')}</p>
                        <p className="text-sm text-blue-700">{t('billing.paymentInstructions.step2.step3Desc')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 ml-11">
                      {/* Bank Name */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('billing.paymentInstructions.step2.bankName')}</p>
                          <p className="font-medium text-gray-900">{paymentInfo.bankName}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.bankName, 'bank')}
                        >
                          {copied === 'bank' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Account Name */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('billing.paymentInstructions.step2.recipientName')}</p>
                          <p className="font-medium text-gray-900">{paymentInfo.accountName}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.accountName, 'name')}
                        >
                          {copied === 'name' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Account Number */}
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('billing.paymentInstructions.step2.accountNumber')}</p>
                          <p className="font-medium text-lg text-gray-900">{paymentInfo.accountNumber}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.accountNumber, 'number')}
                        >
                          {copied === 'number' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Amount */}
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded border border-primary/20">
                        <div>
                          <p className="text-xs text-primary/70 uppercase tracking-wide font-medium">{t('billing.paymentInstructions.step2.transferAmount')}</p>
                          <p className="font-bold text-2xl text-primary">{selectedPlan.priceIQD.toLocaleString()} IQD</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${selectedPlan.priceIQD.toLocaleString()}`, 'amount')}
                        >
                          {copied === 'amount' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Add Reference */}
                  <div className="bg-white rounded-lg p-4 border border-yellow-300">
                    <div className="flex items-start space-x-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900">{t('billing.paymentInstructions.step2.step4Title')}</p>
                        <p className="text-sm text-yellow-700">{t('billing.paymentInstructions.step2.step4Desc')}</p>
                      </div>
                    </div>
                    
                    <div className="ml-11">
                      <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-yellow-600 uppercase tracking-wide font-medium mb-1 flex items-center">
                              <Info className="h-3 w-3 mr-1" />
                              {t('billing.paymentInstructions.step2.copyExactly')}
                            </p>
                            <p className="font-medium text-yellow-900 text-lg">{paymentInfo.notes}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(paymentInfo.notes, 'notes')}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            {copied === 'notes' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Step Summary */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-900">{t('billing.paymentInstructions.step2.doubleCheck')}</p>
                  </div>
                  <p className="text-sm text-green-700 mt-1 ml-7">{t('billing.paymentInstructions.step2.checkDetails')}</p>
                </div>
              </div>
            </Card>

            {/* Step 3: Wait for Activation */}
            <Card className="p-6 mb-6 border-l-4 border-l-gray-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t('billing.paymentInstructions.step3.title')}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{t('billing.paymentInstructions.step3.verify')}</p>
                    <p className="text-sm text-gray-600">{t('billing.paymentInstructions.step3.verifyDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCheck className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{t('billing.paymentInstructions.step3.activate')}</p>
                    <p className="text-sm text-gray-600">{t('billing.paymentInstructions.step3.activateDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{t('billing.paymentInstructions.step3.email')}</p>
                    <p className="text-sm text-gray-600">
                      {t('billing.paymentInstructions.step3.emailDesc', { 
                        plan: selectedPlan.name === 'Free' ? t('pricing.plans.free.name') : 
                              selectedPlan.name === 'Basic' ? t('pricing.plans.basic.name') : 
                              selectedPlan.name === 'Pro' ? t('pricing.plans.pro.name') : selectedPlan.name 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQ Section */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <HelpCircle className="h-5 w-5 mr-2" />
                {t('billing.paymentInstructions.faq.title')}
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 mb-1">{t('billing.paymentInstructions.faq.q1')}</p>
                  <p className="text-gray-600">{t('billing.paymentInstructions.faq.a1')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">{t('billing.paymentInstructions.faq.q2')}</p>
                  <p className="text-gray-600">{t('billing.paymentInstructions.faq.a2')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">{t('billing.paymentInstructions.faq.q3')}</p>
                  <p className="text-gray-600">{t('billing.paymentInstructions.faq.a3')}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/billing')}
                className="order-2 sm:order-1"
              >
                {t('billing.paymentInstructions.buttons.backToPlans')}
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="order-1 sm:order-2"
              >
                {t('billing.paymentInstructions.buttons.paymentSent')}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('billing.paymentInstructions.planNotFound')}</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/billing')}
            >
              {t('billing.paymentInstructions.buttons.backToBilling')}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentInstructionsContent />
    </Suspense>
  )
}