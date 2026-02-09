'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Globe, Menu, X, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAdmin } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ckb', name: 'Kurdish', nativeName: 'کوردی' },
] as const

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  onBackClick?: () => void
  children?: React.ReactNode
}

export function AppHeader({ 
  title, 
  showBackButton = false,
  backButtonText = 'Back',
  backButtonHref,
  onBackClick,
  children 
}: AppHeaderProps) {
  const _router = useRouter()
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { isAdmin } = useAdmin()

  const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  
  const changeLanguage = (languageCode: 'en' | 'ar' | 'ckb') => {
    setLanguage(languageCode)
    setIsLangMenuOpen(false)
    setIsMobileMenuOpen(false) // Close mobile menu
  }

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else if (backButtonHref) {
      _router.push(backButtonHref)
    } else {
      _router.back()
    }
  }

  const handleLogoClick = () => {
    _router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2"
              >
                <span>←</span>
                {backButtonText}
              </Button>
            )}
            
            {/* Logo */}
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <Logo />
            </div>
            
            {title && (
              <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
            )}
          </div>

          {/* Center - Custom content */}
          <div className="flex-1 flex justify-center">
            {children}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLangMenu}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === language)?.nativeName}</span>
              </Button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code as 'en' | 'ar' | 'ckb')}
                        className={cn(
                          "block w-full px-4 py-2 text-start text-sm hover:bg-gray-100",
                          language === lang.code && "bg-gray-100"
                        )}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => _router.push('/admin')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                {t('common.admin')}
              </Button>
            )}

            {/* User Button */}
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Language Selector */}
            <div>
              <p className="text-sm font-medium mb-2">{t('common.language')}</p>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code as 'en' | 'ar' | 'ckb')}
                    className={cn(
                      "block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100",
                      language === lang.code && "bg-gray-100"
                    )}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile Admin Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  _router.push('/admin')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-start gap-2"
              >
                <Shield className="h-4 w-4" />
                {t('common.admin')}
              </Button>
            )}

            {/* Mobile User Button */}
            <div className="flex justify-center pt-2">
              <UserButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}