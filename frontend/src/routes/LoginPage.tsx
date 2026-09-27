import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setToken(data.access_token)
      navigate(from, { replace: true })
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-gray-900">DeltaT Login</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : 'Login fehlgeschlagen.'}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  )
}
