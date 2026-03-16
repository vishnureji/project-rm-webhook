import React from 'react'
import { FiBarChart2 } from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function PostsPerDayChart({ data, isLoading }) {
  const chartData = [...(data || [])].reverse()

  return (
    <div className="card chart-card">
      <h3 className="chart-title"><FiBarChart2 style={{display: 'inline', marginRight: '8px'}} /> Posts Published Per Day</h3>
      {isLoading ? (
        <div className="spinner">Loading chart data...</div>
      ) : chartData.length === 0 ? (
        <div className="spinner">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.85rem' }} />
            <YAxis stroke="#666" style={{ fontSize: '0.85rem' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
              }}
              cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill="#667eea"
              name="Posts"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
