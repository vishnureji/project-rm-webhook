import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const getWebsites = async () => {
  const response = await api.get('/websites')
  return response.data
}

export const getStats = async (websiteId = null, startDate = null, endDate = null) => {
  const params = {}
  if (websiteId) params.website_id = websiteId
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const response = await api.get('/stats', { params })
  return response.data
}

export const getPostsPerDay = async (websiteId = null, startDate = null, endDate = null) => {
  const params = {}
  if (websiteId) params.website_id = websiteId
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const response = await api.get('/posts-per-day', { params })
  return response.data
}

export const getTopAuthors = async (websiteId = null, startDate = null, endDate = null) => {
  const params = {}
  if (websiteId) params.website_id = websiteId
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const response = await api.get('/top-authors', { params })
  return response.data
}

export const getRecentArticles = async (limit = 20, websiteId = null, startDate = null, endDate = null) => {
  const params = { limit }
  if (websiteId) params.website_id = websiteId
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const response = await api.get(`/recent-articles`, { params })
  return response.data
}

// --- Google Analytics Metrics ---
export const getGAMetrics = async (startDate = null, endDate = null, websiteId = null) => {
  const params = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  if (websiteId) params.website_id = websiteId
  const response = await api.get('/ga-metrics', { params })
  return response.data
}

export const getGAComparison = async (startDate = null, endDate = null, includePrevious = true, websiteId = null) => {
  const params = { previous_period: includePrevious }
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  if (websiteId) params.website_id = websiteId
  const response = await api.get('/ga-comparison', { params })
  return response.data
}

export const getGAProperties = async () => {
  const response = await api.get('/ga-properties')
  return response.data
}

export const getGAPageMetrics = async (pagePath, websiteId = null, startDate = null, endDate = null) => {
  const params = { page_path: pagePath }
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  if (websiteId) params.website_id = websiteId
  const response = await api.get('/ga-page-metrics', { params })
  return response.data
}

export const getGABatchMetrics = async (pagePaths, websiteId = null, startDate = null, endDate = null) => {
  const payload = { page_paths: pagePaths }
  if (startDate) payload.start_date = startDate
  if (endDate) payload.end_date = endDate
  if (websiteId) payload.website_id = websiteId
  const response = await api.post('/ga-batch-metrics', payload)
  return response.data
}

export default api
