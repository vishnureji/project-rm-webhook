import React from 'react'

export default function RecentArticles({ data, isLoading }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="card">
      <h3 className="chart-title">📰 Recent Articles</h3>
      {isLoading ? (
        <div className="spinner">Loading articles...</div>
      ) : !data || data.length === 0 ? (
        <div className="spinner">No articles available</div>
      ) : (
        <div className="articles-list">
          {data.slice(0, 10).map((article) => (
            <div key={article.post_id} className="article-item">
              <div className="article-headline">
                {article.headline || 'Untitled'}
              </div>
              <div className="article-meta">
                <span>📅 {formatDate(article.created_ts)}</span>
                {article.author && <span>✍️ {article.author}</span>}
              </div>
              {article.post_url && (
                <a
                  href={article.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  View Article →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
