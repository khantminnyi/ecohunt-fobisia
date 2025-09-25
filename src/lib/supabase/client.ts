import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client for client-side operations (only if configured)
// Using generic client without Database types to avoid import issues
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })
  : null

// Mock user for demo purposes
const mockUser: User = {
  id: 'mock-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@ecohunt.ai',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    username: 'DemoUser',
    full_name: 'Demo User',
    avatar_url: null
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Auth-specific helpers with fallback for when Supabase isn't configured
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    if (!supabase) {
      console.log('Mock signUp for demo')
      return { user: mockUser, session: null }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      console.log('Mock signIn for demo')
      return { user: mockUser, session: null }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    if (!supabase) {
      console.log('Mock signInWithGoogle for demo')
      return { user: mockUser, session: null }
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    if (!supabase) {
      console.log('Mock signOut for demo')
      return
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  getSession: async () => {
    if (!supabase) {
      console.log('Mock getSession for demo')
      return { session: null }
    }
    
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data
  },

  // Get current user
  getUser: async () => {
    if (!supabase) {
      console.log('Mock getUser for demo')
      return { user: mockUser }
    }
    
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data
  },

  // Reset password
  resetPassword: async (email: string) => {
    if (!supabase) {
      console.log('Mock resetPassword for demo')
      return { data: null }
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
    return data
  },

  // Update password
  updatePassword: async (password: string) => {
    if (!supabase) {
      console.log('Mock updatePassword for demo')
      return { data: null }
    }
    
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    
    if (error) throw error
    return data
  }
}