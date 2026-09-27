export {}

declare global {
  interface Window {
    __ENV__?: {
      API_URL?: string
    }
  }
}
