import type {
  ApiData,
  DashboardStats,
  ForecastDay,
  Recommendation,
} from '../lib/types'
import { apiRequest } from './api'

export async function getDashboardStats() {
  const response = await apiRequest<ApiData<DashboardStats>>('/api/sales/stats')
  return response.data
}

export async function getForecast() {
  const response = await apiRequest<ApiData<ForecastDay[]>>('/api/sales/forecast')
  return response.data
}

export async function getRecommendations() {
  const response = await apiRequest<ApiData<Recommendation[]>>(
    '/api/sales/recommendations',
  )
  return response.data
}
