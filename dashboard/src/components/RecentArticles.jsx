import React from 'react'
import { FiFileText, FiCalendar, FiExternalLink } from 'react-icons/fi'

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
        <h3 className="chart-title"><FiFileText style={{display: 'inline', marginRight: '8px'}} /> Recent Articles</h3>
        {selectedAuthor && (
          <div className="articles-filter-info">
            <span className="filter-tag" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <FiCalendar /> Author: <strong>{selectedAuthor.name}</strong>
            </span>
            <button className="clear-filter-btn" onClick={onClearAuthorFilter}>
              <FiX style={{fontSize: '1.2rem'}} />
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
                <span><FiCalendar style={{display: 'inline', marginRight: '4px'}} />{formatDate(article.created_ts)}</span>
                {article.author && <span><FiCalendar style={{display: 'inline', marginRight: '4px'}} />{article.author}</span>}
              </div>
              {article.post_url && (
                <a
                  href={article.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  <FiExternalLink style={{display: 'inline', marginRight: '4px'}} />View Article
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
