import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get user's groups
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists
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

    // Simple direct query without complex joins
    const { data: memberships, error } = await supabase
      .from('group_members')
      .select('group_id, role, joined_at')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user memberships:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    // Get group details for each membership
    const groups = []
    for (const membership of memberships || []) {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', membership.group_id)
        .single()

      if (!groupError && group) {
        // Get member count
        const { count } = await supabase
          .from('group_members')
          .select('id', { count: 'exact' })
          .eq('group_id', group.id)

        groups.push({
          ...group,
          member_count: count || 0,
          user_role: membership.role
        })
      }
    }

    console.log('Fetched user groups:', groups.length)
    return NextResponse.json({ data: groups })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new group
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
    }

    const body = await request.json()
    const { name, description } = body

    // Generate unique invite code
    const inviteCode = `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        invite_code: inviteCode,
        created_by: user.id
      })
      .select()
      .single()

    if (groupError) {
      console.error('Error creating group:', groupError)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin'
      })

    if (memberError) {
      console.error('Error adding group admin:', memberError)
      return NextResponse.json({ error: 'Failed to add admin to group' }, { status: 500 })
    }

    console.log('Group created successfully:', group.name, 'by', user.email)
    return NextResponse.json({ data: group })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}