'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// Custom hook for authentication
export function useAuth() {
  const store = useAuthStore()

  // Initialize auth on mount
  useEffect(() => {
    store.initialize()
  }, [])

  return {
    user: store.user,
    profile: store.profile,
    isLoading: false, // Always return false to prevent hanging
    isAuthenticated: store.isAuthenticated,
    error: store.error,
    signIn: store.signIn,
    signUp: store.signUp,
    signInWithGoogle: store.signInWithGoogle,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
    clearError: store.clearError
  }
}

// Hook for requiring authentication
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()

  return {
    isAuthenticated,
    isLoading: false,
    isReady: isAuthenticated
  }
}

// Hook for authentication status
export function useAuthStatus() {
  const { isAuthenticated, user, profile } = useAuth()

  return {
    isAuthenticated,
    isLoading: false,
    isGuest: !isAuthenticated,
    user,
    profile
  }
}