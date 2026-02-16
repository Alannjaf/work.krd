'use client'

// NOTE: i18n cannot be applied here — this is a React class component
// and cannot use the useLanguage() hook. Error boundary strings remain
// in English. The i18n keys exist at pages.admin.errorBoundary.* for
// future use if this is refactored to a functional component with
// react-error-boundary or similar.

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { devError } from '@/lib/admin-utils'

interface AdminErrorBoundaryProps {
  children: ReactNode
  sectionName: string
}

interface AdminErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    devError(`[AdminErrorBoundary] ${this.props.sectionName} crashed:`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-6 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                {this.props.sectionName} failed to render
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                An unexpected error occurred in this section. Other sections are unaffected.
              </p>
              {this.state.error && (
                <p className="text-xs text-red-500 mt-2 font-mono truncate">
                  {this.state.error.message}
                </p>
              )}
              <button
                type="button"
                onClick={this.handleRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
