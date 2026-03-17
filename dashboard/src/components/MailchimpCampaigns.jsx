import React from 'react'
import { Send, Calendar, Users } from 'lucide-react'

export default function MailchimpCampaigns({ data, isLoading, onCampaignSelect, selectedCampaignId }) {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="chart-title"><Send style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Campaigns</h3>
        <div className="spinner">Loading campaigns...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="chart-title"><Send style={{display: 'inline', marginRight: '8px', width: '20px', height: '20px'}} /> Campaigns</h3>
        <div className="spinner">No campaigns available</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="chart-title"><Send style={{display: 'inline', marginRight: '8px', width: '18px', height: '18px'}} /> Recent Campaigns</h3>
      <div className="campaigns-list">
        {data.map((campaign) => (
          <div
            key={campaign.id}
            className={`campaign-item ${selectedCampaignId === campaign.id ? 'selected' : ''}`}
            onClick={() => onCampaignSelect(campaign)}
            style={{ cursor: 'pointer' }}
          >
            <div className="campaign-header">
              <h4>{campaign.name}</h4>
              <span className={`status-badge ${campaign.status}`}>{campaign.status}</span>
            </div>
            <div className="campaign-meta">
              <div className="meta-item">
                <Calendar style={{display: 'inline', marginRight: '4px', width: '16px', height: '16px'}} />
                {new Date(campaign.sent_at || campaign.created_at).toLocaleDateString()}
              </div>
              <div className="meta-item">
                <Users style={{display: 'inline', marginRight: '4px', width: '16px', height: '16px'}} />
                {campaign.emails_sent.toLocaleString()} sent
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
