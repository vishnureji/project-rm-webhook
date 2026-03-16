import React, { useState, useEffect } from 'react'
import StatsCard from './components/StatsCard'
import PostsPerDayChart from './components/PostsPerDayChart'
import TopAuthorsChart from './components/TopAuthorsChart'
import TopAuthorsGrid from './components/TopAuthorsGrid'
import RecentArticles from './components/RecentArticles'
import WebsiteSelector from './components/WebsiteSelector'
import { getStats, getPostsPerDay, getTopAuthors, getRecentArticles, getWebsites } from './api'

function App() {
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [websites, setWebsites] = useState(null)
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
  }, [selectedWebsite])

  const loadDashboardData = async () => {
    try {
      setError(null)

      // Load websites first if not already loaded
      if (!websites) {
        const websitesData = await getWebsites()
        setWebsites(websitesData)
        setLoading((prev) => ({ ...prev, websites: false }))
      }

      // Load data for selected website
      const statsData = await getStats(selectedWebsite)
      setStats(statsData)
      setLoading((prev) => ({ ...prev, stats: false }))

      const postsData = await getPostsPerDay(selectedWebsite)
      setPostsPerDay(postsData)
      setLoading((prev) => ({ ...prev, postsPerDay: false }))

      const authorsData = await getTopAuthors(selectedWebsite)
      setTopAuthors(authorsData)
      setLoading((prev) => ({ ...prev, topAuthors: false }))

      const articlesData = await getRecentArticles(20, selectedWebsite)
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
    <div className="container">
      <div className="header">
        <h1>📊 Webhook Analytics Dashboard</h1>
        <p>Real-time insights into your published content</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <WebsiteSelector
        websites={websites}
        selectedWebsite={selectedWebsite}
        onSelect={setSelectedWebsite}
        isLoading={loading.websites}
      />

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
        />
      </div>

      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 1' }}>
          <TopAuthorsGrid
            data={topAuthors}
            isLoading={loading.topAuthors}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 1' }}>
          <RecentArticles
            data={recentArticles}
            isLoading={loading.recentArticles}
          />
        </div>
      </div>

      <div className="footer">
        <p>Dashboard auto-refreshes every 30 seconds • Built with React & Recharts</p>
      </div>
    </div>
  )
}

export default App
