import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './components/ui/table'
import Badge from './components/ui/badge'
import Button from './components/ui/button'
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
  getGAMetrics,
  getGABatchMetrics,
} from './api'

const ARTICLES_PER_PAGE = 10

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

function extractPagePath(url) {
  if (!url) return null
  try {
    return new URL(url).pathname
  } catch {
    return null
  }
}

function dateToString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getInitialFilters() {
  const today = new Date()
  const params = new URLSearchParams(window.location.search)

  return {
    websiteId: params.get('website_id'),
    dateRange: {
      preset: params.get('preset') || 'today',
      startDate: params.get('start_date') || dateToString(today),
      endDate: params.get('end_date') || dateToString(today),
    },
    articleSearch: params.get('article') || '',
  }
}

function App() {
  const initialFilters = useMemo(() => getInitialFilters(), [])
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [websites, setWebsites] = useState(null)
  const [dateRange, setDateRange] = useState({
    preset: initialFilters.dateRange.preset,
    startDate: initialFilters.dateRange.startDate,
    endDate: initialFilters.dateRange.endDate,
  })
  const [articleSearch, setArticleSearch] = useState(initialFilters.articleSearch)
  const [stats, setStats] = useState(null)
  const [previousStats, setPreviousStats] = useState(null)
  const [postsPerDay, setPostsPerDay] = useState(null)
  const [topAuthors, setTopAuthors] = useState(null)
  const [recentArticles, setRecentArticles] = useState(null)
  const [gaMetrics, setGaMetrics] = useState(null)
  const [articleGaMetrics, setArticleGaMetrics] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [shareMessage, setShareMessage] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const latestStatsRef = useRef(null)
  const latestRequestIdRef = useRef(0)
  const hasLoadedOnceRef = useRef(false)
  const [loading, setLoading] = useState({
    websites: true,
    stats: true,
    postsPerDay: true,
    topAuthors: true,
    recentArticles: true,
    gaMetrics: true,
    articleMetrics: true,
  })
  const [error, setError] = useState(null)

  // Load websites on initial mount
  useEffect(() => {
    const loadWebsites = async () => {
      try {
        const data = await getWebsites()
        setWebsites(data)
        setLoading((prev) => ({ ...prev, websites: false }))
        if (data && data.length > 0) {
          const requestedWebsiteId = initialFilters.websiteId
          const defaultWebsiteId = data.some((website) => website.website_id === requestedWebsiteId)
            ? requestedWebsiteId
            : data[0].website_id
          setSelectedWebsite(defaultWebsiteId)
        }
      } catch (err) {
        console.error('Error loading websites:', err)
        setLoading((prev) => ({ ...prev, websites: false }))
        setError('Failed to load websites')
      }
    }
    loadWebsites()
  }, [])

  // Load dashboard data when website or date range changes
  const loadDashboardData = useCallback(async ({ background = false } = {}) => {
    if (!selectedWebsite) return

    const requestId = latestRequestIdRef.current + 1
    latestRequestIdRef.current = requestId

    try {
      setError(null)
      const shouldShowLoading = !background || !hasLoadedOnceRef.current
      if (background) {
        setIsRefreshing(true)
      }
      if (shouldShowLoading) {
        setArticleGaMetrics({})
        setLoading((prev) => ({
          ...prev,
          stats: true,
          postsPerDay: true,
          topAuthors: true,
          recentArticles: true,
          gaMetrics: true,
          articleMetrics: true,
        }))
      }

      const [statsData, postsData, authorsData, articlesData, gaData] = await Promise.all([
        getStats(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getPostsPerDay(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getTopAuthors(selectedWebsite, dateRange.startDate, dateRange.endDate),
        getRecentArticles(50, selectedWebsite, dateRange.startDate, dateRange.endDate),
        getGAMetrics(dateRange.startDate, dateRange.endDate, selectedWebsite).catch((err) => {
          console.error('Error loading GA metrics:', err)
          return null
        }),
      ])

      if (latestRequestIdRef.current !== requestId) {
        return
      }

      setPreviousStats(latestStatsRef.current)
      latestStatsRef.current = statsData
      setStats(statsData)

      setPostsPerDay(postsData)

      setTopAuthors(authorsData)

      setRecentArticles(articlesData)

      if (gaData && gaData.metrics) {
        setGaMetrics(gaData.metrics)
      } else {
        setGaMetrics(null)
      }

      const articlePagePaths = [...new Set((articlesData || []).map((article) => extractPagePath(article.post_url)).filter(Boolean))]

      if (articlePagePaths.length > 0) {
        try {
          const batchData = await getGABatchMetrics(
            articlePagePaths,
            selectedWebsite,
            dateRange.startDate,
            dateRange.endDate
          )
          if (latestRequestIdRef.current !== requestId) {
            return
          }
          setArticleGaMetrics(batchData?.metrics || {})
        } catch (batchError) {
          if (latestRequestIdRef.current !== requestId) {
            return
          }
          console.error('Error loading article GA metrics:', batchError)
          setArticleGaMetrics({})
        }
      } else {
        setArticleGaMetrics({})
      }
      hasLoadedOnceRef.current = true
      setLoading((prev) => ({
        ...prev,
        stats: false,
        postsPerDay: false,
        topAuthors: false,
        recentArticles: false,
        gaMetrics: false,
        articleMetrics: false,
      }))
    } catch (err) {
      if (latestRequestIdRef.current !== requestId) {
        return
      }
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
      setArticleGaMetrics({})
      setLoading({
        stats: false,
        postsPerDay: false,
        topAuthors: false,
        recentArticles: false,
        gaMetrics: false,
        articleMetrics: false,
      })
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsRefreshing(false)
      }
    }
  }, [selectedWebsite, dateRange])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(() => loadDashboardData({ background: true }), 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  useEffect(() => {
    if (!selectedWebsite) return

    const params = new URLSearchParams()
    params.set('website_id', selectedWebsite)
    params.set('preset', dateRange.preset || 'custom')
    if (dateRange.startDate) params.set('start_date', dateRange.startDate)
    if (dateRange.endDate) params.set('end_date', dateRange.endDate)
    if (articleSearch.trim()) params.set('article', articleSearch.trim())

    const nextUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', nextUrl)
  }, [selectedWebsite, dateRange, articleSearch])

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
    return (recentArticles || []).filter((article) => {
      const matchesAuthor = !selectedAuthor || article.author === selectedAuthor.name
      const matchesSearch = !articleSearch.trim() || (article.headline || '').toLowerCase().includes(articleSearch.trim().toLowerCase())
      return matchesAuthor && matchesSearch
    })
  }, [selectedAuthor, recentArticles, articleSearch])

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE))
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE)
  }, [currentPage, filteredArticles])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAuthor, selectedWebsite, dateRange.startDate, dateRange.endDate, articleSearch])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Link copied')
      setTimeout(() => setShareMessage(''), 2500)
    } catch {
      setShareMessage('Copy failed')
      setTimeout(() => setShareMessage(''), 2500)
    }
  }

  return (
    <div className="dashboard-app">
      <header className="dashboard-page-header">
        <div>
          <p className="eyebrow">Post Analytics Dashboard</p>
          <h1>Content Performance Console</h1>
          <p className="subtitle">Scan insights, compare platforms, and evaluate author productivity in one workspace.</p>
        </div>
        <div className="refresh-note">
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} /> Auto-refresh every 30 seconds
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
          <div className="filter-actions">
            <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
              Share View
            </Button>
            {shareMessage ? <Badge variant={shareMessage === 'Link copied' ? 'success' : 'danger'}>{shareMessage}</Badge> : null}
            <ExportActionBar
              websites={websites}
              selectedWebsite={selectedWebsite}
              dateRange={dateRange}
              compact
              error={error}
            />
          </div>
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
          <>
            <input
              type="search"
              className="article-search-input"
              placeholder="Search by article name"
              value={articleSearch}
              onChange={(event) => setArticleSearch(event.target.value)}
            />
            {selectedAuthor ? (
              <button className="clear-filter" onClick={() => setSelectedAuthor(null)}>
                Clear author filter ({selectedAuthor.name})
              </button>
            ) : null}
          </>
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
            <>
              <div className="article-table-shell">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Title</TableHeaderCell>
                      <TableHeaderCell>Author</TableHeaderCell>
                      <TableHeaderCell>Platform</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
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
                    {paginatedArticles.map((article) => (
                      <ArticleRow
                        key={article.post_id}
                        article={article}
                        pageMetrics={articleGaMetrics[extractPagePath(article.post_url)]}
                        isLoading={loading.articleMetrics}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="table-pagination">
                <span className="table-pagination-status">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="table-pagination-controls">
                  <button
                    className="clear-filter"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="clear-filter"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
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
