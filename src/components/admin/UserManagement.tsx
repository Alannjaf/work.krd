'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/Pagination'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  Search,
  RefreshCw,
  User,
  Mail,
  Calendar,
  CreditCard,
  Check,
  Crown,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { useDebounce } from '@/hooks/useDebounce'
import { PLAN_NAMES, VALID_PLANS } from '@/lib/constants'

const LIMIT = 20

interface UserData {
  id: string
  clerkId: string
  email: string
  name: string | null
  role: string
  createdAt: string
  subscription: {
    plan: string
    status: string
    endDate: string | null
    resumeCount: number
    aiUsageCount: number
    exportCount: number
    importCount: number
    atsUsageCount: number
  } | null
}

export function UserManagement() {
  const { csrfFetch } = useCsrfToken()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [plan, setPlan] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<'upgrade' | 'downgrade' | null>(null)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(LIMIT))
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (plan) params.set('plan', plan)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await csrfFetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotal(data.total)
        setTotalPages(Math.max(1, Math.ceil(data.total / LIMIT)))
      }
    } catch (error) {
      console.error('[UserManagement] Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [csrfFetch, page, debouncedSearch, plan, dateFrom, dateTo])

  // Fetch users whenever fetchUsers dependencies change
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, plan, dateFrom, dateTo])

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds([])
  }, [page])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBulkConfirm) {
          setShowBulkConfirm(false)
          setBulkAction(null)
        } else {
          setShowUpgradeModal(false)
          setSelectedUser(null)
        }
      }
    }
    if (showUpgradeModal || showBulkConfirm) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showUpgradeModal, showBulkConfirm])

  const upgradeUserPlan = async (userId: string, newPlan: string) => {
    setUpgrading(true)
    try {
      const response = await csrfFetch(`/api/admin/users/${userId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      })

      if (response.ok) {
        toast.success('User plan updated successfully!')
        setShowUpgradeModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error('Failed to update user plan')
      }
    } catch (error) {
      console.error('[UserManagement] Failed to update user plan:', error)
      toast.error('Error updating user plan')
    } finally {
      setUpgrading(false)
    }
  }

  // Bulk selection handlers
  const handleSelectUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === users.length
        ? []
        : users.map((user) => user.id)
    )
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return

    setBulkProcessing(true)
    try {
      const response = await csrfFetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedIds, action: bulkAction })
      })

      if (response.ok) {
        const data = await response.json()
        const actionLabel = bulkAction === 'upgrade' ? 'upgraded to PRO' : 'downgraded to FREE'
        toast.success(`${data.successCount} user(s) ${actionLabel}${data.failureCount > 0 ? ` (${data.failureCount} failed)` : ''}`)
        setSelectedIds([])
        fetchUsers()
      } else {
        toast.error('Failed to process bulk action')
      }
    } catch (error) {
      console.error('[UserManagement] Failed to process bulk action:', error)
      toast.error('Error processing bulk action')
    } finally {
      setBulkProcessing(false)
      setShowBulkConfirm(false)
      setBulkAction(null)
    }
  }

  const hasActiveFilters = searchTerm || plan || dateFrom || dateTo

  const clearFilters = () => {
    setSearchTerm('')
    setPlan('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="User Management"
        showBackButton={true}
        backButtonText="Back to Admin Dashboard"
        backButtonHref="/admin"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users and their subscriptions</p>
        </div>

        {/* Search, Filters, and Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + Plan Filter + Refresh */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Plans</option>
                {VALID_PLANS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <Button onClick={fetchUsers} variant="outline" type="button">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Row 2: Date Range + Clear Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex flex-col gap-1">
                  <label htmlFor="dateFrom" className="text-xs font-medium text-gray-500">
                    From date
                  </label>
                  <input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="dateTo" className="text-xs font-medium text-gray-500">
                    To date
                  </label>
                  <input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="ghost" size="sm" type="button" className="text-gray-500">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-blue-700 font-medium">
                {selectedIds.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setBulkAction('upgrade')
                    setShowBulkConfirm(true)
                  }}
                  size="sm"
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Bulk Upgrade to PRO
                </Button>
                <Button
                  onClick={() => {
                    setBulkAction('downgrade')
                    setShowBulkConfirm(true)
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Bulk Downgrade to FREE
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No users found matching your filters.</p>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <input
                type="checkbox"
                checked={selectedIds.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Select all users on this page"
              />
              <span className="text-sm text-gray-600">
                {selectedIds.length === users.length && users.length > 0
                  ? 'Deselect all'
                  : 'Select all on this page'}
              </span>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <Card
                  key={user.id}
                  className={`p-4 sm:p-6 transition-colors ${
                    selectedIds.includes(user.id) ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        aria-label={`Select ${user.name || user.email}`}
                      />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.name || 'No name'}
                          </h3>
                          {user.role === 'ADMIN' && (
                            <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                              <Crown className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                          <span className="flex items-center truncate">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <Badge variant={user.subscription?.plan === PLAN_NAMES.PRO ? 'default' : 'outline'}>
                          {user.subscription?.plan || 'NO PLAN'}
                        </Badge>
                        {user.subscription?.endDate && (
                          <span className="text-xs text-gray-500">
                            Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
                          </span>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          {user.subscription && (
                            <>
                              {user.subscription.resumeCount} resumes •{' '}
                              {user.subscription.aiUsageCount} AI uses •{' '}
                              {user.subscription.exportCount} exports •{' '}
                              {user.subscription.importCount} imports •{' '}
                              ATS: {user.subscription.atsUsageCount ?? 0}
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUpgradeModal(true)
                        }}
                        className="flex-shrink-0"
                        type="button"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Manage Plan</span>
                        <span className="sm:hidden">Manage</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}

            {/* Page info */}
            <p className="text-center text-sm text-gray-500 mt-3">
              Page {page} of {totalPages} — {total} users total
            </p>
          </>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && selectedUser && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Manage user plan"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUpgradeModal(false)
                setSelectedUser(null)
              }
            }}
          >
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Manage User Subscription</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600">User: {selectedUser.email}</p>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Current Plan:</span>
                  <Badge variant="outline">{selectedUser.subscription?.plan || 'NONE'}</Badge>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  className="w-full justify-start"
                  variant={selectedUser.subscription?.plan === PLAN_NAMES.FREE ? 'default' : 'outline'}
                  onClick={() => upgradeUserPlan(selectedUser.id, PLAN_NAMES.FREE)}
                  disabled={upgrading || selectedUser.subscription?.plan === PLAN_NAMES.FREE}
                  type="button"
                >
                  {selectedUser.subscription?.plan === PLAN_NAMES.FREE && <Check className="h-4 w-4 mr-2" />}
                  Free Plan
                </Button>

                <Button
                  className="w-full justify-start"
                  variant={selectedUser.subscription?.plan === PLAN_NAMES.PRO ? 'default' : 'outline'}
                  onClick={() => upgradeUserPlan(selectedUser.id, PLAN_NAMES.PRO)}
                  disabled={upgrading || selectedUser.subscription?.plan === PLAN_NAMES.PRO}
                  type="button"
                >
                  {selectedUser.subscription?.plan === PLAN_NAMES.PRO && <Check className="h-4 w-4 mr-2" />}
                  Pro Plan (5,000 IQD/mo)
                </Button>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUpgradeModal(false)
                    setSelectedUser(null)
                  }}
                  disabled={upgrading}
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Bulk Action Confirmation Dialog */}
        {showBulkConfirm && bulkAction && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm bulk action"
            onClick={(e) => {
              if (e.target === e.currentTarget && !bulkProcessing) {
                setShowBulkConfirm(false)
                setBulkAction(null)
              }
            }}
          >
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Confirm Bulk {bulkAction === 'upgrade' ? 'Upgrade' : 'Downgrade'}
              </h3>

              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to {bulkAction === 'upgrade' ? 'upgrade' : 'downgrade'}{' '}
                <strong>{selectedIds.length}</strong> user(s) to{' '}
                <strong>{bulkAction === 'upgrade' ? PLAN_NAMES.PRO : PLAN_NAMES.FREE}</strong>?
              </p>

              {bulkAction === 'upgrade' && (
                <p className="text-xs text-gray-500 mb-4">
                  Each user will receive a 30-day PRO subscription.
                </p>
              )}

              {bulkAction === 'downgrade' && (
                <p className="text-xs text-gray-500 mb-4">
                  Users will be downgraded to the FREE plan. Their usage counts will be preserved.
                </p>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkConfirm(false)
                    setBulkAction(null)
                  }}
                  disabled={bulkProcessing}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  disabled={bulkProcessing}
                  type="button"
                  className={
                    bulkAction === 'upgrade'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }
                  variant={bulkAction === 'downgrade' ? 'destructive' : 'default'}
                >
                  {bulkProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {bulkAction === 'upgrade' ? 'Upgrade' : 'Downgrade'} {selectedIds.length} User(s)
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
