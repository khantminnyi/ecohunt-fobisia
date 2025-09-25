import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnTo = requestUrl.searchParams.get('returnTo') || '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/?auth=error', requestUrl.origin))
      }

      if (data.user) {
        // Always try to create/update profile
        const newProfile = {
          id: data.user.id,
          username: data.user.user_metadata?.full_name ||
                   data.user.user_metadata?.username ||
                   data.user.email?.split('@')[0] ||
                   'EcoUser',
          avatar_url: data.user.user_metadata?.avatar_url || null,
          total_points: 0
        }

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })

        if (upsertError) {
          console.error('Error creating/updating profile:', upsertError)
        } else {
          console.log('Profile created/updated successfully for user:', data.user.email)
        }
      }

      // Successful authentication - redirect to return URL or home
      return NextResponse.redirect(new URL(returnTo, requestUrl.origin))
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(new URL('/?auth=error', requestUrl.origin))
    }
  }

  // No code provided - redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}