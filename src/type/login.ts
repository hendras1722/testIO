export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  token: Token
  user: User
}

export interface Token {
  accessToken: string
  refreshToken: string
}

export interface User {
  email: string
  name: string
}
