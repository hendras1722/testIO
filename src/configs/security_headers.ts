import { SecurityConfig } from '@/type/config_security'

export class SecurityHeaders {
  private readonly headers: Headers

  constructor(headers: Headers) {
    this.headers = headers
  }

  setHstsHeader(config: SecurityConfig['hsts']) {
    if (!config?.enabled) return

    const hstsValue = `max-age=${config.maxAge}${
      config.includeSubDomains ? '; includeSubDomains' : ''
    }${config.preload ? '; preload' : ''}`

    this.headers.set('Strict-Transport-Security', hstsValue)
  }

  setXssProtection() {
    this.headers.set('X-XSS-Protection', '1; mode=block')
  }

  setContentTypeOptions() {
    this.headers.set('X-Content-Type-Options', 'nosniff')
  }

  setFrameguard(config: SecurityConfig['frameguard']) {
    if (!config) return

    const { action, domain } = config
    let value = action as string
    if (action === 'ALLOW-FROM' && domain) {
      value = `ALLOW-FROM ${domain}`
    }
    this.headers.set('X-Frame-Options', value)
  }

  setContentSecurityPolicy(config: SecurityConfig['contentSecurityPolicy']) {
    if (!config?.enabled || !config.directives) return

    const cspValue = Object.entries(config.directives)
      .map(([key, values]) => `${key} ${(values as unknown[]).join(' ')}`)
      .join('; ')

    this.headers.set('Content-Security-Policy', cspValue)
  }

  setCorsHeaders(config: SecurityConfig['corsConfig']) {
    if (!config?.enabled) return

    const { origin, methods, credentials, maxAge } = config

    if (origin) {
      this.headers.set('Access-Control-Allow-Origin', origin.join(', '))
    }

    if (methods) {
      this.headers.set('Access-Control-Allow-Methods', methods.join(', '))
    }

    if (credentials) {
      this.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    if (maxAge) {
      this.headers.set('Access-Control-Max-Age', maxAge.toString())
    }

    this.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
  }

  removePoweredByHeader() {
    this.headers.delete('x-powered-by')
  }
}
