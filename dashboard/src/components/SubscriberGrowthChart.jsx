import React from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

export default function SubscriberGrowthChart({ data, isLoading, audienceName }) {
  if (isLoading) {
    return (
      <div className="card chart-card">
        <h3 className="chart-title"><TrendingUp style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Subscriber Growth</h3>
        <div className="spinner">Loading growth data...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card chart-card">
        <h3 className="chart-title"><TrendingUp style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Subscriber Growth</h3>
        <div className="spinner">No growth data available</div>
      </div>
    )
  }

  return (
    <div className="card chart-card">
      <h3 className="chart-title"><TrendingUp style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Subscriber Growth</h3>
      {audienceName && <p className="chart-subtitle">{audienceName}</p>}
      
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066cc" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            style={{ fontSize: '0.85rem' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '0.85rem' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
            }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#0066cc"
            fillOpacity={1}
            fill="url(#colorGrowth)"
            name="Total Subscribers"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="growth-summary">
        <div className="summary-item">
          <span>First Month:</span>
          <strong>{data[0]?.total?.toLocaleString() || 'N/A'}</strong>
        </div>
        <div className="summary-item">
          <span>Latest Month:</span>
          <strong>{data[data.length - 1]?.total?.toLocaleString() || 'N/A'}</strong>
        </div>
        <div className="summary-item">
          <span>Net Growth:</span>
          <strong style={{ color: data[data.length - 1]?.total > data[0]?.total ? '#00b4d8' : '#ff6b6b' }}>
            {(data[data.length - 1]?.total - data[0]?.total).toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  )
}
