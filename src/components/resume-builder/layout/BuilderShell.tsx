'use client'

import React from 'react'

interface BuilderShellProps {
  header: React.ReactNode
  progressBar: React.ReactNode
  sidebar: React.ReactNode
  form: React.ReactNode
  preview: React.ReactNode
  mobileNav: React.ReactNode
  mobilePreview: React.ReactNode
}

export function BuilderShell({
  header,
  progressBar,
  sidebar,
  form,
  preview,
  mobileNav,
  mobilePreview,
}: BuilderShellProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      {header}

      {/* Completion progress bar */}
      {progressBar}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon sidebar - desktop */}
        {sidebar}

        {/* Form panel */}
        <div className="flex-1 lg:max-w-[560px] overflow-y-auto bg-white">
          <div className="p-6 pb-20 lg:pb-6">
            {form}
          </div>
        </div>

        {/* Preview panel - desktop */}
        <div className="hidden lg:block flex-1 bg-gray-100 relative overflow-hidden">
          {preview}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {mobileNav}

      {/* Mobile preview sheet */}
      {mobilePreview}
    </div>
  )
}
