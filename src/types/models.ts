export interface User {
  id: string
  username: string
  display_name: string
  public_key?: string
  created_at: string
}

export interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  payload: {
    ciphertext: string
    iv: string
    encryptedKey: string
    encryptedKeyForSelf: string
  }
  delivered: boolean
  created_at: string
  // client-side only
  decrypted_content?: string
  decryption_failed?: boolean
}

export interface Conversation {
  user: User
  last_message?: Message
  last_message_at?: string
  unread_count: number
}
