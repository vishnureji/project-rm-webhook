import React from 'react'
import Badge from '../ui/badge'
import Skeleton from '../ui/skeleton'
import StateBlock from '../ui/state-block'

export default function AuthorPerformanceItem({
  author,
  rank,
  totalPosts,
  selected,
  onSelect,
  isLoading,
  error,
}) {
  if (error) {
    return <StateBlock type="error" title="Author insight unavailable" description={error} />
  }

  if (isLoading) {
    return (
      <div className="author-item author-item-loading">
        <Skeleton className="author-skeleton-rank" />
        <div className="author-skeleton-body">
          <Skeleton className="author-skeleton-line" />
          <Skeleton className="author-skeleton-line short" />
        </div>
      </div>
    )
  }

  if (!author) {
    return <StateBlock type="empty" title="No authors yet" description="Publish more content to compare author output." />
  }

  const share = totalPosts > 0 ? Math.round((author.post_count / totalPosts) * 100) : 0
  const quality = share >= 20 ? 'Top' : share >= 10 ? 'Strong' : 'Emerging'

  return (
    <button
      type="button"
      className={`author-item ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="author-rank">#{rank}</div>
      <div className="author-body">
        <div className="author-top-row">
          <strong>{author.name || 'Unknown'}</strong>
          <Badge variant={quality === 'Top' ? 'success' : quality === 'Strong' ? 'primary' : 'warning'}>
            {quality}
          </Badge>
        </div>
        <div className="author-meta-row">
          <span>{author.post_count} posts</span>
          <span>{share}% share</span>
        </div>
      </div>
    </button>
  )
}
