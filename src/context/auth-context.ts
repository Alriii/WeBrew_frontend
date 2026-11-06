import { createContext } from 'react'

export interface AuthContextValue {
  email: string | null
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
