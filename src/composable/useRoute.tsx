'use client'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useRoute() {
  const pathname = usePathname()
  const params = useParams()

  const [route, setRoute] = useState({ pathname, params })

  useEffect(() => {
    setRoute({ pathname, params })
  }, [pathname, params])

  return route
}
