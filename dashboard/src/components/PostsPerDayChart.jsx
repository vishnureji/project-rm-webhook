import React from 'react'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import AnalyticsChartCard from './dashboard/AnalyticsChartCard'

export default function PostsPerDayChart({ data, isLoading, error }) {
  const chartData = [...(data || [])].reverse()

  return (
    <AnalyticsChartCard
      className="primary-chart-card"
      title="Posts Published Over Time"
      description="Daily output trend for the selected site and date range."
      action={<BarChart3 size={16} />}
      isLoading={isLoading}
      isEmpty={!isLoading && chartData.length === 0}
      error={error}
    >
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                backgroundColor: 'var(--surface-elevated)',
              }}
            />
            <Bar dataKey="count" fill="var(--brand-600)" radius={[8, 8, 0, 0]} name="Posts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  )
}
