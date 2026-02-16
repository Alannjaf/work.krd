'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export function AdminThemeToggle() {
  const [dark, setDark] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem('admin-theme')
    const isDark = stored === 'dark'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('admin-theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} type="button" aria-label={dark ? t('pages.admin.themeToggle.lightMode') : t('pages.admin.themeToggle.darkMode')} className="text-muted-foreground">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
