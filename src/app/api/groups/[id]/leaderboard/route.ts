import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get group leaderboard
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
      return NextResponse.json({ error: 'Access denied - not a group member' }, { status: 403 })
    }

    // Simple direct query without functions
    const { data: members, error } = await supabase
      .from('group_members')
      .select(`
        profiles:user_id (
          id,
          username,
          avatar_url,
          total_points
        )
      `)
      .eq('group_id', params.id)

    if (error) {
      console.error('Error fetching group members:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Transform and rank the data
    const leaderboard = (members || [])
      .map((member: any) => member.profiles)
      .filter(Boolean)
      .sort((a: any, b: any) => b.total_points - a.total_points)
      .map((profile: any, index: number) => ({
        user_id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        total_points: profile.total_points,
        rank: index + 1
      }))

    console.log(`Fetched leaderboard for group ${params.id}:`, leaderboard.length, 'members')
    return NextResponse.json({ data: leaderboard })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}