import React from 'react'

function DateRangeSelector({ dateRange, onDateRangeChange, isLoading }) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const handlePreset = (preset) => {
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
        return
    }

    onDateRangeChange({
      preset,
      startDate: startDate ? dateToString(startDate) : null,
      endDate: dateToString(now),
    })
  }

  const dateToString = (date) => {
    if (!date) return null
    return date.toISOString().split('T')[0]
  }

  const stringToDate = (dateString) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-')
    return new Date(year, month - 1, day)
  }

  return (
    <div className="date-range-selector">
      <div className="date-presets">
        <button
          className={`preset-btn ${dateRange.preset === 'today' ? 'active' : ''}`}
          onClick={() => handlePreset('today')}
          disabled={isLoading}
        >
          Today
        </button>
        <button
          className={`preset-btn ${dateRange.preset === '7days' ? 'active' : ''}`}
          onClick={() => handlePreset('7days')}
          disabled={isLoading}
        >
          Last 7 Days
        </button>
        <button
          className={`preset-btn ${dateRange.preset === '30days' ? 'active' : ''}`}
          onClick={() => handlePreset('30days')}
          disabled={isLoading}
        >
          Last 30 Days
        </button>
        <button
          className={`preset-btn ${dateRange.preset === '90days' ? 'active' : ''}`}
          onClick={() => handlePreset('90days')}
          disabled={isLoading}
        >
          Last 90 Days
        </button>
        <button
          className={`preset-btn ${dateRange.preset === 'month' ? 'active' : ''}`}
          onClick={() => handlePreset('month')}
          disabled={isLoading}
        >
          This Month
        </button>
        <button
          className={`preset-btn ${dateRange.preset === 'all' ? 'active' : ''}`}
          onClick={() => handlePreset('all')}
          disabled={isLoading}
        >
          All Time
        </button>
      </div>

      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
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
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
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
  )
}

export default DateRangeSelector
