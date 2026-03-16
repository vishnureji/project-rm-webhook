import React from 'react'

export default function WebsiteSelector({ websites, selectedWebsite, onSelect, isLoading }) {
  return (
    <div className="website-selector-container">
      <div className="website-selector">
        <label>Select Website:</label>
        <select
          value={selectedWebsite || 'all'}
          onChange={(e) => onSelect(e.target.value === 'all' ? null : e.target.value)}
          disabled={isLoading}
        >
          <option value="all">All Websites</option>
          {websites && websites.map((website) => (
            <option key={website.website_id} value={website.website_id}>
              {website.website_name} ({website.post_count} posts)
            </option>
          ))}
        </select>
      </div>

      {selectedWebsite && websites && (
        <div className="website-info">
          {websites
            .filter((w) => w.website_id === selectedWebsite)
            .map((w) => (
              <div key={w.website_id} className="website-stats">
                <span>📊 {w.post_count} articles</span>
                <span>✍️ {w.author_count} authors</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
