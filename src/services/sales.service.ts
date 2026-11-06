import type { ApiData, ApiList, Category, Sale, Weather } from '../lib/types'
import { apiRequest } from './api'

export interface SaleInput {
  quantity: number
  productId?: number
  productName?: string
  category?: Category
  price?: number
  saleDate?: string
  customerRating?: number | null
  weatherCondition?: Weather | null
}

export async function listSales() {
  const response = await apiRequest<ApiList<Sale>>('/api/sales?limit=500&offset=0')
  return response.data
}

export async function createSale(input: SaleInput) {
  const response = await apiRequest<ApiData<Sale>>('/api/sales', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function updateSale(id: number, input: Partial<SaleInput>) {
  const response = await apiRequest<ApiData<Sale>>(`/api/sales/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function deleteSale(id: number) {
  return apiRequest<void>(`/api/sales/${id}`, { method: 'DELETE' })
}
