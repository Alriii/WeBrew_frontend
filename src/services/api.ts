import { API_BASE_URL } from '../constants/app'
import { getAccessToken } from '../lib/authToken'

interface ApiErrorBody {
  error?: string
  details?: Array<{ path: string; message: string }>
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (import.meta.env.PROD && !API_BASE_URL.trim()) {
    throw new ApiError(
      'The API URL is not configured for this deployment. Set VITE_API_BASE_URL to your deployed backend URL and redeploy.',
      0,
    )
  }

  let response: Response
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      'Could not reach the server. Check that the backend is running and try again.',
      0,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    if (response.ok) {
      throw new ApiError(
        'The server returned a non-JSON response. Check VITE_API_BASE_URL and make sure it points to the backend API.',
        response.status,
      )
    }
    throw new ApiError(`Request failed (${response.status}).`, response.status)
  }

  if (!response.ok) {
    if (response.status === 401 && token && path !== '/api/auth/login') {
      window.dispatchEvent(new Event('webrew:unauthorized'))
    }

    const errorBody = body && typeof body === 'object'
      ? body as ApiErrorBody
      : null
    const detail = errorBody?.details?.[0]?.message
    throw new ApiError(
      detail ?? errorBody?.error ?? `Request failed (${response.status}).`,
      response.status,
    )
  }

  if (body === null || typeof body !== 'object') {
    throw new ApiError(
      'The server returned an empty or invalid API response. Check VITE_API_BASE_URL and the backend API.',
      response.status,
    )
  }

  return body as T
}
