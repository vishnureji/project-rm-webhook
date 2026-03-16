import React, { useState, useEffect } from 'react'
import StatsCard from './components/StatsCard'
import PostsPerDayChart from './components/PostsPerDayChart'
import TopAuthorsChart from './components/TopAuthorsChart'
import TopAuthorsGrid from './components/TopAuthorsGrid'
import RecentArticles from './components/RecentArticles'
import { getStats, getPostsPerDay, getTopAuthors, getRecentArticles } from './api'

function App() {
  const [stats, setStats] = useState(null)
  const [postsPerDay, setPostsPerDay] = useState(null)
  const [topAuthors, setTopAuthors] = useState(null)
  const [recentArticles, setRecentArticles] = useState(null)
  const [loading, setLoading] = useState({
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
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)

      const statsData = await getStats()
      setStats(statsData)
      setLoading((prev) => ({ ...prev, stats: false }))

      const postsData = await getPostsPerDay()
      setPostsPerDay(postsData)
      setLoading((prev) => ({ ...prev, postsPerDay: false }))

      const authorsData = await getTopAuthors()
      setTopAuthors(authorsData)
      setLoading((prev) => ({ ...prev, topAuthors: false }))

      const articlesData = await getRecentArticles(20)
      setRecentArticles(articlesData)
      setLoading((prev) => ({ ...prev, recentArticles: false }))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(
        'Failed to load dashboard data. Make sure the webhook server is running on http://localhost:8000'
      )
      setLoading({
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
