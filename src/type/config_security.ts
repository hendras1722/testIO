export interface SecurityConfig {
  allowedHosts?: string[]
  ssl?: boolean
  xssProtection?: boolean
  contentTypeOptions?: boolean
  hideHeaderPoweredBy?: boolean
  hsts?: {
    enabled: boolean
    maxAge?: number
    includeSubDomains?: boolean
    preload?: boolean
  }
  frameguard?: {
    action?: string
    domain?: string
  }
  contentSecurityPolicy?: {
    enabled: boolean
    directives?: Record<string, string[]>
  }
  corsConfig?: {
    enabled: boolean
    origin?: string[]
    methods?: string[]
    credentials?: boolean
    maxAge?: number
  }
}
