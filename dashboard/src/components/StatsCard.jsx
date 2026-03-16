import React from 'react'

export default function StatsCard({ title, value, isLoading }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{title}</div>
      {isLoading ? (
        <div className="stat-value">...</div>
      ) : (
        <div className="stat-value">{value || 0}</div>
      )}
    </div>
  )
}
