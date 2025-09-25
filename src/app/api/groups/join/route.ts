import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Join group by invite code
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists first
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Create profile if it doesn't exist
      const newProfile = {
        id: user.id,
        username: user.user_metadata?.username ||
                 user.user_metadata?.full_name ||
                 user.email?.split('@')[0] ||
                 'EcoUser',
        avatar_url: user.user_metadata?.avatar_url || null,
        total_points: 0
      }

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert(newProfile)

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
      
      console.log('Created profile for user:', user.email)
    }

    const body = await request.json()
    const { invite_code } = body

    if (!invite_code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', invite_code.toUpperCase())
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this group' }, { status: 400 })
    }

    // Add user to group
    const { data: membership, error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member'
      })
      .select()
      .single()

    if (joinError) {
      console.error('Error joining group:', joinError)
      return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: { 
        group, 
        membership,
        message: `Successfully joined ${group.name}!`
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}