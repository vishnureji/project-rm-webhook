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

export const getStats = async (websiteId = null) => {
  const params = websiteId ? { website_id: websiteId } : {}
  const response = await api.get('/stats', { params })
  return response.data
}

export const getPostsPerDay = async (websiteId = null) => {
  const params = websiteId ? { website_id: websiteId } : {}
  const response = await api.get('/posts-per-day', { params })
  return response.data
}

export const getTopAuthors = async (websiteId = null) => {
  const params = websiteId ? { website_id: websiteId } : {}
  const response = await api.get('/top-authors', { params })
  return response.data
}

export const getRecentArticles = async (limit = 20, websiteId = null) => {
  const params = { limit }
  if (websiteId) params.website_id = websiteId
  const response = await api.get(`/recent-articles`, { params })
  return response.data
}

export default api
