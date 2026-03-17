import React from 'react'
import { Users } from 'lucide-react'

export default function MailchimpAudiences({ data, isLoading, onAudienceSelect, selectedAudienceId }) {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="chart-title"><Users style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Audiences</h3>
        <div className="spinner">Loading audiences...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="chart-title"><Users style={{display: 'inline', marginRight: '8px', width: '20px', height: '20px'}} /> Audiences</h3>
        <div className="spinner">No audiences available</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="chart-title"><Users style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Email Audiences</h3>
      <div className="audiences-list">
        {data.map((audience) => (
          <div
            key={audience.id}
            className={`audience-item ${selectedAudienceId === audience.id ? 'selected' : ''}`}
            onClick={() => onAudienceSelect(audience)}
            style={{ cursor: 'pointer' }}
          >
            <div className="audience-header">
              <h4>{audience.name}</h4>
            </div>
            <div className="audience-stats">
              <div className="stat">
                <span className="label">Subscribers:</span>
                <span className="value">{audience.subscriber_count.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="label">Unsubscribed:</span>
                <span className="value">{audience.unsubscribed_count}</span>
              </div>
              <div className="stat">
                <span className="label">Cleaned:</span>
                <span className="value">{audience.cleaned_count}</span>
              </div>
              <div className="stat">
                <span className="label">Created:</span>
                <span className="value">{new Date(audience.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
