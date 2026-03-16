import React from 'react'

export default function TopAuthorsGrid({ data, isLoading }) {
  return (
    <div className="card">
      <h3 className="chart-title">👥 Top Authors</h3>
      {isLoading ? (
        <div className="spinner">Loading authors...</div>
      ) : !data || data.length === 0 ? (
        <div className="spinner">No author data available</div>
      ) : (
        <div className="authors-grid">
          {data.slice(0, 8).map((author) => (
            <div key={author.author_id} className="author-card">
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
