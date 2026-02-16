'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/shared/AppHeader'
import {
  Search,
  RefreshCw,
  User,
  Mail,
  Calendar,
  CreditCard,
  Check,
  Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCsrfToken } from '@/hooks/useCsrfToken'

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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUpgradeModal(false)
        setSelectedUser(null)
      }
    }
    if (showUpgradeModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showUpgradeModal])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await csrfFetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('[UserManagement] Failed to fetch users:', error);
    } finally {
      setLoading(false)
    }
  }

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
      console.error('[UserManagement] Failed to update user plan:', error);
      toast.error('Error updating user plan')
    } finally {
      setUpgrading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

        {/* Search and Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchUsers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
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
                      <Badge variant={user.subscription?.plan === 'PRO' ? 'default' : 'outline'}>
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
                  variant={selectedUser.subscription?.plan === 'FREE' ? 'default' : 'outline'}
                  onClick={() => upgradeUserPlan(selectedUser.id, 'FREE')}
                  disabled={upgrading || selectedUser.subscription?.plan === 'FREE'}
                >
                  {selectedUser.subscription?.plan === 'FREE' && <Check className="h-4 w-4 mr-2" />}
                  Free Plan
                </Button>

                <Button
                  className="w-full justify-start"
                  variant={selectedUser.subscription?.plan === 'PRO' ? 'default' : 'outline'}
                  onClick={() => upgradeUserPlan(selectedUser.id, 'PRO')}
                  disabled={upgrading || selectedUser.subscription?.plan === 'PRO'}
                >
                  {selectedUser.subscription?.plan === 'PRO' && <Check className="h-4 w-4 mr-2" />}
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
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
