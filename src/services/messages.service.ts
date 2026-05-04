import { api } from '@/lib/axios'
import type { Message, Conversation } from '@/types/models'
import type { SendMessageRequest, PaginationParams } from '@/types/api'

type RawConversation = {
  user_id: string
  display_name: string
  username: string
  last_message_at?: string
  unread_count?: number
  last_message?: Conversation['last_message']
}

export const messagesService = {
  getConversations: () =>
    api.get<RawConversation[]>('/conversations').then((r) =>
      r.data.map((raw): Conversation => ({
        user: { id: raw.user_id, display_name: raw.display_name, username: raw.username, created_at: raw.last_message_at ?? '' },
        last_message: raw.last_message,
        unread_count: raw.unread_count ?? 0,
      }))
    ),

  getMessages: (userId: string, params?: PaginationParams) =>
    api
      .get<Message[]>(`/conversations/${userId}/messages`, { params })
      .then((r) => ({ messages: r.data, next_cursor: undefined as string | undefined })),

  sendMessage: (data: SendMessageRequest) =>
    api.post<Message>('/messages', data).then((r) => r.data),
}
