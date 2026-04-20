import React from 'react'
import { Users, Eye, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import Skeleton from '../ui/skeleton'
import StateBlock from '../ui/state-block'

export default function GoogleAnalyticsCard({
  title = 'Google Analytics Metrics',
  metrics = null,
  isLoading = false,
  error = null,
  dateRange = null,
}) {
  if (error) {
    // Check if it's a configuration error for multi-property setup
    const isConfigError = error.includes('not configured')
    return (
      <Card className="ga-card">
        <CardContent>
          <StateBlock 
            type="error" 
            title={title} 
            description={isConfigError ? 
              "Google Analytics not configured for this website. Please set up GA4 properties in your configuration." : 
              error
            } 
          />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="ga-card">
        <CardContent>
          <div className="ga-card-header">
            <h3 className="ga-card-title">{title}</h3>
          </div>
          <div className="ga-metrics-grid">
            <Skeleton className="ga-metric-skeleton" />
            <Skeleton className="ga-metric-skeleton" />
            <Skeleton className="ga-metric-skeleton" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card className="ga-card">
        <CardContent>
          <StateBlock type="empty" title={title} description="No Google Analytics data available." />
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  return (
    <Card className="ga-card">
      <CardContent>
        <div className="ga-card-header">
          <h3 className="ga-card-title">{title}</h3>
          {dateRange && (
            <span className="ga-card-date-range">
              {dateRange.startDate} to {dateRange.endDate}
            </span>
          )}
        </div>

        <div className="ga-metrics-grid">
          {/* Unique Visitors */}
          <div className="ga-metric-card">
            <div className="ga-metric-header">
              <Users size={24} className="ga-metric-icon users" />
              <div className="ga-metric-label-group">
                <span className="ga-metric-label">Unique Visitors</span>
              </div>
            </div>
            <div className="ga-metric-value">{metrics.users.toLocaleString()}</div>
          </div>

          {/* Page Views */}
          <div className="ga-metric-card">
            <div className="ga-metric-header">
              <Eye size={24} className="ga-metric-icon pageviews" />
              <div className="ga-metric-label-group">
                <span className="ga-metric-label">Page Views</span>
              </div>
            </div>
            <div className="ga-metric-value">{metrics.page_views.toLocaleString()}</div>
          </div>

          {/* Average Session Duration */}
          <div className="ga-metric-card">
            <div className="ga-metric-header">
              <Clock size={24} className="ga-metric-icon duration" />
              <div className="ga-metric-label-group">
                <span className="ga-metric-label">Avg. Duration</span>
              </div>
            </div>
            <div className="ga-metric-value">{formatDuration(metrics.avg_duration)}</div>
          </div>
        </div>
      </CardContent>

      <style>{`
        .ga-card {
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(251, 188, 4, 0.05) 100%);
        }

        .ga-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .ga-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .ga-card-date-range {
          font-size: 12px;
          color: #6b7280;
          background: rgba(0, 0, 0, 0.05);
          padding: 4px 12px;
          border-radius: 4px;
        }

        .ga-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .ga-metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .ga-metric-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.1);
        }

        .ga-metric-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ga-metric-icon {
          flex-shrink: 0;
          color: #6b7280;
        }

        .ga-metric-icon.users {
          color: #4285f4;
        }

        .ga-metric-icon.pageviews {
          color: #fbbc04;
        }

        .ga-metric-icon.duration {
          color: #ea4335;
        }

        .ga-metric-label-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 8px;
        }

        .ga-metric-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ga-metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 8px 0;
        }

        .ga-metric-skeleton {
          height: 150px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Card>
  )
}
