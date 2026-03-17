import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Activity } from 'lucide-react'

export default function MailchimpCampaignReport({ data, isLoading, campaignName }) {
  if (isLoading) {
    return (
      <div className="card chart-card">
        <h3 className="chart-title"><Activity style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Campaign Report</h3>
        <div className="spinner">Loading report...</div>
      </div>
    )
  }

  if (!data || !data.campaign_id) {
    return (
      <div className="card chart-card">
        <h3 className="chart-title"><Activity style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Campaign Report</h3>
        <div className="spinner">Select a campaign to view details</div>
      </div>
    )
  }

  const performanceData = [
    { metric: 'Open Rate', value: (data.open_rate * 100).toFixed(2) },
    { metric: 'Click Rate', value: (data.click_rate * 100).toFixed(2) },
  ]

  const statsData = [
    { label: 'Sent', value: data.emails_sent.toLocaleString(), color: '#764ba2' },
    { label: 'Opens', value: data.opens.toLocaleString(), color: '#1f73e6' },
    { label: 'Clicks', value: data.clicks.toLocaleString(), color: '#00b4d8' },
    { label: 'Bounces', value: data.bounces.toLocaleString(), color: '#ff6b6b' },
    { label: 'Unsubscribes', value: data.unsubscribes.toLocaleString(), color: '#ffa94d' },
  ]

  return (
    <div className="card chart-card">
      <h3 className="chart-title"><Activity style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Campaign Report</h3>
      {campaignName && <p className="chart-subtitle">{campaignName}</p>}
      
      <div className="campaign-report-grid">
        <div className="report-section">
          <h4>Performance Metrics</h4>
          <div className="performance-bars">
            {performanceData.map((item) => (
              <div key={item.metric} className="performance-item">
                <div className="performance-label">{item.metric}: {item.value}%</div>
                <div className="performance-bar">
                  <div
                    className="performance-fill"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Email Stats</h4>
          <div className="stats-grid">
            {statsData.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Engagement Breakdown</h4>
          <div className="engagement-stats">
            <div className="engagement-item">
              <span>Abuse Reports:</span>
              <strong>{data.abuse_reports}</strong>
            </div>
            <div className="engagement-item">
              <span>Bounce Rate:</span>
              <strong>{((data.bounces / data.emails_sent) * 100).toFixed(2)}%</strong>
            </div>
            <div className="engagement-item">
              <span>Unsubscribe Rate:</span>
              <strong>{((data.unsubscribes / data.emails_sent) * 100).toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
