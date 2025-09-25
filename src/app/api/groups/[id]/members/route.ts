import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get group members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of this group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get group members with profiles
    const { data: members, error } = await supabase
      .from('group_members')
      .select(`
        id,
        role,
        joined_at,
        profiles:user_id (
          id,
          username,
          avatar_url,
          total_points
        )
      `)
      .eq('group_id', params.id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching group members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({ data: members || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Remove member (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id: memberToRemove } = body

    // Check if current user is admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminCheck || adminCheck.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Cannot remove self if you're the only admin
    if (memberToRemove === user.id) {
      const { data: adminCount, error: countError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', params.id)
        .eq('role', 'admin')

      if (!countError && adminCount && adminCount.length <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    // Remove member
    const { error: removeError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', params.id)
      .eq('user_id', memberToRemove)

    if (removeError) {
      console.error('Error removing member:', removeError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: { message: 'Member removed successfully' }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}