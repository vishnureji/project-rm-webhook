import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './components/ui/table'
import Badge from './components/ui/badge'
import StateBlock from './components/ui/state-block'
import KpiCard from './components/dashboard/KpiCard'
import GoogleAnalyticsCard from './components/dashboard/GoogleAnalyticsCard'
import PostsPerDayChart from './components/PostsPerDayChart'
import TopAuthorsChart from './components/TopAuthorsChart'
import FilterBar from './components/dashboard/FilterBar'
import DashboardSection from './components/dashboard/DashboardSection'
import AnalyticsChartCard from './components/dashboard/AnalyticsChartCard'
import ComparisonTable from './components/dashboard/ComparisonTable'
import AuthorPerformanceItem from './components/dashboard/AuthorPerformanceItem'
import ArticleRow from './components/dashboard/ArticleRow'
import ExportActionBar from './components/dashboard/ExportActionBar'
import {
  getStats,
  getPostsPerDay,
  getTopAuthors,
  getRecentArticles,
  getWebsites,
  getGAComparison,
  getGAProperties,
} from './api'

function formatRelativeTrend(value) {
  if (!Number.isFinite(value) || value === 0) {
    return { value: 0, label: '0%' }
  }

  const sign = value > 0 ? '+' : ''
  return {
    value,
    label: `${sign}${value.toFixed(1)}%`,
  }
}

function computePlatformComparison(articles) {
  if (!articles?.length) {
    return []
  }

  const groups = articles.reduce((acc, article) => {
    const platform = article.website_name || 'Unknown'
    if (!acc[platform]) {
      acc[platform] = {
        platform,
        posts: 0,
        recentWindow: 0,
        previousWindow: 0,
      }
    }

    acc[platform].posts += 1

    if (article.created_ts) {
      const ageInDays = (Date.now() - article.created_ts * 1000) / (1000 * 60 * 60 * 24)
      if (ageInDays <= 7) {
        acc[platform].recentWindow += 1
      } else if (ageInDays <= 14) {
        acc[platform].previousWindow += 1
      }
    }

    return acc
  }, {})

  const totalPosts = articles.length

  return Object.values(groups)
    .map((row) => ({
      platform: row.platform,
      posts: row.posts,
      share: row.posts / totalPosts,
      momentum: row.recentWindow - row.previousWindow,
    }))
    .sort((a, b) => b.posts - a.posts)
}

function getArticlePerformanceLabel(article, topAuthors) {
  const authorPostCount = topAuthors?.find((author) => author.name === article.author)?.post_count ?? 0
  if (authorPostCount >= 10) return 'High'
  if (authorPostCount >= 4) return 'Medium'
  return 'Low'
}

