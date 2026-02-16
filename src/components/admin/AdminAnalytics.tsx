'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { devError } from '@/lib/admin-utils'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  signups: { month: string; count: number }[]
  revenue: { month: string; amount: number; count: number }[]
  activeUsers: { month: string; count: number }[]
  resumeCompletions: { month: string; count: number }[]
}

function formatMonth(month: string) {
  // "2026-02" -> "Feb"
  const d = new Date(month + '-01')
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="h-48">
        {children}
      </div>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="p-4">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
      <div className="h-48 bg-gray-100 rounded animate-pulse" />
    </Card>
  )
}

interface AdminAnalyticsProps {
  csrfFetch: (url: string, init?: RequestInit) => Promise<Response>
}

export function AdminAnalytics({ csrfFetch }: AdminAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await csrfFetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        if (!cancelled) {
          setData(json.data || json)
          setError(null)
        }
      } catch (err) {
        devError('[AdminAnalytics] Failed to load:', err)
        if (!cancelled) setError('Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [csrfFetch])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>{error || 'No analytics data available'}</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Signups Over Time */}
      <ChartCard title="User Signups">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.signups}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(l) => l} formatter={((v: number) => [v, 'Signups']) as any} />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly Revenue */}
      <ChartCard title="Monthly Revenue (IQD)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip labelFormatter={(l) => l} formatter={((v: number) => [`${v.toLocaleString()} IQD`, 'Revenue']) as any} />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Active Users */}
      <ChartCard title="Active Users">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.activeUsers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(l) => l} formatter={((v: number) => [v, 'Active Users']) as any} />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Resumes Created */}
      <ChartCard title="Resumes Created">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.resumeCompletions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(l) => l} formatter={((v: number) => [v, 'Resumes']) as any} />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
