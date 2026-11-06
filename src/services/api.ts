import { API_BASE_URL } from '../constants/app'

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
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
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

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    const detail = errorBody?.details?.[0]?.message
    throw new ApiError(
      detail ?? errorBody?.error ?? `Request failed (${response.status}).`,
      response.status,
    )
  }

  return body as T
}
