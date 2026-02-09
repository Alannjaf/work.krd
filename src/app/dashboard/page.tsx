'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppHeader } from '@/components/shared/AppHeader'
import { Plus, Settings, Edit, Trash2, Calendar, Upload, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface Resume {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  personalInfo: {
    fullName: string
    email: string
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch('/api/resumes')
        if (response.ok) {
          const data = await response.json()
          setResumes(data.resumes || [])
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch resumes:', error);
      } finally {
        setIsLoading(false)
      }
    }

    fetchResumes()
  }, [])

  const handleDeleteResume = async (resumeId: string) => {
    // Show a warning toast with confirmation
    toast.custom(
      (toastData) => (
        <div className={`${
          toastData.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t('pages.dashboard.resumes.deleteConfirm.title')}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t('pages.dashboard.resumes.deleteConfirm.description')}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      toast.dismiss(toastData.id)
                      setDeletingId(resumeId)
                      try {
                        const response = await fetch(`/api/resumes/${resumeId}`, {
                          method: 'DELETE'
                        })

                        if (response.ok) {
                          setResumes(resumes.filter(resume => resume.id !== resumeId))
                          toast.success(t('pages.dashboard.resumes.messages.deleteSuccess'))
                        } else {
                          toast.error(t('pages.dashboard.resumes.messages.deleteError'))
                        }
                      } catch (error) {
                        console.error('[Dashboard] Failed to delete resume:', error);
                        toast.error(t('pages.dashboard.resumes.messages.deleteErrorGeneric'))
                      } finally {
                        setDeletingId(null)
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {t('pages.dashboard.resumes.deleteConfirm.confirm')}
                  </button>
                  <button
                    onClick={() => toast.dismiss(toastData.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('pages.dashboard.resumes.deleteConfirm.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center'}
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title={t('pages.dashboard.title')} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('pages.dashboard.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{t('pages.dashboard.subtitle')}</p>
        </div>

        {/* Mobile: Resumes First, Desktop: Normal Order */}
        <div className="flex flex-col">
          {/* Recent Resumes - Shows first on mobile */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 order-1 lg:order-2 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('pages.dashboard.resumes.title')}</h2>
            <Button
              onClick={() => router.push('/resume-builder')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('pages.dashboard.resumes.newResume')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              <span className="ml-3 text-gray-600">{t('pages.dashboard.resumes.loading')}</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('pages.dashboard.resumes.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('pages.dashboard.resumes.empty.description')}</p>
              <div className="mt-6">
                <Button onClick={() => router.push('/resume-builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pages.dashboard.resumes.empty.button')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <Card key={resume.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{resume.title}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {resume.personalInfo?.fullName || 'Untitled Resume'}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/resume-builder?id=${resume.id}`)}
                        className="h-8 w-8 p-0"
                        title={t('pages.dashboard.resumes.actions.editResume')}
                        aria-label={t('pages.dashboard.resumes.actions.editResume')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResume(resume.id)}
                        disabled={deletingId === resume.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={t('pages.dashboard.resumes.actions.deleteResume')}
                        aria-label={t('pages.dashboard.resumes.actions.deleteResume')}
                      >
                        {deletingId === resume.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{t('pages.dashboard.resumes.updated').replace('{date}', formatDate(resume.updatedAt))}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/resume-builder?id=${resume.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('pages.dashboard.resumes.actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open preview modal with the resume data
                        router.push(`/resume-builder?id=${resume.id}&preview=true`)
                      }}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t('pages.dashboard.resumes.actions.preview')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>

          {/* Quick Actions - Shows second on mobile, first on desktop */}
          <div className="order-2 lg:order-1 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pages.dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              <Button 
                className="h-20 sm:h-32 flex flex-col items-center justify-center space-y-1 sm:space-y-2 text-sm sm:text-base"
                onClick={() => router.push('/resume-builder')}
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-medium">{t('pages.dashboard.cards.newResume')}</span>
              </Button>

              <Button 
                variant="outline"
                className="h-20 sm:h-32 flex flex-col items-center justify-center space-y-1 sm:space-y-2 text-sm sm:text-base"
                onClick={() => router.push('/resume-builder/import')}
              >
                <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-medium">{t('pages.dashboard.cards.importResume')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 sm:h-32 flex flex-col items-center justify-center space-y-1 sm:space-y-2 text-sm sm:text-base col-span-2 sm:col-span-1"
                onClick={() => router.push('/billing')}
              >
                <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-medium">{t('pages.dashboard.cards.billing')}</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}