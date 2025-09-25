import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Get cleanup areas for specific group
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

    // Get areas for this group using the database function
    const { data, error } = await supabase.rpc('get_group_areas', { group_id: params.id })

    if (error) {
      console.error('Error fetching group areas:', error)
      return NextResponse.json({ error: 'Failed to fetch group areas' }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} areas for group ${params.id}`)
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}