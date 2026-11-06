import { Coffee, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'

interface LoginPageProps {
  error: string | null
  submitting: boolean
  onSubmit: (email: string, password: string) => Promise<void>
}

export function LoginPage({ error, submitting, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit(email, password)
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand-mark"><Coffee size={23} /></div>
        <p className="eyebrow">WEBREW CAFÉ · OWNER WORKSPACE</p>
        <h1 id="auth-title">Welcome back.</h1>
        <p className="auth-description">Sign in to see how your café is doing.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="owner-email">Email address</label>
          <input
            id="owner-email"
            autoComplete="username"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="owner-password">Password</label>
          <input
            id="owner-password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <Button type="submit" disabled={submitting}>
            <LockKeyhole size={16} />
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="auth-footnote">A quiet little space, just for your café.</p>
      </section>
    </main>
  )
}
