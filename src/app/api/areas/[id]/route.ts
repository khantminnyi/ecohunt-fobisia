import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Return hardcoded area data for testing since database functions aren't working
    const fallbackAreas = {
      '1': {
        id: '1',
        location: { lat: 2.747749, lng: 101.763832 },
        severity: 'high',
        status: 'available',
        description: 'Large accumulation of plastic bottles and food waste near park entrance',
        cleanup_instructions: 'Wear gloves for safety. Separate recyclables from general waste. Use provided bins for proper disposal. Watch for sharp objects hidden in debris.',
        photos_before: ['/demo-trash-1.jpg'],
        reported_by: 'demo-user-1',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      '2': {
        id: '2',
        location: { lat: 2.747656, lng: 101.764506 },
        severity: 'medium',
        status: 'available',
        description: 'Scattered cigarette butts and paper litter around bus stop',
        cleanup_instructions: 'Use litter picker to collect cigarette butts. Focus on areas under benches and in bushes. Separate paper waste for recycling.',
        photos_before: ['/demo-trash-2.jpg'],
        reported_by: 'demo-user-2',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      '3': {
        id: '3',
        location: { lat: 2.747317, lng: 101.763534 },
        severity: 'low',
        status: 'available',
        description: 'Few pieces of paper and empty cans on sidewalk',
        cleanup_instructions: 'Quick pickup task. Separate aluminum cans for recycling. Dispose of paper waste in general bin.',
        photos_before: ['/demo-trash-3.jpg'],
        reported_by: 'demo-user-3',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    const area = fallbackAreas[params.id as keyof typeof fallbackAreas]

    if (!area) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 })
    }

    console.log('Returning fallback area details for ID:', params.id)

    return NextResponse.json({ data: area })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, severity, description, cleanup_instructions } = body

    const { data, error } = await supabase
      .from('cleanup_areas')
      .update({
        status,
        severity,
        description,
        cleanup_instructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cleanup area:', error)
      return NextResponse.json({ error: 'Failed to update cleanup area' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}