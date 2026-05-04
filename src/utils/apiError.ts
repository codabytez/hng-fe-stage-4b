import axios from 'axios'

export function getApiError(error: unknown): string | undefined {
  if (!error) return undefined
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    const message = error.response?.data?.message
    return detail ?? message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
