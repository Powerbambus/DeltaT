import { apiRequest } from './client'
import type { Token, UserRead } from './types'

export function login(email: string, password: string): Promise<Token> {
  const body = new URLSearchParams({ username: email, password })

  return apiRequest<Token>('/auth/login', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function fetchCurrentUser(token: string): Promise<UserRead> {
  return apiRequest<UserRead>('/auth/me', { token })
}
