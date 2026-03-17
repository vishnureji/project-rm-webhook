import React, { useState, useEffect } from 'react'
import MailchimpAudiences from './MailchimpAudiences'
import MailchimpCampaigns from './MailchimpCampaigns'
import MailchimpCampaignReport from './MailchimpCampaignReport'
import SubscriberGrowthChart from './SubscriberGrowthChart'
import { getMailchimpAudiences, getMailchimpCampaigns, getMailchimpCampaignReport, getAudienceGrowth } from '../api'

export default function MailchimpDashboard() {
  const [audiences, setAudiences] = useState(null)
  const [campaigns, setCampaigns] = useState(null)
  const [selectedAudience, setSelectedAudience] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignReport, setCampaignReport] = useState(null)
  const [audienceGrowth, setAudienceGrowth] = useState(null)
  const [loading, setLoading] = useState({
    audiences: true,
    campaigns: true,
    campaignReport: false,
    audienceGrowth: false,
  })
  const [error, setError] = useState(null)

  // Load initial data
  useEffect(() => {
    loadMailchimpData()
  }, [])

  // Load audience growth when audience is selected
  useEffect(() => {
    if (selectedAudience) {
      loadAudienceGrowth(selectedAudience.id)
    } else {
      setAudienceGrowth(null)
    }
  }, [selectedAudience])

  // Load campaign report when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignReport(selectedCampaign.id)
    } else {
      setCampaignReport(null)
    }
  }, [selectedCampaign])

  const loadMailchimpData = async () => {
    try {
      setError(null)
      
      const audiencesData = await getMailchimpAudiences()
      setAudiences(audiencesData)
      setLoading(prev => ({ ...prev, audiences: false }))

      const campaignsData = await getMailchimpCampaigns('sent', 50)
      setCampaigns(campaignsData)
      setLoading(prev => ({ ...prev, campaigns: false }))
    } catch (err) {
      console.error('Error loading Mailchimp data:', err)
      setError('Failed to load Mailchimp data. Please ensure your Mailchimp API key is configured.')
      setLoading({
        audiences: false,
        campaigns: false,
        campaignReport: false,
        audienceGrowth: false,
      })
    }
  }

  const loadCampaignReport = async (campaignId) => {
    try {
      setLoading(prev => ({ ...prev, campaignReport: true }))
      const report = await getMailchimpCampaignReport(campaignId)
      setCampaignReport(report)
      setLoading(prev => ({ ...prev, campaignReport: false }))
    } catch (err) {
      console.error('Error loading campaign report:', err)
      setLoading(prev => ({ ...prev, campaignReport: false }))
    }
  }

  const loadAudienceGrowth = async (audienceId) => {
    try {
      setLoading(prev => ({ ...prev, audienceGrowth: true }))
      const growth = await getAudienceGrowth(audienceId)
      setAudienceGrowth(growth)
      setLoading(prev => ({ ...prev, audienceGrowth: false }))
    } catch (err) {
      console.error('Error loading audience growth:', err)
      setLoading(prev => ({ ...prev, audienceGrowth: false }))
    }
  }

  return (
    <div className="mailchimp-dashboard">
      <div className="page-header">
        <h1>Mailchimp Email Marketing</h1>
        <p>Manage your audiences, campaigns, and email performance</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 1' }}>
          <MailchimpAudiences
            data={audiences}
            isLoading={loading.audiences}
            onAudienceSelect={setSelectedAudience}
            selectedAudienceId={selectedAudience?.id}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <MailchimpCampaigns
            data={campaigns}
            isLoading={loading.campaigns}
            onCampaignSelect={setSelectedCampaign}
            selectedCampaignId={selectedCampaign?.id}
          />
        </div>
      </div>

      {selectedAudience && (
        <div className="dashboard-grid">
          <div style={{ gridColumn: 'span 1' }}>
            <SubscriberGrowthChart
              data={audienceGrowth}
              isLoading={loading.audienceGrowth}
              audienceName={selectedAudience.name}
            />
          </div>
        </div>
      )}

      {selectedCampaign && (
        <div className="dashboard-grid">
          <div style={{ gridColumn: 'span 1' }}>
            <MailchimpCampaignReport
              data={campaignReport}
              isLoading={loading.campaignReport}
              campaignName={selectedCampaign.name}
            />
          </div>
        </div>
      )}

      <div className="footer">
        <p>Mailchimp dashboard auto-refreshes on selection changes</p>
      </div>
    </div>
  )
}
