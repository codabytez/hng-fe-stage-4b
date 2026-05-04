import { api } from '@/lib/axios'
import type { Message, Conversation } from '@/types/models'
import type { SendMessageRequest, PaginationParams } from '@/types/api'

export const messagesService = {
  getConversations: () =>
    api.get<Conversation[]>('/conversations').then((r) => r.data),

  getMessages: (userId: string, params?: PaginationParams) =>
    api
      .get<{ messages: Message[]; next_cursor?: string }>(
        `/conversations/${userId}/messages`,
        { params }
      )
      .then((r) => r.data),

  sendMessage: (data: SendMessageRequest) =>
    api.post<Message>('/messages', data).then((r) => r.data),
}
