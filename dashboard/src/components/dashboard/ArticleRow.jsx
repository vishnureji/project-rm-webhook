import React from 'react'
import { ExternalLink } from 'lucide-react'
import Badge from '../ui/badge'
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

export default function ArticleRow({ article, scoreLabel }) {
  const performanceVariant =
    scoreLabel === 'High' ? 'success' : scoreLabel === 'Medium' ? 'warning' : 'neutral'

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
        <Badge variant={performanceVariant}>{scoreLabel}</Badge>
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
    </TableRow>
  )
}
