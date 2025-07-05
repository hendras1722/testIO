import { SecurityConfig } from '@/type/config_security'

export const defaultConfig: SecurityConfig = {
  allowedHosts: [],
  ssl: process.env.NODE_ENV === 'production',
  xssProtection: true,
  contentTypeOptions: true,
  hideHeaderPoweredBy: true,
  hsts: {
    enabled: process.env.NODE_ENV === 'production',
    maxAge: 15552000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'DENY',
  },
  contentSecurityPolicy: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'frame-src': ["'self'"],
      'base-uri': ["'self'"],
    },
  },
  corsConfig: {
    enabled: true,
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  },
}
