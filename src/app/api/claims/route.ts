import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
    const { area_id, collaborators, photos_after, quality_score, points_earned } = body

    // Start a transaction to update area status and create claim
    const { data: claimData, error: claimError } = await supabase
      .from('cleanup_claims')
      .insert({
        area_id,
        claimed_by: user.id,
        collaborators: collaborators || [],
        status: 'completed',
        photos_after: photos_after || [],
        quality_score,
        points_earned,
        completed_at: new Date().toISOString(),
        verified_at: new Date().toISOString()
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error creating claim:', claimError)
      return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
    }

    // Update the cleanup area status
    const { error: updateError } = await supabase
      .from('cleanup_areas')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', area_id)

    if (updateError) {
      console.error('Error updating area status:', updateError)
      // Continue even if area update fails
    }

    // Update user points
    const { error: pointsError } = await supabase.rpc('increment_user_points', {
      user_id: user.id,
      points_to_add: points_earned
    })

    if (pointsError) {
      console.error('Error updating user points:', pointsError)
      // Continue even if points update fails
    }

    // Update collaborator points (if any)
    if (collaborators && collaborators.length > 0) {
      const pointsPerCollaborator = Math.floor(points_earned / (collaborators.length + 1))
      for (const collaboratorId of collaborators) {
        const { error: collabPointsError } = await supabase.rpc('increment_user_points', {
          user_id: collaboratorId,
          points_to_add: pointsPerCollaborator
        })
        
        if (collabPointsError) {
          console.error('Error updating collaborator points:', collabPointsError)
        }
      }
    }

    return NextResponse.json({ data: claimData })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}