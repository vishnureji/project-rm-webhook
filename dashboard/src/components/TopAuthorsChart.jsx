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
  Cell,
} from 'recharts'

export default function TopAuthorsChart({ data, isLoading, selectedAuthorId, onAuthorSelect }) {
  const chartData = (data || []).map((author) => ({
    name: author.name || 'Unknown',
    posts: author.post_count,
    author_id: author.author_id,
  }))

  const handleBarClick = (data) => {
    onAuthorSelect({
      author_id: data.author_id,
      name: data.name
    })
  }

  return (
    <div className="card chart-card">
      <h3 className="chart-title"><FiBarChart2 style={{display: 'inline', marginRight: '8px'}} /> Top Authors by Posts</h3>
      {isLoading ? (
        <div className="spinner">Loading chart data...</div>
      ) : chartData.length === 0 ? (
        <div className="spinner">No author data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" stroke="#666" style={{ fontSize: '0.85rem' }} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              stroke="#666"
              style={{ fontSize: '0.75rem' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
              }}
            />
            <Legend />
            <Bar 
              dataKey="posts" 
              name="Published Posts"
              onClick={(data) => handleBarClick(data)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.author_id}`}
                  fill={selectedAuthorId === entry.author_id ? '#1f73e6' : '#764ba2'}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
