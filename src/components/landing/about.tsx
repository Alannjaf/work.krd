'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Users, Target, Zap, CheckCircle } from 'lucide-react'

export function About() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<{ resumeCount: number; userCount: number } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => {
        setStats({ resumeCount: 0, userCount: 0 })
        setVisible(true)
      })
  }, [])

  const statItems = [
    { value: stats ? stats.userCount.toLocaleString() : '—', label: t('about.stats.users') },
    { value: stats ? stats.resumeCount.toLocaleString() : '—', label: t('about.stats.resumes') },
    { value: '3', label: t('about.stats.languages') },
    { value: '24/7', label: t('about.stats.support') },
  ]

  const values = [
    {
      icon: Users,
      title: t('about.values.community.title'),
      description: t('about.values.community.description')},
    {
      icon: Target,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description')},
    {
      icon: Zap,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description')},
    {
      icon: CheckCircle,
      title: t('about.values.success.title'),
      description: t('about.values.success.description')},
  ]

  return (
    <section id="about" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease-in' }}
        >
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <value.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
