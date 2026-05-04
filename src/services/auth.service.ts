import { api } from '@/lib/axios'
import type { RegisterRequest, LoginRequest, AuthResponse } from '@/types/api'

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () =>
    api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refresh_token: refreshToken }),
}
