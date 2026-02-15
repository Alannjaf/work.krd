'use client'

import { useEffect, useState, useRef } from 'react'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

// Function to translate plan data
const translatePlan = (plan: Plan, t: (key: string, values?: Record<string, string | number>) => string) => {
  return {
    ...plan,
    name: plan.name === 'Free' ? t('pricing.plans.free.name') :
          plan.name === 'Pro' ? t('pricing.plans.pro.name') : plan.name,
    description: plan.name === 'Free' ? t('pricing.plans.free.description') :
                plan.name === 'Pro' ? t('pricing.plans.pro.description') : plan.description,
    buttonText: plan.name === 'Free' ? t('pricing.plans.free.buttonText') :
               plan.name === 'Pro' ? t('pricing.plans.pro.buttonText') : plan.buttonText,
    features: translatePlanFeatures(plan.features, t, 'pricing')
  }
}

function PricingCard({ plan, index, isVisible }: { plan: Plan, index: number, isVisible: boolean }) {
  const { t } = useLanguage()
  const translatedPlan = translatePlan(plan, t)

  return (
    <Card 
      className={`
        relative overflow-hidden border-2 transition-all duration-500 transform
        ${translatedPlan.popular 
          ? 'border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' 
          : 'border-gray-200 shadow-lg hover:shadow-xl'
        }
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        hover:scale-105 hover:-translate-y-1
        group
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {translatedPlan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg">
            <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
            {t('pricing.mostPopular')}
          </div>
        </div>
      )}

      {/* Gradient accent for popular plan */}
      {translatedPlan.popular && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
      )}
      
      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {translatedPlan.name}
        </CardTitle>
        <div className="mt-4">
          <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
            {translatedPlan.price === 0 ? t('pricing.plans.free.name') : `${translatedPlan.priceIQD.toLocaleString()} IQD`}
          </span>
          {translatedPlan.price > 0 && (
            <span className="text-gray-600 ml-2 text-lg">
              /{t('pricing.monthly')}
            </span>
          )}
        </div>
        <CardDescription className="mt-3 text-base">
          {translatedPlan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {translatedPlan.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start group/item">
              <div className="mt-0.5 mr-3 flex-shrink-0">
                <Check className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform" />
              </div>
              <span className="text-gray-700 leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <Button 
          variant={translatedPlan.name === t('pricing.plans.free.name') ? 'outline' : 'default'}
          size="lg"
          className={`
            w-full font-semibold transition-all duration-200
            ${translatedPlan.popular 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50' 
              : ''
            }
            hover:scale-105
          `}
          onClick={() => {
            if (plan.name === 'Free') {
              window.location.href = '/sign-up'
            } else {
              window.location.href = '/billing'
            }
          }}
        >
          {translatedPlan.buttonText}
        </Button>
      </CardFooter>

      {/* Hover effect overlay */}
      {!translatedPlan.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none"></div>
      )}
    </Card>
  )
}

export function Pricing() {
  const { t } = useLanguage()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/pricing')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans)
          setVisibleCards(new Array(data.plans.length).fill(false))
        }
      } catch (error) {
        console.error('[Pricing] Failed to fetch pricing:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(new Array(plans.length).fill(true))
          }
        })
      },
      { threshold: 0.1 }
    )

    const currentRef = sectionRef.current
    if (currentRef && plans.length > 0) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [plans.length])

  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900">
              {t('pricing.title')}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t('pricing.subtitle')}
          </p>
          
          {/* Payment Available Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{t('pricing.manualPaymentFib')}</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                index={index}
                isVisible={visibleCards[index] || false}
              />
            ))}
          </div>
        )}

        {/* Payment Methods */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-600 mb-6 font-medium">
            {t('pricing.paymentMethods.title')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 opacity-60">
            <div className="bg-white px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium shadow-sm relative hover:shadow-md transition-shadow">
              {t('pricing.paymentMethods.fib')}
              <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">{t('pricing.paymentMethods.soon')}</div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium shadow-sm relative hover:shadow-md transition-shadow">
              {t('pricing.paymentMethods.nasspay')}
              <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">{t('pricing.paymentMethods.soon')}</div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium shadow-sm opacity-30">
              {t('pricing.paymentMethods.visa')}
            </div>
            <div className="bg-white px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium shadow-sm opacity-30">
              {t('pricing.paymentMethods.mastercard')}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-10 text-gray-900">{t('pricing.faq.title')}</h3>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2 text-gray-900">{t('pricing.faq.items.switchPlans.question')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{t('pricing.faq.items.switchPlans.answer')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2 text-gray-900">{t('pricing.faq.items.languages.question')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{t('pricing.faq.items.languages.answer')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2 text-gray-900">{t('pricing.faq.items.freeTrial.question')}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{t('pricing.faq.items.freeTrial.answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
