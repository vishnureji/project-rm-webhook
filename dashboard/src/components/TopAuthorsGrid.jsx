import React from 'react'
import { FiUsers } from 'react-icons/fi'

export default function TopAuthorsGrid({ data, isLoading, selectedAuthorId, onAuthorSelect }) {
  return (
    <div className="card">
      <h3 className="chart-title"><FiUsers style={{display: 'inline', marginRight: '8px'}} /> Top Authors</h3>
      {isLoading ? (
        <div className="spinner">Loading authors...</div>
      ) : !data || data.length === 0 ? (
        <div className="spinner">No author data available</div>
      ) : (
        <div className="authors-grid">
          {data.slice(0, 8).map((author) => (
            <div
              key={author.author_id}
              className={`author-card ${selectedAuthorId === author.author_id ? 'selected' : ''}`}
              onClick={() => onAuthorSelect({
                author_id: author.author_id,
                name: author.name
              })}
              style={{ cursor: 'pointer' }}
            >
              {author.photo && (
                <img
                  src={author.photo}
                  alt={author.name}
                  className="author-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <div className="author-name">{author.name || 'Unknown'}</div>
              <div className="author-count">{author.post_count}</div>
              <div className="author-label">
                {author.post_count === 1 ? 'post' : 'posts'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
