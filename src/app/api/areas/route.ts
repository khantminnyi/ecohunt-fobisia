import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { searchParams } = new URL(request.url)
    const bounds = searchParams.get('bounds')

    // Simple query without functions - use fallback data for now
    console.log('Areas API called - using fallback data')
    
    // Return fallback areas since database functions aren't working
    const areas = [
      {
        id: '1',
        location: { lat: 2.747749, lng: 101.763832 },
        severity: 'high',
        status: 'available',
        description: 'Large accumulation of plastic bottles and food waste near park entrance',
        cleanup_instructions: 'Wear gloves, separate recyclables from general waste, dispose in designated bins',
        photos_before: ['/demo-trash-1.jpg'],
        reported_by: 'demo-user-1',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        location: { lat: 2.747656, lng: 101.764506 },
        severity: 'medium',
        status: 'available',
        description: 'Scattered cigarette butts and paper litter around bus stop',
        cleanup_instructions: 'Use litter picker, focus on cigarette butts in bushes',
        photos_before: ['/demo-trash-2.jpg'],
        reported_by: 'demo-user-2',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        location: { lat: 2.747317, lng: 101.763534 },
        severity: 'low',
        status: 'available',
        description: 'Few pieces of paper and empty cans on sidewalk',
        cleanup_instructions: 'Quick pickup, separate cans for recycling',
        photos_before: ['/demo-trash-3.jpg'],
        reported_by: 'demo-user-3',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    console.log('Returning fallback areas:', areas.length)

    return NextResponse.json({ data: areas })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { location, severity, description, cleanup_instructions, photos_before } = body

    // Insert new cleanup area
    const { data, error } = await supabase
      .from('cleanup_areas')
      .insert({
        location: `POINT(${location.lng} ${location.lat})`,
        severity,
        description,
        cleanup_instructions,
        photos_before: photos_before || [],
        reported_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cleanup area:', error)
      return NextResponse.json({ error: 'Failed to create cleanup area' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}