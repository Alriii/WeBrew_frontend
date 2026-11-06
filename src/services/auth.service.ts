import type { ApiData } from '../lib/types'
import { apiRequest } from './api'

export interface AuthSession {
  authenticated: boolean
  authRequired: boolean
  email: string | null
}

interface LoginResponse {
  token: string
  email: string
  expiresInSeconds: number
}

export async function getAuthSession() {
  const response = await apiRequest<ApiData<AuthSession>>('/api/auth/session')
  return response.data
}

export async function loginOwner(email: string, password: string) {
  const response = await apiRequest<ApiData<LoginResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return response.data
}
