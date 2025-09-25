import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase, auth, isSupabaseConfigured } from '@/lib/supabase/client'

interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  total_points: number
  created_at: string
  updated_at: string
}

interface AuthState {
  // State
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isLoading: false, // Start with false to prevent loading screens
      isAuthenticated: false,
      error: null,

      // Initialize auth state properly but skip database calls
      initialize: async () => {
        console.log('Starting auth initialization...')
        
        try {
          // If Supabase is not configured, work in demo mode
          if (!isSupabaseConfigured || !supabase) {
            console.log('Supabase not configured - demo mode')
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false
            })
            return
          }

          // Check current session quickly
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('Found existing session for user:', session.user.email)
            set({
              user: session.user,
              profile: null, // Skip profile fetch to avoid hanging
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            console.log('No existing session')
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false
            })
          }

          // Set up auth listener for future changes
          supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event)
            if (session?.user) {
              set({
                user: session.user,
                profile: null, // Skip profile for now
                isAuthenticated: true,
                isLoading: false
              })
            } else {
              set({
                user: null,
                profile: null,
                isAuthenticated: false,
                isLoading: false
              })
            }
          })
        } catch (error) {
          console.error('Auth init error:', error)
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      // Sign up (mock for demo)
      signUp: async (email: string, password: string, username: string) => {
        console.log('Mock signUp for demo:', { email, username })
        const mockProfile = {
          id: 'mock-user-id',
          username,
          avatar_url: null,
          total_points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        set({
          user: { ...get().user!, id: 'mock-user-id', email, user_metadata: { username } },
          profile: mockProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },

      // Sign in (mock for demo)
      signIn: async (email: string, password: string) => {
        console.log('Mock signIn for demo:', { email })
        const mockProfile = {
          id: 'mock-user-id',
          username: 'DemoUser',
          avatar_url: null,
          total_points: 2500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        set({
          user: { ...get().user!, id: 'mock-user-id', email, user_metadata: { username: 'DemoUser' } },
          profile: mockProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },

      // Sign in with Google (mock for demo)
      signInWithGoogle: async () => {
        console.log('Mock signInWithGoogle for demo')
        const mockProfile = {
          id: 'mock-user-id',
          username: 'GoogleDemoUser',
          avatar_url: 'https://lh3.googleusercontent.com/a/AATXAJy4_...mock',
          total_points: 2000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        set({
          user: { ...get().user!, id: 'mock-user-id', email: 'google@demo.com', user_metadata: { username: 'GoogleDemoUser' } },
          profile: mockProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },

      // Sign out (mock for demo)
      signOut: async () => {
        console.log('Mock signOut for demo')
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },

      // Update profile (mock for demo)
      updateProfile: async (updates: Partial<Profile>) => {
        console.log('Mock updateProfile for demo:', updates)
        set(state => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
          isLoading: false,
          error: null
        }))
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'ecohunt-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)