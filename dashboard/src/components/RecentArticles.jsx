import React from 'react'

export default function RecentArticles({ data, isLoading, selectedAuthor, onClearAuthorFilter }) {
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

  // Filter articles by selected author
  const filteredData = selectedAuthor
    ? (data || []).filter((article) => article.author === selectedAuthor.name)
    : data

  return (
    <div className="card">
      <div className="recent-articles-header">
        <h3 className="chart-title">📰 Recent Articles</h3>
        {selectedAuthor && (
          <div className="articles-filter-info">
            <span className="filter-tag">
              Author: <strong>{selectedAuthor.name}</strong>
            </span>
            <button className="clear-filter-btn" onClick={onClearAuthorFilter}>
              ✕
            </button>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="spinner">Loading articles...</div>
      ) : !filteredData || filteredData.length === 0 ? (
        <div className="spinner">
          {selectedAuthor
            ? `No articles by ${selectedAuthor.name}`
            : 'No articles available'}
        </div>
      ) : (
        <div className="articles-list">
          {filteredData.slice(0, 10).map((article) => (
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
