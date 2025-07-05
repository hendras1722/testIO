'use client'

// import { Suspense } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

export default function RouteLeaveHandler({ guardCallback }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const nextPathRef = useRef<string | null>(null)

  const getCurrentLocation = useCallback(
    () => ({
      path: pathname,
      searchParams: Object.fromEntries(searchParams?.entries() || []),
    }),
    [pathname, searchParams]
  )

  const handleBeforeUnload = useCallback(
    (event) => {
      const shouldBlock = guardCallback(
        { path: window.location.pathname },
        getCurrentLocation(),
        (allow) => {
          if (!allow) {
            event.preventDefault()
            event.returnValue = ''
          }
          return allow
        }
      )

      if (shouldBlock === false) {
        event.preventDefault()
        event.returnValue = ''
      }
    },
    [guardCallback, getCurrentLocation]
  )

  useEffect(() => {
    const interceptNavigation = async (e) => {
      const link = e.target.closest('a[href]')
      if (!link) return

      const href = link.getAttribute('href')
      if (
        link.target === '_blank' ||
        new URL(href, window.location.origin).origin !== window.location.origin
      ) {
        return
      }

      e.preventDefault()

      const url = new URL(href, window.location.origin)
      const to = {
        path: url.pathname,
        searchParams: Object.fromEntries(url.searchParams.entries()),
      }

      const from = getCurrentLocation()

      try {
        await new Promise((resolve, reject) => {
          const next = (redirectOrBoolean) => {
            if (redirectOrBoolean === false) {
              reject(new Error('Navigation cancelled'))
            } else if (typeof redirectOrBoolean === 'string') {
              nextPathRef.current = redirectOrBoolean
              router.push(redirectOrBoolean)
              resolve(false)
            } else if (
              typeof redirectOrBoolean === 'object' &&
              redirectOrBoolean !== null
            ) {
              const queryString = new URLSearchParams(
                redirectOrBoolean.query || {}
              ).toString()
              const url = `${redirectOrBoolean.path || '/'}${
                queryString ? `?${queryString}` : ''
              }${redirectOrBoolean.hash || ''}`

              nextPathRef.current = url
              redirectOrBoolean.replace ? router.replace(url) : router.push(url)
              resolve(false)
            } else {
              nextPathRef.current = href
              router.push(href)
              resolve(true)
            }
          }

          guardCallback(to, from, next)
        })
      } catch (error) {
        console.debug('Navigation cancelled:', error)
      }
    }

    document.addEventListener('click', interceptNavigation)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', interceptNavigation)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [router, guardCallback, getCurrentLocation])

  return null
}
