import React from 'react'
import { ExternalLink, Users, Eye, Clock } from 'lucide-react'
import { TableCell, TableRow } from '../ui/table'

function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return 'N/A'
  try {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  } catch {
    return 'N/A'
  }
}

function ArticleRowComponent({ article, pageMetrics = null, isLoading = false }) {
  return (
    <TableRow>
      <TableCell>
        <div className="article-title-cell">
          <strong>{article.headline || 'Untitled'}</strong>
        </div>
      </TableCell>
      <TableCell>{article.author || 'Unknown'}</TableCell>
      <TableCell>{article.website_name || 'N/A'}</TableCell>
      <TableCell>{formatDate(article.created_ts)}</TableCell>
      <TableCell>
        <div className="ga-metric-cell">
          <Users size={14} className="ga-icon users" />
          <span className="ga-value">
            {isLoading ? '...' : pageMetrics?.users !== undefined ? pageMetrics.users.toLocaleString() : '—'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="ga-metric-cell">
          <Eye size={14} className="ga-icon pageviews" />
          <span className="ga-value">
            {isLoading ? '...' : pageMetrics?.page_views !== undefined ? pageMetrics.page_views.toLocaleString() : '—'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="ga-metric-cell">
          <Clock size={14} className="ga-icon duration" />
          <span className="ga-value">
            {isLoading ? '...' : pageMetrics?.avg_duration !== undefined ? formatDuration(pageMetrics.avg_duration) : '—'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {article.post_url ? (
          <a href={article.post_url} target="_blank" rel="noreferrer" className="article-table-action">
            <ExternalLink size={14} /> View
          </a>
        ) : (
          <span className="article-table-muted">No URL</span>
        )}
      </TableCell>

      <style>{`
        .ga-metric-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
        }

        .ga-icon {
          flex-shrink: 0;
          color: #6b7280;
        }

        .ga-icon.users {
          color: #4285f4;
        }

        .ga-icon.pageviews {
          color: #fbbc04;
        }

        .ga-icon.duration {
          color: #ea4335;
        }

        .ga-value {
          font-variant-numeric: tabular-nums;
          min-width: 60px;
        }
      `}</style>
    </TableRow>
  )
}

export default React.memo(ArticleRowComponent)