function App() {
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [websites, setWebsites] = useState(null)
  const [dateRange, setDateRange] = useState({
    preset: '30days',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [stats, setStats] = useState(null)
  const [previousStats, setPreviousStats] = useState(null)
  const [postsPerDay, setPostsPerDay] = useState(null)
  const [topAuthors, setTopAuthors] = useState(null)
  const [recentArticles, setRecentArticles] = useState(null)
  const [gaMetrics, setGaMetrics] = useState(null)
  const [previousGaMetrics, setPreviousGaMetrics] = useState(null)
  const [loading, setLoading] = useState({
    websites: true,
    stats: true,
    postsPerDay: true,
    topAuthors: true,
    recentArticles: true,
    gaMetrics: true,
  })
  const [error, setError] = useState(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null)

      // Load websites once
      if (!websites || websites.length === 0) {
        try {
          const websitesData = await getWebsites()
          setWebsites(websitesData)
          setLoading((prev) => ({ ...prev, websites: false }))
          // Auto-select first website
          if (websitesData && websitesData.length > 0 && !selectedWebsite) {
            setSelectedWebsite(websitesData[0])
            console.log('Auto-selected first website:', websitesData[0])
          }
          return // Exit early to let auto-select trigger next load
        } catch (err) {
          console.error('Error loading websites:', err)
          setLoading((prev) => ({ ...prev, websites: false }))
        }
      }

      // If no website selected, can't continue
      if (!selectedWebsite) {
        return
      }

      // Load other data
      const [statsData, postsData, authorsData, articlesData] = await Promise.all([
        getStats(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getPostsPerDay(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getRecentArticles(50, selectedWebsite, dateRange.startDate, dateRange.endDate),
      ])

      setStats(statsData)
      setLoading((prev) => ({ ...prev, stats: false }))

      setPostsPerDay(postsData)
      setLoading((prev) => ({ ...prev, postsPerDay: false }))

      setTopAuthors(authorsData)
      setLoading((prev) => ({ ...prev, topAuthors: false }))

      setRecentArticles(articlesData)
      setLoading((prev) => ({ ...prev, recentArticles: false }))

      // Fetch Google Analytics metrics
      try {
        console.log('Fetching GA metrics for website:', selectedWebsite)
        const gaData = await getGAComparison(dateRange.startDate, dateRange.endDate, true, selectedWebsite)
        console.log('GA data received:', gaData)
        if (gaData && gaData.current && gaData.current.metrics) {
          setGaMetrics(gaData.current.metrics)
        } else {
          console.warn('GA data missing or error:', gaData)
          setGaMetrics(null)
        }
      } catch (gaError) {
        console.error('Error loading GA metrics:', gaError)
        setGaMetrics(null)
      } finally {
        setLoading((prev) => ({ ...prev, gaMetrics: false }))
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Ensure the webhook server is running at http://localhost:8000')
      setLoading({
        websites: false,
        stats: false,
        postsPerDay: false,
        topAuthors: false,
        recentArticles: false,
        gaMetrics: false,
      })
    }
  }, [selectedWebsite, dateRange, websites])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  const articleTrend = useMemo(() => {
    if (!previousStats?.total_articles || !stats?.total_articles) return null
    const delta = ((stats.total_articles - previousStats.total_articles) / previousStats.total_articles) * 100
    return formatRelativeTrend(delta)
  }, [previousStats, stats])

  const authorTrend = useMemo(() => {
    if (!previousStats?.total_authors || !stats?.total_authors) return null
    const delta = ((stats.total_authors - previousStats.total_authors) / previousStats.total_authors) * 100
    return formatRelativeTrend(delta)
  }, [previousStats, stats])

  const platformComparisonRows = useMemo(() => computePlatformComparison(recentArticles || []), [recentArticles])
  const totalAuthorPosts = useMemo(
    () => (topAuthors || []).reduce((sum, author) => sum + (author.post_count || 0), 0),
    [topAuthors]
  )

  const filteredArticles = useMemo(() => {
    if (!selectedAuthor) return recentArticles || []
    return (recentArticles || []).filter((article) => article.author === selectedAuthor.name)
  }, [selectedAuthor, recentArticles])

  return (
    <div className="dashboard-app">
      <header className="dashboard-page-header">
        <div>
          <p className="eyebrow">Post Analytics Dashboard</p>
          <h1>Content Performance Console</h1>
          <p className="subtitle">Scan insights, compare platforms, and evaluate author productivity in one workspace.</p>
        </div>
        <div className="refresh-note">
          <RefreshCw size={14} /> Auto-refresh every 30 seconds
        </div>
      </header>

      <FilterBar
        websites={websites}
        selectedWebsite={selectedWebsite}
        onWebsiteChange={setSelectedWebsite}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={loading.websites}
        rightSlot={
          <ExportActionBar
            websites={websites}
            selectedWebsite={selectedWebsite}
            dateRange={dateRange}
            compact
            error={error}
          />
        }
      />

      {error ? (
        <div className="global-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <DashboardSection
        title="Insight Strip"
        description="Critical KPIs with fast trend context for this filter scope."
      >
        <div className="insight-strip">
          <KpiCard
            title="Total Articles"
            value={stats?.total_articles ?? 0}
            trend={articleTrend}
            variant="primary"
            context="vs previous refresh"
            isLoading={loading.stats}
            isEmpty={!loading.stats && !stats}
            error={error}
          />
          <KpiCard
            title="Active Authors"
            value={stats?.total_authors ?? 0}
            trend={authorTrend}
            variant="neutral"
            context="vs previous refresh"
            isLoading={loading.stats}
            isEmpty={!loading.stats && !stats}
            error={error}
          />
          <KpiCard
            title="Last Updated"
            value={
              stats?.latest_article_ts
                ? new Date(stats.latest_article_ts * 1000).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'
            }
            trend={stats?.latest_article_ts ? { value: 1, label: 'Live' } : null}
            variant="warning"
            context="Most recent article timestamp"
            isLoading={loading.stats}
            isEmpty={!loading.stats && !stats}
            error={error}
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Google Analytics Insights"
        description="Real-time website metrics: visitor engagement, page activity, and session duration."
      >
        <GoogleAnalyticsCard
          title="Website Performance (Google Analytics)"
          metrics={gaMetrics}
          previousMetrics={previousGaMetrics}
          isLoading={loading.gaMetrics}
          error={gaMetrics?.error}
          dateRange={dateRange}
        />
      </DashboardSection>

      <DashboardSection
        title="Primary Analytics"
        description="Daily publication trend and platform comparison to spot where output is concentrated."
      >
        <div className="primary-analytics-grid">
          <PostsPerDayChart data={postsPerDay} isLoading={loading.postsPerDay} error={error} />

          <AnalyticsChartCard
            title="Platform Comparison"
            description="Cross-platform share and short-window momentum from recent publications."
            isLoading={loading.recentArticles}
            isEmpty={!loading.recentArticles && platformComparisonRows.length === 0}
            error={error}
          >
            <ComparisonTable rows={platformComparisonRows} isLoading={false} error={null} />
          </AnalyticsChartCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Secondary Insights"
        description="Author-level comparison with direct selection for article drill-down."
      >
        <div className="secondary-grid">
          <TopAuthorsChart
            data={topAuthors}
            isLoading={loading.topAuthors}
            selectedAuthorId={selectedAuthor?.author_id}
            onAuthorSelect={setSelectedAuthor}
            error={error}
          />

          <AnalyticsChartCard
            title="Author Performance"
            description="Ranked contribution list with quality tags and portfolio share."
            isLoading={loading.topAuthors}
            isEmpty={!loading.topAuthors && (!topAuthors || topAuthors.length === 0)}
            error={error}
          >
            <div className="author-performance-list">
              {(topAuthors || []).slice(0, 8).map((author, index) => (
                <AuthorPerformanceItem
                  key={author.author_id}
                  author={author}
                  rank={index + 1}
                  totalPosts={totalAuthorPosts}
                  selected={selectedAuthor?.author_id === author.author_id}
                  onSelect={() => setSelectedAuthor({ author_id: author.author_id, name: author.name })}
                />
              ))}
            </div>
          </AnalyticsChartCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Recent Content"
        description="Structured list for quick scanning across title, author, platform, and performance signal."
        action={
          selectedAuthor ? (
            <button className="clear-filter" onClick={() => setSelectedAuthor(null)}>
              Clear author filter ({selectedAuthor.name})
            </button>
          ) : null
        }
      >
        <div className="recent-content-card">
          {loading.recentArticles ? (
            <StateBlock type="loading" title="Loading articles" description="Compiling latest content records..." />
          ) : filteredArticles.length === 0 ? (
            <StateBlock
              type="empty"
              title="No recent articles"
              description={selectedAuthor ? `No results for ${selectedAuthor.name}.` : 'No articles found for these filters.'}
            />
          ) : (
            <div className="article-table-shell">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Author</TableHeaderCell>
                    <TableHeaderCell>Platform</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Performance</TableHeaderCell>
                    <TableHeaderCell>
                      <div className="ga-header-cell">
                        <span>Unique Visitors</span>
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell>
                      <div className="ga-header-cell">
                        <span>Page Views</span>
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell>
                      <div className="ga-header-cell">
                        <span>Avg Duration</span>
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredArticles.slice(0, 20).map((article) => (
                    <ArticleRow
                      key={article.post_id}
                      article={article}
                      scoreLabel={getArticlePerformanceLabel(article, topAuthors || [])}
                      gaMetrics={gaMetrics}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Actions"
        description="Export reports without losing dashboard context."
      >
        <ExportActionBar
          websites={websites}
          selectedWebsite={selectedWebsite}
          dateRange={dateRange}
          error={error}
        />
      </DashboardSection>

      <footer className="dashboard-footer">
        <Badge variant="neutral">amg.biz</Badge>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Selected Website</TableCell>
              <TableCell>{selectedWebsite || 'All Websites'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </footer>

      <style>{`
        .ga-header-cell {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
        }
      `}</style>
    </div>
  )
}

export default App
