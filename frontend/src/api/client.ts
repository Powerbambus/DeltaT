// public/config.js sets window.__ENV__.API_URL at container start (see
// docker-entrypoint.sh), so the same built image can target different
// backends without a rebuild. In local dev that placeholder is never
// substituted, so fall back to the Vite build-time env var.
const runtimeApiUrl = window.__ENV__?.API_URL
const API_BASE_URL =
  runtimeApiUrl && runtimeApiUrl !== '__API_URL__' ? runtimeApiUrl : import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: string
  body?: BodyInit
  json?: unknown
  headers?: Record<string, string>
  token?: string | null
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  let body = options.body
  if (options.json !== undefined) {
    body = JSON.stringify(options.json)
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    body,
    headers,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const data = await response.json()
      detail = data.detail ?? detail
    } catch {
      // response body wasn't JSON, keep statusText
    }
    throw new ApiError(detail, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
