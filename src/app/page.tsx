'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Bell, User, Plus, LogIn, Users, ChevronDown, Trophy } from 'lucide-react'
import { MapContainer } from '@/components/map/MapContainer'
import { AreaCardCompact } from '@/components/areas/AreaCard'
import { ClaimingFlow } from '@/components/areas/ClaimingFlow'
import { ReportAreaModal } from '@/components/areas/ReportAreaModal'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AddAreaFAB } from '@/components/ui/FloatingActionButton'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import { AuthModal } from '@/components/auth/AuthModal'
import { OnboardingModal } from '@/components/auth/OnboardingModal'
import { Notifications } from '@/components/layout/Notifications'
import { useAuth } from '@/hooks/use-auth'
import { useGroupStore } from '@/stores/group-store'
import { CleanupArea } from '@/types'
import type { LatLng, MapBounds } from '@/lib/maps/google-maps'

// Demo data for Mercato Cleanup Crew (default group)
const mercatoCleanupAreas: CleanupArea[] = [
  {
    id: '1',
    location: { lat: 2.747749, lng: 101.763832 },
    severity: 'high',
    status: 'available',
    description: 'Large accumulation of plastic bottles and food waste near park entrance',
    cleanup_instructions: 'Wear gloves, separate recyclables from general waste, dispose in designated bins',
    photos_before: ['/assets/demo/demo-trash-1.jpg'],
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
    photos_before: ['/assets/demo/demo-trash-2.jpg'],
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
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'demo-user-3',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    location: { lat: 2.748123, lng: 101.762945 },
    severity: 'high',
    status: 'available',
    description: 'Overflowing dumpster with mixed construction waste and household trash',
    cleanup_instructions: 'Contact local authorities, wear protective gear, sort materials carefully',
    photos_before: ['/assets/demo/demo-trash-1.jpg'],
    reported_by: 'demo-user-4',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    location: { lat: 2.746892, lng: 101.765123 },
    severity: 'medium',
    status: 'available',
    description: 'Abandoned shopping cart filled with various waste items',
    cleanup_instructions: 'Return cart to store, remove waste, dispose properly',
    photos_before: ['/assets/demo/demo-trash-2.jpg'],
    reported_by: 'demo-user-5',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    location: { lat: 2.748456, lng: 101.764789 },
    severity: 'low',
    status: 'available',
    description: 'Single tire and some scattered debris in parking lot',
    cleanup_instructions: 'Remove tire for proper disposal, pick up small items',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'demo-user-6',
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    location: { lat: 2.747234, lng: 101.762567 },
    severity: 'high',
    status: 'available',
    description: 'Illegal dumping site with electronics and hazardous materials',
    cleanup_instructions: 'Do not touch electronics, contact environmental authorities immediately',
    photos_before: ['/assets/demo/demo-trash-1.jpg'],
    reported_by: 'demo-user-7',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    location: { lat: 2.746567, lng: 101.763456 },
    severity: 'medium',
    status: 'available',
    description: 'Street gutter clogged with leaves and plastic bags',
    cleanup_instructions: 'Clear blockage, remove debris, ensure water flow',
    photos_before: ['/assets/demo/demo-trash-2.jpg'],
    reported_by: 'demo-user-8',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    location: { lat: 2.748789, lng: 101.765234 },
    severity: 'low',
    status: 'available',
    description: 'Empty bottles and cans scattered in grass area',
    cleanup_instructions: 'Collect recyclables, dispose in appropriate bins',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'demo-user-9',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10',
    location: { lat: 2.747890, lng: 101.764123 },
    severity: 'medium',
    status: 'available',
    description: 'Food court area with spilled food and scattered utensils',
    cleanup_instructions: 'Clean spills, collect utensils, wipe surfaces',
    photos_before: ['/assets/demo/demo-trash-2.jpg'],
    reported_by: 'demo-user-10',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Demo data for Campus EcoWarriors group
const campusCleanupAreas: CleanupArea[] = [
  {
    id: 'campus-1',
    location: { lat: 2.745588, lng: 101.768953 },
    severity: 'low',
    status: 'available',
    description: 'Student center courtyard with scattered food waste and drink containers',
    cleanup_instructions: 'Collect recyclables, clean spills, maintain campus appearance',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'campus-user-1',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'campus-2',
    location: { lat: 2.746123, lng: 101.769456 },
    severity: 'low',
    status: 'available',
    description: 'Library entrance area with fallen leaves and paper debris',
    cleanup_instructions: 'Sweep leaves, collect paper waste, keep entrance clean',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'campus-user-2',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'campus-3',
    location: { lat: 2.744892, lng: 101.768234 },
    severity: 'low',
    status: 'available',
    description: 'Parking lot with scattered litter and empty containers',
    cleanup_instructions: 'Collect recyclables, dispose in appropriate bins, maintain clean environment',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'campus-user-3',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'campus-4',
    location: { lat: 2.745934, lng: 101.769789 },
    severity: 'low',
    status: 'available',
    description: 'Cafeteria outdoor seating with food wrappers and spilled drinks',
    cleanup_instructions: 'Clean tables, collect recyclables, wipe surfaces',
    photos_before: ['/assets/demo/demo-trash-3.jpg'],
    reported_by: 'campus-user-4',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [cleanupAreas, setCleanupAreas] = useState<CleanupArea[]>([])
  const [selectedArea, setSelectedArea] = useState<CleanupArea | null>(null)
  const [showAreaModal, setShowAreaModal] = useState(false)
  const [showClaimingFlow, setShowClaimingFlow] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showGroupSelector, setShowGroupSelector] = useState(false)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)

  const { isAuthenticated, user, profile, signOut } = useAuth()
  const { currentGroup, userGroups, loadUserGroups, setCurrentGroup } = useGroupStore()

  // Check URL parameters for auth triggers
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'required') {
      setShowAuthModal(true)
    }
  }, [])

  // Show onboarding for new users (only once per session)
  useEffect(() => {
    if (isAuthenticated && user && !profile?.username) {
      // Check if onboarding was already shown this session
      const onboardingShown = sessionStorage.getItem('onboarding-shown')
      if (!onboardingShown) {
        setShowOnboarding(true)
        sessionStorage.setItem('onboarding-shown', 'true')
      }
    }
  }, [isAuthenticated, user, profile])

  // Load user's groups when authenticated
  useEffect(() => {
    if (isAuthenticated && userGroups.length === 0) {
      loadUserGroups()
    }
  }, [isAuthenticated, userGroups.length, loadUserGroups])

  // Load cleanup areas based on current group
  useEffect(() => {
    const loadCleanupAreas = async () => {
      // Always use fallback data for demo purposes
      console.log('Using mock cleanup areas for demo.')

      // Use different data based on current group
      const baseAreas = currentGroup?.id === 'campus-group-2' ? campusCleanupAreas : mercatoCleanupAreas

      let reportedAreas: CleanupArea[] = []
      try {
        // Load reported areas from localStorage (temporary storage for demo)
        reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')
      } catch (error) {
        console.warn('Failed to load from localStorage:', error)
        // Clear corrupted data
        try {
          localStorage.removeItem('reportedAreas')
        } catch (e) {
          // Ignore
        }
      }

      setCleanupAreas([...baseAreas, ...reportedAreas])
      setIsLoading(false)
    }

    loadCleanupAreas()
  }, [currentGroup])

  // Handle area selection from map
  const handleAreaClick = (area: CleanupArea) => {
    setSelectedArea(area)
    setShowAreaModal(true)
  }

  // Handle map click (for future area reporting)
  const handleMapClick = (latLng: LatLng) => {
    console.log('Map clicked at:', latLng)
    // Future: Open camera/reporting flow
  }

  // Handle map bounds change (for future area loading)
  const handleBoundsChange = (bounds: MapBounds) => {
    setMapBounds(bounds)
    // Future: Load areas within bounds from API
  }

  // Handle area claiming (direct claim from marker)
  const handleClaimArea = (area: CleanupArea) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    setSelectedArea(area)
    setShowAreaModal(false)
    setShowClaimingFlow(true)
  }

  // Handle claiming flow completion
  const handleClaimingComplete = () => {
    setShowClaimingFlow(false)
    setSelectedArea(null)
    // Remove claimed area from map (for demo - in real app this would be updated via API)
    if (selectedArea) {
      setCleanupAreas(prev => prev.filter(area => area.id !== selectedArea.id))

      try {
        // Also remove from localStorage if it was a reported area
        const reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')
        const filteredReported = reportedAreas.filter((area: CleanupArea) => area.id !== selectedArea.id)
        localStorage.setItem('reportedAreas', JSON.stringify(filteredReported))
      } catch (error) {
        console.warn('Failed to update localStorage:', error)
      }
    }
  }

  // Handle view area details
  const handleViewAreaDetails = (area: CleanupArea) => {
    window.location.href = `/area/${area.id}`
  }

  // Handle FAB click (report new area)
  const handleReportNewArea = () => {
    console.log('Report new area clicked')
    setShowReportModal(true)
  }

  // Handle area reported
  const handleAreaReported = (newArea: CleanupArea) => {
    try {
      // Create a version without large image data for localStorage
      const storageArea = {
        ...newArea,
        photos_before: ['/demo-report-photo.jpg'], // Use placeholder instead of base64
        photos_after: []
      }

      // Add to localStorage for demo persistence (with size limit)
      const reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')

      // Limit to 10 areas to prevent quota issues
      if (reportedAreas.length >= 10) {
        reportedAreas.shift() // Remove oldest
      }

      reportedAreas.push(storageArea)
      localStorage.setItem('reportedAreas', JSON.stringify(reportedAreas))

      // Add to current areas (keep original with full image data)
      setCleanupAreas(prev => [...prev, newArea])
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
      // Still add to current areas even if localStorage fails
      setCleanupAreas(prev => [...prev, newArea])
    }
  }

  // Handle area removal (Ctrl+click)
  const handleAreaRemove = (areaId: string) => {
    try {
      // Remove from localStorage
      const reportedAreas = JSON.parse(localStorage.getItem('reportedAreas') || '[]')
      const filteredReported = reportedAreas.filter((area: CleanupArea) => area.id !== areaId)
      localStorage.setItem('reportedAreas', JSON.stringify(filteredReported))
    } catch (error) {
      console.warn('Failed to update localStorage:', error)
    }

    // Remove from current areas
    setCleanupAreas(prev => prev.filter(area => area.id !== areaId))
  }

  // Handle authentication requirement for certain actions
  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    action()
  }

  // Handle user menu actions
  const handleUserClick = () => {
    if (isAuthenticated) {
      // Show user menu or navigate to profile
      console.log('Navigate to profile')
    } else {
      setShowAuthModal(true)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Loading EcoHunt AI..." />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">EcoHunt AI</h1>
              {currentGroup ? (
                <button
                  onClick={() => setShowGroupSelector(true)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Users className="w-3 h-3" />
                  <span>{currentGroup.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <p className="text-xs text-gray-500">Clean the world, one click at a time</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <Link
                href="/groups"
                className="touch-target flex items-center justify-center"
                title="Leaderboard & Groups"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors">
                  <Trophy className="w-4 h-4 text-primary-600" />
                </div>
              </Link>
            )}
            <Notifications /> {/* Replaced with Notifications component */}
            <Link
              href="/profile"
              className="touch-target flex items-center justify-center relative"
            >
              {isAuthenticated ? (
                <>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤'}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                </>
              ) : (
                <LogIn className="w-5 h-5 text-gray-600" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 relative overflow-hidden">
        <MapContainer
          cleanupAreas={cleanupAreas}
          onAreaClick={handleAreaClick}
          onAreaRemove={handleAreaRemove}
          onMapClick={handleMapClick}
          onBoundsChange={handleBoundsChange}
          className="w-full h-full"
        />

        {/* Group Info Overlay */}
        {isAuthenticated && userGroups.length > 1 && (
          <div className="absolute top-4 left-4 z-10">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {currentGroup?.name}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {cleanupAreas.length} areas
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Group Info (when only 1 group) */}
        {isAuthenticated && userGroups.length === 1 && currentGroup && (
          <div className="absolute top-4 left-4 z-10">
            <Card className="shadow-lg bg-primary-50 border-primary-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-800">{currentGroup.name}</span>
                  </div>
                  <Link href="/groups" className="touch-target">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors">
                      <Trophy className="w-4 h-4 text-primary-600" />
                    </div>
                  </Link>
                </div>
                <div className="text-xs text-primary-600 mt-1">
                  {cleanupAreas.length} areas
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Action Buttons */}
        <AddAreaFAB onClick={() => requireAuth(handleReportNewArea)} />
        {/* Removed LeaderboardFAB as it was overlapping with the map legend */}
      </main>

      {/* Area Details Modal */}
      <Modal
        isOpen={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        showCloseButton
      >
        {selectedArea && (
          <AreaCardCompact
            area={selectedArea}
            onClaim={() => handleClaimArea(selectedArea)}
            onViewDetails={() => handleViewAreaDetails(selectedArea)}
            showActions
          />
        )}
      </Modal>

      {/* Claiming Flow Modal */}
      <ClaimingFlow
        area={selectedArea}
        isOpen={showClaimingFlow}
        onClose={() => setShowClaimingFlow(false)}
        onComplete={handleClaimingComplete}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false)
          loadUserGroups() // Reload groups after onboarding
        }}
        username={user?.email?.split('@')[0] || 'EcoUser'}
      />

      {/* Report Area Modal */}
      <ReportAreaModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onAreaReported={handleAreaReported}
      />

      {/* Group Selector Modal */}
      <Modal
        isOpen={showGroupSelector}
        onClose={() => setShowGroupSelector(false)}
        title="Switch Group"
      >
        <div className="space-y-3">
          {userGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => {
                setCurrentGroup(group)
                setShowGroupSelector(false)
              }}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                currentGroup?.id === group.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.invite_code}</p>
                </div>
                {currentGroup?.id === group.id && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Bottom Navigation */}
      {/* <BottomNavigation /> */} {/* Removed as per instructions */}
    </div>
  )
}