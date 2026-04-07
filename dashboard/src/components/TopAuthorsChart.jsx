import React from 'react'
import { UserRound } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import AnalyticsChartCard from './dashboard/AnalyticsChartCard'

export default function TopAuthorsChart({ data, isLoading, selectedAuthorId, onAuthorSelect, error }) {
  const chartData = (data || []).map((author) => ({
    name: author.name || 'Unknown',
    posts: author.post_count,
    author_id: author.author_id,
  }))

  return (
    <AnalyticsChartCard
      title="Top Authors"
      description="Compare output by author. Select a bar to filter recent content."
      action={<UserRound size={16} />}
      isLoading={isLoading}
      isEmpty={!isLoading && chartData.length === 0}
      error={error}
    >
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={128} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                backgroundColor: 'var(--surface-elevated)',
              }}
            />
            <Bar dataKey="posts" name="Published posts" radius={[0, 8, 8, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={`author-cell-${entry.author_id}`}
                  fill={selectedAuthorId === entry.author_id ? 'var(--brand-600)' : 'var(--brand-300)'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onAuthorSelect({ author_id: entry.author_id, name: entry.name })}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  )
}
