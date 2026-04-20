import React from 'react'
import { CalendarDays, Globe2 } from 'lucide-react'
import Button from '../ui/button'
import Badge from '../ui/badge'
import Skeleton from '../ui/skeleton'

const presets = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7D' },
  { value: '30days', label: '30D' },
  { value: '90days', label: '90D' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

function dateToString(date) {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPresetRange(preset) {
  const now = new Date()
  let startDate = new Date(now)

  switch (preset) {
    case '7days':
      startDate.setDate(now.getDate() - 7)
      break
    case '30days':
      startDate.setDate(now.getDate() - 30)
      break
    case '90days':
      startDate.setDate(now.getDate() - 90)
      break
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'all':
      startDate = null
      break
    default:
      return null
  }

  return {
    preset,
    startDate: startDate ? dateToString(startDate) : null,
    endDate: dateToString(now),
  }
}

export default function FilterBar({
  websites,
  selectedWebsite,
  onWebsiteChange,
  dateRange,
  onDateRangeChange,
  isLoading,
  rightSlot,
}) {
  const selectedWebsiteInfo = websites?.find((w) => w.website_id === selectedWebsite)

  const handlePreset = (preset) => {
    const range = getPresetRange(preset)
    if (range) {
      onDateRangeChange(range)
    }
  }

  return (
    <div className="filter-bar-shell">
      <div className="filter-bar">
        <div className="filter-bar-main">
          <div className="filter-field website-field">
            <label htmlFor="website-select">
              <Globe2 size={14} />
              Website
            </label>
            {isLoading ? (
              <Skeleton className="filter-skeleton" />
            ) : (
              <select
                id="website-select"
                value={selectedWebsite || ''}
                onChange={(e) => onWebsiteChange(e.target.value)}
                disabled={isLoading}
              >
                {(websites || []).map((website) => (
                  <option key={website.website_id} value={website.website_id}>
                    {website.website_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="filter-field date-field">
            <label>
              <CalendarDays size={14} />
              Date range
            </label>
            <div className="preset-strip">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={dateRange.preset === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePreset(preset.value)}
                  disabled={isLoading}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="date-input-row">
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    preset: 'custom',
                    startDate: e.target.value,
                  })
                }
                disabled={isLoading}
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) =>
                  onDateRangeChange({
                    ...dateRange,
                    preset: 'custom',
                    endDate: e.target.value,
                  })
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="filter-bar-side">
          {selectedWebsiteInfo ? (
            <div className="selected-website-meta">
              <Badge variant="primary">{selectedWebsiteInfo.website_name}</Badge>
              <span>{selectedWebsiteInfo.author_count} authors</span>
            </div>
          ) : (
            <div className="selected-website-meta">
              <Badge variant="neutral">All websites</Badge>
              <span>Cross-platform view enabled</span>
            </div>
          )}
          {rightSlot}
        </div>
      </div>
    </div>
  )
}
