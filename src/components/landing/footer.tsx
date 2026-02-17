'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import Link from 'next/link'

const languages = [
  { code: 'en' as const, nativeName: 'English' },
  { code: 'ar' as const, nativeName: 'العربية' },
  { code: 'ckb' as const, nativeName: 'کوردی' },
]

export function Footer() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Logo + tagline */}
          <div>
            <span className="text-xl font-bold text-white">Work.krd</span>
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              {t('pages.home.footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors">
              {t('pages.home.footer.blog') || 'Blog'}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('pages.home.footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('pages.home.footer.terms')}
            </Link>
          </div>

          {/* Language switcher */}
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-gray-500 mr-1" />
            {languages.map((lang) => (
              <button
                type="button"
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  language === lang.code
                    ? 'text-white bg-gray-800'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          {t('pages.home.footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
