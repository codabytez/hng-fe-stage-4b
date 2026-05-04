export interface RegisterRequest {
  username: string
  display_name: string
  password: string
  public_key: string
  wrapped_private_key: string
  pbkdf2_salt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    display_name: string
    public_key: string
    wrapped_private_key: string
    pbkdf2_salt: string
    created_at: string
  }
}

export interface RefreshResponse {
  access_token: string
}

export interface SendMessageRequest {
  to: string
  payload: {
    ciphertext: string
    iv: string
    encryptedKey: string
    encryptedKeyForSelf: string
  }
}

export interface MessagesResponse {
  messages: import('./models').Message[]
  next_cursor?: string
}

export interface PaginationParams {
  before?: string
  limit?: number
}

export interface ApiError {
  message: string
  status: number
}
