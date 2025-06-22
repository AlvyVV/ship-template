'use client'

import { useAppContext } from '@/contexts/app'
import useGoogleOneTap from '@/hooks/use-google-one-tap'
import { useEffect } from 'react'

export default function GoogleOneTap() {
  const { user } = useAppContext()
  const { isLoggedIn } = useGoogleOneTap()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GoogleOneTapComponent] Initialized, user status:', user ? 'logged in' : 'not logged in')
    }
  }, [user, isLoggedIn])

  return null
}
