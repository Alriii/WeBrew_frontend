import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../../services/api'
import { clearAccessToken, setAccessToken } from '../../lib/authToken'
import { AuthContext } from '../../context/auth-context'
import { getAuthSession, loginOwner } from '../../services/auth.service'
import { LoginPage } from '../features/auth/LoginPage'
import { Notice } from '../common/Notice'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authRequired, setAuthRequired] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      const session = await getAuthSession()
      setError(null)
      setAuthRequired(session.authRequired)
      setAuthenticated(session.authenticated)
      setEmail(session.email)
    } catch (sessionError) {
      if (sessionError instanceof ApiError && sessionError.status === 401) {
        clearAccessToken()
        setAuthRequired(true)
        setAuthenticated(false)
        setEmail(null)
      } else {
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : 'Could not connect to the café server.',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken()
      setAuthRequired(true)
      setAuthenticated(false)
      setEmail(null)
    }

    window.addEventListener('webrew:unauthorized', handleUnauthorized)
    const timer = window.setTimeout(() => void refreshSession(), 0)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('webrew:unauthorized', handleUnauthorized)
    }
  }, [refreshSession])

  const login = useCallback(async (ownerEmail: string, password: string) => {
    setSubmitting(true)
    setError(null)
    try {
      const result = await loginOwner(ownerEmail, password)
      setAccessToken(result.token)
      setEmail(result.email)
      setAuthRequired(true)
      setAuthenticated(true)
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Could not sign in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    setEmail(null)
    setAuthenticated(false)
  }, [])

  if (loading) {
    return <div className="route-loading" role="status">Checking your workspace…</div>
  }

  if (error && !authRequired) {
    return (
      <main className="auth-screen">
        <div className="auth-message">
          <Notice message={error} onRetry={() => void refreshSession()} />
        </div>
      </main>
    )
  }

  if (authRequired && !authenticated) {
    return (
      <LoginPage
        error={error}
        submitting={submitting}
        onSubmit={login}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ email, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
