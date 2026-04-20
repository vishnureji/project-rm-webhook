import React, { useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { getGABatchMetrics, getPostsPerDay, getRecentArticles, getTopAuthors } from '../../api'
import { exportToCSV, getArticlesCSVDataWithGAMetrics, getAuthorsCSVData, getPostsPerDayCSVData } from '../../utils/csvExport'
import Button from '../ui/button'
import Badge from '../ui/badge'
import StateBlock from '../ui/state-block'

function extractPagePath(url) {
  if (!url) return null
  try {
    return new URL(url).pathname
  } catch {
    return null
  }
}

export default function ExportActionBar({ websites, selectedWebsite, dateRange, compact = false, error }) {
  const [reportType, setReportType] = useState('articles')
  const [authorFilter, setAuthorFilter] = useState('')
  const [authors, setAuthors] = useState([])
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const fetchAuthors = async () => {
      if (reportType !== 'authors') return
      try {
        setIsLoadingAuthors(true)
        const data = await getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate)
        if (active) {
          setAuthors(data || [])
        }
      } catch {
        if (active) {
          setAuthors([])
        }
      } finally {
        if (active) {
          setIsLoadingAuthors(false)
        }
      }
    }

    fetchAuthors()
    return () => {
      active = false
    }
  }, [reportType, selectedWebsite, dateRange])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setMessage('')
      const timestamp = new Date().toLocaleString().replace(/[/:]/g, '-')

      if (reportType === 'articles') {
        const articles = await getRecentArticles(1000, selectedWebsite, dateRange.startDate, dateRange.endDate)
        const pagePaths = [...new Set(articles.map((article) => extractPagePath(article.post_url)).filter(Boolean))]
        let metricsByPath = {}

        if (pagePaths.length > 0) {
          const batchData = await getGABatchMetrics(pagePaths, selectedWebsite, dateRange.startDate, dateRange.endDate)
          metricsByPath = batchData?.metrics || {}
        }

        exportToCSV(getArticlesCSVDataWithGAMetrics(articles, metricsByPath), `articles-report-${timestamp}`, [
          'Post ID',
          'Headline',
          'URL',
          'Author',
          'Date',
          'Website',
          'GA Unique Visitors',
          'GA Page Views',
          'GA Avg Duration',
        ])
      }

      if (reportType === 'authors') {
        let authorRows = await getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate)
        if (authorFilter) {
          authorRows = authorRows.filter((author) => String(author.author_id) === String(authorFilter))
        }
        exportToCSV(getAuthorsCSVData(authorRows), `authors-report-${timestamp}`, ['Author ID', 'Name', 'Post Count'])
      }

      if (reportType === 'daily-stats') {
        const postRows = await getPostsPerDay(selectedWebsite, dateRange.startDate, dateRange.endDate)
        exportToCSV(getPostsPerDayCSVData(postRows), `daily-stats-report-${timestamp}`, ['Date', 'Posts Published'])
      }

      setMessage('Export completed')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      setMessage('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return <StateBlock type="error" title="Export unavailable" description={error} />
  }

  if (compact) {
    return (
      <div className="export-inline">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="articles">Articles CSV</option>
          <option value="authors">Authors CSV</option>
          <option value="daily-stats">Daily Stats CSV</option>
        </select>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="spin" size={16} /> : <Download size={16} />} Export
        </Button>
      </div>
    )
  }

  const selectedWebsiteName = websites?.find((site) => site.website_id === selectedWebsite)?.website_name || 'All Websites'

  return (
    <div className="export-action-bar">
      <div className="export-meta">
        <h3>Export Reports</h3>
        <p>Generate CSVs from the current dashboard scope without leaving your workflow.</p>
      </div>

      <div className="export-controls">
        <div className="export-control">
          <label htmlFor="report-type">Report</label>
          <select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)} disabled={isExporting}>
            <option value="articles">Articles report</option>
            <option value="authors">Authors report</option>
            <option value="daily-stats">Daily stats report</option>
          </select>
        </div>

        {reportType === 'authors' ? (
          <div className="export-control">
            <label htmlFor="author-filter">Author</label>
            <select
              id="author-filter"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              disabled={isLoadingAuthors || isExporting}
            >
              <option value="">All authors</option>
              {authors.map((author) => (
                <option key={author.author_id} value={author.author_id}>
                  {author.name} ({author.post_count})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="export-scope">
        <Badge variant="neutral">{selectedWebsiteName}</Badge>
        <Badge variant="neutral">
          {dateRange.startDate || 'Start'} to {dateRange.endDate || 'Now'}
        </Badge>
      </div>

      <div className="export-cta">
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
          {isExporting ? 'Exporting' : 'Download CSV'}
        </Button>
        {message ? (
          <Badge variant={message === 'Export completed' ? 'success' : 'danger'}>{message}</Badge>
        ) : null}
      </div>
    </div>
  )
}
