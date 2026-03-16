import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const getStats = async () => {
  const response = await api.get('/stats')
  return response.data
}

export const getPostsPerDay = async () => {
  const response = await api.get('/posts-per-day')
  return response.data
}

export const getTopAuthors = async () => {
  const response = await api.get('/top-authors')
  return response.data
}

export const getRecentArticles = async (limit = 20) => {
  const response = await api.get(`/recent-articles?limit=${limit}`)
  return response.data
}

export default api
