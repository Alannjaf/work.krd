'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Logo } from '@/components/ui/logo'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const languages = [
  { code: 'en' as const, nativeName: 'English' },
  { code: 'ar' as const, nativeName: 'العربية' },
  { code: 'ckb' as const, nativeName: 'کوردی' },
]

export function Header() {
  const { t, language, setLanguage, isRTL } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#templates', label: t('nav.templates') },
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#features', label: t('nav.features') },
    { href: '#pricing', label: t('nav.pricing') },
  ]

  const currentLang = languages.find(l => l.code === language)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang?.nativeName}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                  <div className={`absolute top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 ${isRTL ? 'left-0' : 'right-0'}`}>
                    {languages.map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setIsLangOpen(false) }}
                        className={`w-full px-4 py-2 text-sm transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                          language === lang.code ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <SignedOut>
              <SignInButton>
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                  {t('nav.signIn')}
                </button>
              </SignInButton>
              <SignUpButton>
                <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  {t('nav.signUp')}
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                {t('nav.dashboard')}
              </Link>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            <SignedOut>
              <SignUpButton>
                <button type="button" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  {t('nav.signUp')}
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white pb-4">
            <div className="pt-2 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 px-4">
              <div className="flex gap-2 mb-3">
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsMobileMenuOpen(false) }}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      language === lang.code
                        ? 'border-blue-600 text-blue-600 bg-blue-50 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
              <SignedOut>
                <div className="flex gap-2">
                  <SignInButton>
                    <button type="button" className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                      {t('nav.signIn')}
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button type="button" className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                      {t('nav.signUp')}
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {t('nav.dashboard')}
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
