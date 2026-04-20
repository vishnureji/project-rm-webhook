/**
 * Utility function to export data to CSV
 */
export const exportToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Create CSV header
  const csvHeaders = headers || Object.keys(data[0])
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',')

  // Create CSV rows
  const csvRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header]
        if (value === null || value === undefined) {
          return ''
        }
        // Escape quotes and wrap in quotes if needed
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return `"${stringValue}"`
      })
      .join(',')
  })

  // Combine header and rows
  const csv = [headerRow, ...csvRows].join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getArticlesCSVData = (articles) => {
  return articles.map((article) => ({
    'Post ID': article.post_id,
    'Headline': article.headline,
    'URL': article.post_url,
    'Author': article.author,
    'Date': article.created_ts ? new Date(article.created_ts * 1000).toLocaleDateString() : 'N/A',
    'Website': article.website_name,
  }))
}

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return ''
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}m ${secs}s`
}

const extractPagePath = (url) => {
  if (!url) return null
  try {
    return new URL(url).pathname
  } catch {
    return null
  }
}

export const getArticlesCSVDataWithGAMetrics = (articles, metricsByPath = {}) => {
  return articles.map((article) => {
    const pagePath = extractPagePath(article.post_url)
    const metrics = pagePath ? metricsByPath[pagePath] : null

    return {
      'Post ID': article.post_id,
      'Headline': article.headline,
      'URL': article.post_url,
      'Author': article.author,
      'Date': article.created_ts ? new Date(article.created_ts * 1000).toLocaleDateString() : 'N/A',
      'Website': article.website_name,
      'GA Unique Visitors': metrics?.users ?? '',
      'GA Page Views': metrics?.page_views ?? '',
      'GA Avg Duration': formatDuration(metrics?.avg_duration),
    }
  })
}

export const getAuthorsCSVData = (authors) => {
  return authors.map((author) => ({
    'Author ID': author.author_id,
    'Name': author.name,
    'Post Count': author.post_count,
  }))
}

export const getPostsPerDayCSVData = (postsPerDay) => {
  return postsPerDay.map((item) => ({
    'Date': item.date,
    'Posts Published': item.count,
  }))
}

export const getArticleStatsCSVData = (articles, statsData) => {
  const data = []
  
  // Add summary stats
  data.push({
    'Metric': 'Total Articles',
    'Value': statsData?.total_articles || 0,
  })
  data.push({
    'Metric': 'Total Authors',
    'Value': statsData?.total_authors || 0,
  })
  if (statsData?.latest_article_ts) {
    data.push({
      'Metric': 'Last Updated',
      'Value': new Date(statsData.latest_article_ts * 1000).toLocaleDateString(),
    })
  }
  data.push({ 'Metric': '', 'Value': '' }) // Empty row
  
  // Add articles
  data.push({
    'Metric': 'Post ID',
    'Value': 'Headline',
  })
  
  articles.forEach((article) => {
    data.push({
      'Metric': article.post_id,
      'Value': article.headline,
    })
  })

  return data
}
