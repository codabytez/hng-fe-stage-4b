import { api } from '@/lib/axios'
import type { User } from '@/types/models'

export const usersService = {
  search: (q: string) =>
    api.get<User[]>('/users/search', { params: { q } }).then((r) => r.data),

  getPublicKey: (userId: string) =>
    api.get<{ public_key: string }>(`/users/${userId}/public-key`).then((r) => r.data),
}
