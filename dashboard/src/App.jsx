import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import StatsCard from './components/StatsCard'
import PostsPerDayChart from './components/PostsPerDayChart'
import TopAuthorsChart from './components/TopAuthorsChart'
import TopAuthorsGrid from './components/TopAuthorsGrid'
import RecentArticles from './components/RecentArticles'
import WebsiteSelector from './components/WebsiteSelector'
import DateRangeSelector from './components/DateRangeSelector'
import ReportExport from './components/ReportExport'
import MailchimpDashboard from './components/MailchimpDashboard'
import { getStats, getPostsPerDay, getTopAuthors, getRecentArticles, getWebsites } from './api'

function App() {
  const [currentPage, setCurrentPage] = useState('analytics')
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [websites, setWebsites] = useState(null)
  const [dateRange, setDateRange] = useState({
    preset: '30days',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [stats, setStats] = useState(null)
  const [postsPerDay, setPostsPerDay] = useState(null)
  const [topAuthors, setTopAuthors] = useState(null)
  const [recentArticles, setRecentArticles] = useState(null)
  const [loading, setLoading] = useState({
    websites: true,
    stats: true,
    postsPerDay: true,
    topAuthors: true,
    recentArticles: true,
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [selectedWebsite, dateRange])

  const loadDashboardData = async () => {
    try {
      setError(null)

      // Load websites first if not already loaded
      if (!websites) {
        const websitesData = await getWebsites()
        setWebsites(websitesData)
        setLoading((prev) => ({ ...prev, websites: false }))
      }

      // Load data for selected website with date range
      const statsData = await getStats(selectedWebsite, dateRange.startDate, dateRange.endDate)
      setStats(statsData)
      setLoading((prev) => ({ ...prev, stats: false }))

      const postsData = await getPostsPerDay(selectedWebsite, dateRange.startDate, dateRange.endDate)
      setPostsPerDay(postsData)
      setLoading((prev) => ({ ...prev, postsPerDay: false }))

      const authorsData = await getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate)
      setTopAuthors(authorsData)
      setLoading((prev) => ({ ...prev, topAuthors: false }))

      const articlesData = await getRecentArticles(20, selectedWebsite, dateRange.startDate, dateRange.endDate)
      setRecentArticles(articlesData)
      setLoading((prev) => ({ ...prev, recentArticles: false }))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(
        'Failed to load dashboard data. Make sure the webhook server is running on http://localhost:8000'
      )
      setLoading({
        websites: false,
        stats: false,
        postsPerDay: false,
        topAuthors: false,
        recentArticles: false,
      })
    }
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="main-content">
        {currentPage === 'analytics' ? (
          <div className="container">
            <div className="header">
              <h1>RM Analytics Dashboard</h1>
              <p>Real-time insights into your published content</p>
            </div>

            {error && (
              <div className="error-message">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            <div className="controls-section">
              <WebsiteSelector
                websites={websites}
                selectedWebsite={selectedWebsite}
                onSelect={setSelectedWebsite}
                isLoading={loading.websites}
              />

              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                isLoading={Object.values(loading).some(l => l)}
              />
            </div>

            <div className="dashboard-grid">
              <StatsCard
                title="Total Articles"
                value={stats?.total_articles}
                isLoading={loading.stats}
              />
              <StatsCard
                title="Total Authors"
                value={stats?.total_authors}
                isLoading={loading.stats}
              />
              <StatsCard
                title="Last Updated"
                value={
                  stats?.latest_article_ts
                    ? new Date(stats.latest_article_ts * 1000).toLocaleDateString()
                    : 'N/A'
                }
                isLoading={loading.stats}
              />
            </div>

            <div className="dashboard-grid">
              <PostsPerDayChart
                data={postsPerDay}
                isLoading={loading.postsPerDay}
              />
              <TopAuthorsChart
                data={topAuthors}
                isLoading={loading.topAuthors}
                selectedAuthorId={selectedAuthor?.author_id}
                onAuthorSelect={setSelectedAuthor}
              />
            </div>

            <div className="dashboard-grid">
              <div style={{ gridColumn: 'span 1' }}>
                <TopAuthorsGrid
                  data={topAuthors}
                  isLoading={loading.topAuthors}
                  selectedAuthorId={selectedAuthor?.author_id}
                  onAuthorSelect={setSelectedAuthor}
                />
              </div>
            </div>

            <div className="dashboard-grid">
              <div style={{ gridColumn: 'span 1' }}>
                <RecentArticles
                  data={recentArticles}
                  isLoading={loading.recentArticles}
                  selectedAuthor={selectedAuthor}
                  onClearAuthorFilter={() => setSelectedAuthor(null)}
                />
              </div>
            </div>

            <div className="dashboard-grid">
              <div style={{ gridColumn: 'span 1' }}>
                <ReportExport
                  websites={websites}
                  dateRange={dateRange}
                  selectedWebsite={selectedWebsite}
                />
              </div>
            </div>

            <div className="footer">
              <p>Dashboard auto-refreshes every 30 seconds</p>
            </div>
          </div>
        ) : (
          <MailchimpDashboard />
        )}
      </main>
    </div>
  )
}

export default App
