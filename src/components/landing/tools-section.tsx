'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Layout, Globe2, Palette, Sparkles, Check } from 'lucide-react'

const tabs = [
  { key: 'builder', icon: Layout, color: 'text-blue-600 bg-blue-50' },
  { key: 'multilingual', icon: Globe2, color: 'text-purple-600 bg-purple-50' },
  { key: 'templates', icon: Palette, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'ai', icon: Sparkles, color: 'text-orange-600 bg-orange-50' },
]

export function ToolsSection() {
  const { t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState('builder')
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const activeTabData = tabs.find(tab => tab.key === activeTab) || tabs[0]
  const ActiveIcon = activeTabData.icon

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('pages.home.toolsSection.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('pages.home.toolsSection.subtitle')}
          </p>
        </div>

        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mobile: horizontal tabs */}
          <div className="flex lg:hidden gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(`pages.home.toolsSection.tabs.${tab.key}.title`)}
                </button>
              )
            })}
          </div>

          {/* Desktop: sidebar tabs + content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop sidebar tabs */}
            <div className="hidden lg:flex flex-col gap-2 w-72 flex-shrink-0">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${
                      isActive
                        ? `bg-blue-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-blue-600`
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                      {t(`pages.home.toolsSection.tabs.${tab.key}.title`)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Content area */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-8 sm:p-10 min-h-[320px]">
              <div key={activeTab} className="animate-fadeIn">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${activeTabData.color} mb-6`}>
                  <ActiveIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t(`pages.home.toolsSection.tabs.${activeTab}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 max-w-lg">
                  {t(`pages.home.toolsSection.tabs.${activeTab}.desc`)}
                </p>
                <ul className="space-y-3">
                  {['f1', 'f2', 'f3'].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{t(`pages.home.toolsSection.tabs.${activeTab}.${f}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
