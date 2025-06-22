'use client'

import { useAppContext } from '@/contexts/app'
import { api } from '@/lib/api-client'
import { parseUserInfoCookie } from '@/lib/cookie'
import googleOneTap from 'google-one-tap'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

// Google One Tap response type
interface GoogleOneTapResponse {
  credential: string
  select_by: string
  [key: string]: any
}

// API response type
interface ApiResponse {
  status: string
  data?: {
    access_token: string
    user: {
      id: string
      email: string
      nickname: string
    }
  }
  message?: string
}

export default function useGoogleOneTap() {
  const { user, setUser } = useAppContext()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cookieChecked, setCookieChecked] = useState(false)

  useEffect(() => {
    const userInfoFromCookie = parseUserInfoCookie()
    const authTokenFromCookie = Cookies.get('auth_token')

    if (userInfoFromCookie && authTokenFromCookie && !user) {
      console.log('[GoogleOneTap] Syncing user state from cookies to context')
      setUser(userInfoFromCookie)
      setIsLoggedIn(true)
    }

    setCookieChecked(true)
  }, [user, setUser])

  const oneTapLogin = async function () {
    const userInfoFromCookie = parseUserInfoCookie()
    const authTokenFromCookie = Cookies.get('auth_token')

    if (user || (userInfoFromCookie && authTokenFromCookie)) {
      console.log('[GoogleOneTap] User already logged in, skipping initialization')
      if (userInfoFromCookie && authTokenFromCookie && !user) {
        setUser(userInfoFromCookie)
        setIsLoggedIn(true)
      }
      return
    }

    const options = {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      auto_select: false,
      cancel_on_tap_outside: false,
      context: 'signin',
    }

    // Only attempt to initialize Google One Tap if client ID is provided
    if (!options.client_id) {
      console.error('[GoogleOneTap] Error: Google Client ID is not configured')
      return
    }

    try {
      googleOneTap(options, function (response: GoogleOneTapResponse) {
        console.log('[GoogleOneTap] Callback triggered with credential')

        if (response && response.credential) {
          handleLogin(response.credential)
        } else {
          console.error('[GoogleOneTap] Error: No credential received')
        }
      })
    } catch (error) {
      console.error('[GoogleOneTap] Error: Failed to initialize Google One Tap', error)
    }
  }

  const handleLogin = async function (credential: string) {
    try {
      const response = await api.post<ApiResponse>('/auth/google/one-tap', { credential })

      // Check if response has expected structure
      if (response.status === 'success' && response.data) {
        console.log('[GoogleOneTap] Authentication successful')

        // Extract user data and token
        const userData = response.data.user
        const accessToken = response.data.access_token

        if (userData) {
          // Store user info in cookies
          try {
            Cookies.set('user_info', JSON.stringify(userData), { path: '/' })
            console.log('[GoogleOneTap] User info saved to cookie')
          } catch (cookieError) {
            console.error('[GoogleOneTap] Error: Failed to set user cookie', cookieError)
          }

          // Store auth token if available
          if (accessToken) {
            try {
              Cookies.set('auth_token', accessToken, { path: '/' })
              console.log('[GoogleOneTap] Auth token saved to cookie')
            } catch (cookieError) {
              console.error('[GoogleOneTap] Error: Failed to set token cookie', cookieError)
            }
          }

          // Update user state
          setUser(userData)
          setIsLoggedIn(true)
          console.log('[GoogleOneTap] User state updated')
        } else {
          console.error('[GoogleOneTap] Error: No user data in response')
        }
      } else {
        console.error('[GoogleOneTap] Error: Invalid API response', response)
      }
    } catch (error) {
      console.error('[GoogleOneTap] Error: Authentication failed', error)
    }
  }

  useEffect(() => {
    if (!cookieChecked) {
      return
    }

    const userInfoFromCookie = parseUserInfoCookie()
    const authTokenFromCookie = Cookies.get('auth_token')

    // Only initialize if user is not logged in
    if (!user && !isLoggedIn && !(userInfoFromCookie && authTokenFromCookie)) {
      console.log('[GoogleOneTap] Conditions met, initializing One Tap')
      oneTapLogin()
    }
  }, [user, isLoggedIn, cookieChecked])

  return { isLoggedIn }
}
