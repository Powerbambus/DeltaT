import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/auth'
import type { UserRead } from '../api/types'

// TODO: token lives in localStorage for now since the backend only issues a
// plain bearer JWT (no httpOnly cookie / refresh-token flow). Revisit if the
// backend ever adds a cookie-based session.
const TOKEN_STORAGE_KEY = 'deltat_access_token'

interface AuthContextValue {
  token: string | null
  user: UserRead | undefined
  isLoadingUser: boolean
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )
  const queryClient = useQueryClient()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser', token],
    queryFn: () => fetchCurrentUser(token!),
    enabled: token !== null,
    retry: false,
  })

  function setToken(newToken: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    setTokenState(newToken)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setTokenState(null)
    queryClient.removeQueries({ queryKey: ['currentUser'] })
  }

  const value = useMemo(
    () => ({ token, user, isLoadingUser, setToken, logout }),
    [token, user, isLoadingUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
