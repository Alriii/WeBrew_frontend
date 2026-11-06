import type { ApiData, ApiList, Category, Product } from '../lib/types'
import { apiRequest } from './api'

export interface ProductInput {
  name: string
  category: Category
  price: number
}

export async function listProducts() {
  const response = await apiRequest<ApiList<Product>>('/api/products')
  return response.data
}

export async function createProduct(input: ProductInput) {
  const response = await apiRequest<ApiData<Product>>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const response = await apiRequest<ApiData<Product>>(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return response.data
}

export async function deleteProduct(id: number) {
  return apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' })
}
