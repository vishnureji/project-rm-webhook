import React, { useState } from 'react'
import { FiDownload, FiAlertCircle, FiLock } from 'react-icons/fi'
import { getStats, getPostsPerDay, getTopAuthors, getRecentArticles, getWebsites } from '../api'
import { 
  exportToCSV, 
  getArticlesCSVData, 
  getAuthorsCSVData, 
  getPostsPerDayCSVData 
} from '../utils/csvExport'

function ReportExport({ websites, dateRange, selectedWebsite }) {
  const [reportType, setReportType] = useState('articles')
  const [authorFilter, setAuthorFilter] = useState(null)
  const [authors, setAuthors] = useState([])
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    setExporting(true)
    setMessage('')

    try {
      const timestamp = new Date().toLocaleString().replace(/[/:]/g, '-')
      let data = []
      let filename = ''

      if (reportType === 'articles') {
        const articles = await getRecentArticles(
          1000,
          selectedWebsite,
          dateRange.startDate,
          dateRange.endDate
        )
        const statsData = await getStats(selectedWebsite, dateRange.startDate, dateRange.endDate)
        data = getArticlesCSVData(articles)
        filename = `articles-report-${timestamp}`
        exportToCSV(data, filename, [
          'Post ID',
          'Headline',
          'URL',
          'Author',
          'Date',
          'Website',
        ])
      } else if (reportType === 'authors') {
        let topAuthors = await getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate)
        
        // Filter by specific author if selected
        if (authorFilter) {
          topAuthors = topAuthors.filter((a) => a.author_id === parseInt(authorFilter))
        }

        data = getAuthorsCSVData(topAuthors)
        filename = `authors-report-${timestamp}`
        exportToCSV(data, filename, ['Author ID', 'Name', 'Post Count'])
      } else if (reportType === 'daily-stats') {
        const postsPerDay = await getPostsPerDay(
          selectedWebsite,
          dateRange.startDate,
          dateRange.endDate
        )
        data = getPostsPerDayCSVData(postsPerDay)
        filename = `daily-stats-report-${timestamp}`
        exportToCSV(data, filename, ['Date', 'Posts Published'])
      }

      setMessage(`✓ Exported ${data.length} records successfully`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Export error:', error)
      setMessage('❌ Error exporting data')
    } finally {
      setExporting(false)
    }
  }

  const handleLoadAuthors = async () => {
    try {
      const authorsData = await getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate)
      setAuthors(authorsData)
    } catch (error) {
      console.error('Error loading authors:', error)
    }
  }

  React.useEffect(() => {
    if (reportType === 'authors') {
      handleLoadAuthors()
    }
  }, [reportType, selectedWebsite, dateRange])

  return (
    <div className="report-export-container">
      <div className="report-header">
        <h2><FiDownload style={{display: 'inline', marginRight: '8px'}} /> Export Report</h2>
        <p>Download analytics data in CSV format</p>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label htmlFor="report-type">Report Type</label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            disabled={exporting}
          >
            <option value="articles">Articles Report</option>
            <option value="authors">Authors Report</option>
            <option value="daily-stats">Daily Stats Report</option>
          </select>
        </div>

        {reportType === 'authors' && (
          <div className="filter-group">
            <label htmlFor="author-filter">Filter by Author (Optional)</label>
            <select
              id="author-filter"
              value={authorFilter || ''}
              onChange={(e) => setAuthorFilter(e.target.value || null)}
              disabled={exporting || authors.length === 0}
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author.author_id} value={author.author_id}>
                  {author.name} ({author.post_count} posts)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-info">
          <span className="filter-label">Website:</span>
          <span className="filter-value">{selectedWebsite || 'All Websites'}</span>
        </div>

        <div className="filter-info">
          <span className="filter-label">Period:</span>
          <span className="filter-value">
            {dateRange.startDate} to {dateRange.endDate}
          </span>
        </div>
      </div>

      <div className="report-actions">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <><FiAlertCircle style={{display: 'inline', marginRight: '6px'}} /> Exporting...</>
          ) : (
            <><FiDownload style={{display: 'inline', marginRight: '6px'}} /> Download CSV</>
          )}
        </button>
        {message && <span className={`export-message ${message.startsWith('✓') || !message.startsWith('❌') ? 'success' : 'error'}`}>{message}</span>}
      </div>

      <div className="report-info">
        <p>
          <FiAlertCircle style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} />
          <strong>About this export:</strong> The CSV file will contain unformatted data for all selected filters.
          Includes timestamps, URLs, IDs, and other metrics for analysis.
        </p>
      </div>
    </div>
  )
}

export default ReportExport
