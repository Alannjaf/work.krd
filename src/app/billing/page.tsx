'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/shared/AppHeader'
import { Check, Clock, Star, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
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
  current?: boolean
  period?: string
  limitations?: string[]
}

// Removed unused UserStats interface

export default function BillingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pricing plans
        const pricingResponse = await fetch('/api/pricing')
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json()
          // Enhance API data with billing-specific properties
          const enhancedPlans = pricingData.plans.map((plan: Plan) => ({
            ...plan,
            period: plan.price === 0 ? 'forever' : 'month',
            limitations: plan.name === 'Free' 
              ? ['Limited AI suggestions', 'Basic templates only', 'No premium features']
              : plan.name === 'Basic'
              ? ['Limited AI usage per month', 'Standard export options']
              : []
          }))
          setPlans(enhancedPlans)
        }

        // Update current plan in plans array based on subscription context
        if (subscription) {
          setPlans(prev => prev.map(plan => ({
            ...plan,
            current: plan.name === subscription.plan
          })))
        }
      } catch (error) {
        console.error('[Billing] Failed to fetch billing data:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [subscription])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        title={t('billing.title')}
        showBackButton={true}
        backButtonText={t('pages.resumeBuilder.backToDashboard')}
        backButtonHref="/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('billing.title')}</h1>
          <p className="text-gray-600">{t('billing.subtitle')}</p>
        </div>

        {/* Manual Payment Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-green-900">{t('billing.manualPayment.title')}</h2>
              <p className="text-green-700 mt-1">{t('billing.manualPayment.description')}</p>
            </div>
          </div>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('billing.currentPlan.title')}</h3>
                <p className="text-gray-600">{t('billing.currentPlan.description', { plan: subscription.plan })}</p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {t('billing.currentPlan.planBadge', { plan: subscription.plan })}
              </Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.resumeCount}/{subscription.resumeLimit === -1 ? '∞' : subscription.resumeLimit}
                </div>
                <div className="text-sm text-gray-600">{t('billing.currentPlan.stats.resumesUsed')}</div>
                {subscription.resumeLimit !== -1 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((subscription.resumeCount / subscription.resumeLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.aiUsageCount}/{subscription.aiUsageLimit === -1 ? '∞' : subscription.aiUsageLimit}
                </div>
                <div className="text-sm text-gray-600">{t('billing.currentPlan.stats.aiUsage')}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: subscription.aiUsageLimit === -1 
                        ? '100%' 
                        : `${Math.min((subscription.aiUsageCount / subscription.aiUsageLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.exportCount}/{subscription.exportLimit === -1 ? '∞' : subscription.exportLimit}
                </div>
                <div className="text-sm text-gray-600">{t('billing.currentPlan.stats.pdfExports')}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: subscription.exportLimit === -1 
                        ? '100%' 
                        : `${Math.min((subscription.exportCount / subscription.exportLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.resumeImportsCount}/{subscription.resumeImportsLimit === -1 ? '∞' : subscription.resumeImportsLimit}
                </div>
                <div className="text-sm text-gray-600">{t('billing.currentPlan.stats.resumeImports')}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ 
                      width: subscription.resumeImportsLimit === -1 
                        ? '100%' 
                        : `${Math.min((subscription.resumeImportsCount / subscription.resumeImportsLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        {loading || subscriptionLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">{t('billing.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`p-6 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Star className="h-3 w-3 mr-1" />
                    {t('common.mostPopular')}
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name === 'Free' ? t('pricing.plans.free.name') : 
                     plan.name === 'Basic' ? t('pricing.plans.basic.name') : 
                     plan.name === 'Pro' ? t('pricing.plans.pro.name') : plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? t('pricing.plans.free.name') : `${plan.priceIQD.toLocaleString()} IQD`}
                    </span>
                    {plan.period !== 'forever' && <span className="text-gray-600">/{t('pricing.monthly')}</span>}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {plan.name === 'Free' ? t('pricing.plans.free.description') : 
                     plan.name === 'Basic' ? t('pricing.plans.basic.description') : 
                     plan.name === 'Pro' ? t('pricing.plans.pro.description') : plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {translatePlanFeatures(plan.features, t, 'pricing').map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t('billing.currentPlan.currentPlanButton')}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => router.push(`/billing/payment-instructions?plan=${plan.name.toLowerCase()}`)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('billing.upgradeNow')}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('billing.paymentMethods.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg opacity-60">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">FIB</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t('billing.paymentMethods.fib.name')}</h4>
                <p className="text-sm text-gray-600">{t('billing.paymentMethods.fib.description')}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {t('billing.paymentMethods.soon')}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg opacity-60">
              <div className="w-12 h-8 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">NP</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t('billing.paymentMethods.nasspay.name')}</h4>
                <p className="text-sm text-gray-600">{t('billing.paymentMethods.nasspay.description')}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {t('billing.paymentMethods.soon')}
              </Badge>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('billing.paymentNote')}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}