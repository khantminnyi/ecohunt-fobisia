'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Clock, Camera, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SeverityBadge, PointsBadge } from '@/components/ui/Badge'
import { ClaimingFlow } from '@/components/areas/ClaimingFlow'
import { useAuth } from '@/hooks/use-auth'
import { CleanupArea } from '@/types'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'

interface MediumAreaDetailsPageProps {
  params: {
    id: string
  }
}

// Fallback demo data for medium priority areas
const fallbackMediumArea: CleanupArea = {
  id: '2',
  location: { lat: 2.747656, lng: 101.764506 },
  severity: 'medium',
  status: 'available',
  description: 'Scattered cigarette butts and paper litter around bus stop',
  cleanup_instructions: 'Use litter picker, focus on cigarette butts in bushes. This is a medium difficulty cleanup that should take 15-20 minutes.',
  photos_before: ['/assets/demo/demo-trash-2.jpg'],
  reported_by: 'demo-user-2',
  created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString()
}

const getMediumAIAnalysis = () => ({
  wasteTypes: ['plastic bottles', 'food containers', 'paper waste', 'cigarette butts'],
  estimatedTime: '15-20 minutes',
  difficulty: 'Medium',
  safetyNotes: [
    'Wear protective gloves',
    'Watch for sharp objects in debris',
    'Use litter picker for cigarette butts',
    'Wash hands thoroughly after cleanup'
  ],
  instructions: [
    'Put on protective gloves before starting',
    'Separate recyclable items (bottles, cans) from general waste',
    'Use litter picker for small items and cigarette butts',
    'Place recyclables in blue bins, general waste in black bins',
    'Take after photo for verification'
  ],
  environmentalImpact: {
    estimatedWaste: '2.5 kg',
    co2Impact: '1.3 kg CO₂ prevented from entering atmosphere',
    recyclingPotential: '60% of waste can be recycled'
  }
})

export default function MediumAreaDetailsPage({ params }: MediumAreaDetailsPageProps) {
  const [area, setArea] = useState<CleanupArea | null>(null)
  const [showClaimingFlow, setShowClaimingFlow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Always use fallback data for demo purposes
    console.log('Using mock medium area details for demo.')

    // Check for static demo areas first
    if (params.id === '1' || params.id === '2' || params.id === '3') {
      setArea({ ...fallbackMediumArea, id: params.id })
      setIsLoading(false)
      return
    }

    // Check for reported areas in localStorage
    try {
      const reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')
      const foundArea = reportedAreas.find((area: CleanupArea) => area.id === params.id)

      if (foundArea) {
        setArea(foundArea)
      } else {
        setArea(null)
      }
    } catch (error) {
      console.warn('Failed to load reported areas:', error)
      setArea(null)
    }

    setIsLoading(false)
  }, [params.id])

  const getPointsForSeverity = (severity: string) => {
    switch (severity) {
      case 'high': return 150
      case 'medium': return 100
      case 'low': return 50
      default: return 100
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just reported'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleClaimArea = () => {
    if (!isAuthenticated) {
      // Redirect to home with auth modal
      window.location.href = '/?auth=required'
      return
    }
    setShowClaimingFlow(true)
  }

  const handleClaimingComplete = () => {
    setShowClaimingFlow(false)
    // Update area status (in real app: API call)
    if (area) {
      const updatedArea = { ...area, status: 'completed' as const }
      setArea(updatedArea)

      // If this was a reported area, update it in localStorage
      try {
        const reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')
        const updatedReported = reportedAreas.map((a: CleanupArea) =>
          a.id === area.id ? updatedArea : a
        )
        localStorage.setItem('reportedAreas', JSON.stringify(updatedReported))
      } catch (error) {
        console.warn('Failed to update localStorage:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Loading medium cleanup area..." />
  }

  if (!area) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="touch-target flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Medium Area Not Found</h1>
            <div className="w-5" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full text-center">
            <CardContent className="py-8">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Area Not Found</h2>
              <p className="text-gray-600 mb-6">The medium cleanup area you're looking for doesn't exist.</p>
              <Link href="/">
                <Button variant="primary">Back to Map</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isAvailable = area.status === 'available'
  const isClaimed = area.status === 'claimed'
  const isCompleted = area.status === 'completed'

  const analysis = getMediumAIAnalysis()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Medium Cleanup</h1>
          <div className="w-5" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Area Header */}
          <Card>
            <CardContent className="space-y-4">
              {/* Badges */}
              <div className="flex justify-between items-start">
                <SeverityBadge severity="medium" />
                {isAvailable && <PointsBadge points={getPointsForSeverity(area.severity)} />}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900">{area.description}</h2>

              {/* Meta info */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(area.created_at)}</span>
                </div>
                {area.location && area.location.lat && area.location.lng && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{area.location.lat.toFixed(6)}, {area.location.lng.toFixed(6)}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isAvailable ? 'bg-yellow-100 text-yellow-800' :
                isClaimed ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {area.status === 'available' && '🟡 Available for cleanup'}
                {area.status === 'claimed' && '🔵 Cleanup in progress'}
                {area.status === 'completed' && '✅ Completed'}
              </div>
            </CardContent>
          </Card>

          {/* Before Photos */}
          {area.photos_before.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">📸 Reported Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {area.photos_before.map((photo, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg overflow-hidden">
                      <img src={photo} alt={`Area photo ${index + 1}`} className="w-full h-48 object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🤖 AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Estimated Time</p>
                  <p className="font-semibold">{analysis.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-gray-600">Difficulty</p>
                  <p className="font-semibold text-yellow-600">{analysis.difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-600">Waste Types</p>
                  <p className="font-semibold">{analysis.wasteTypes.length} types</p>
                </div>
                <div>
                  <p className="text-gray-600">Potential Impact</p>
                  <p className="font-semibold">{analysis.environmentalImpact.estimatedWaste}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Detected Waste Types:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.wasteTypes.map((type: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 rounded-lg text-xs font-medium text-yellow-700">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cleanup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Cleanup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {analysis.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{instruction}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Safety Reminders</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      {analysis.safetyNotes.map((note: string, index: number) => (
                        <li key={index}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🌍 Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated waste removal:</span>
                  <span className="font-semibold">{analysis.environmentalImpact.estimatedWaste}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ impact prevention:</span>
                  <span className="font-semibold text-yellow-600">{analysis.environmentalImpact.co2Impact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recycling potential:</span>
                  <span className="font-semibold text-yellow-600">{analysis.environmentalImpact.recyclingPotential}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="pt-4">
            {isAvailable && (
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleClaimArea}
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Medium Cleanup
              </Button>
            )}

            {isClaimed && (
              <Button variant="secondary" className="w-full" size="lg" disabled>
                <Users className="w-5 h-5 mr-2" />
                Cleanup In Progress
              </Button>
            )}

            {isCompleted && (
              <Button variant="ghost" className="w-full" size="lg" disabled>
                ✅ Cleanup Completed
              </Button>
            )}
          </div>

          {/* Back to map */}
          <div className="pb-safe-area-inset-bottom">
            <Link href="/">
              <Button variant="secondary" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Back to Map
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Claiming Flow Modal */}
      <ClaimingFlow
        area={area}
        isOpen={showClaimingFlow}
        onClose={() => setShowClaimingFlow(false)}
        onComplete={handleClaimingComplete}
      />
    </div>
  )
}