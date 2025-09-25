'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Initialize authentication in background (non-blocking)
    initialize()
  }, [initialize])

  // Always render children immediately - no loading screen
  return <>{children}</>
}