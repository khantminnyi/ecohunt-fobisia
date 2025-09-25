'use client'

import { useState } from 'react'
import { ArrowLeft, User, Trophy, Calendar, Zap, Share2, Settings, Award, Star, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, PointsBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/hooks/use-auth'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'

// Demo user data
const demoUser = {
  id: '1',
  username: 'EcoExplorer',
  email: 'eco.explorer@example.com',
  avatar: '🌟',
  totalPoints: 1450,
  level: 5,
  streak: 7,
  joinedAt: '2024-01-15',
  completedCleanups: 23,
  reportedAreas: 8
}

const demoAchievements = [
  { id: '1', name: 'First Cleanup', description: 'Complete your first cleanup', icon: '🌟', earned: true },
  { id: '2', name: 'Recycling Expert', description: 'Properly sort 50 recyclable items', icon: '♻️', earned: true },
  { id: '3', name: 'Team Player', description: 'Complete 10 collaborative cleanups', icon: '👥', earned: true },
  { id: '4', name: 'Area Reporter', description: 'Report 5 new cleanup areas', icon: '📸', earned: true },
  { id: '5', name: 'Streak Master', description: 'Maintain a 7-day activity streak', icon: '🔥', earned: true },
  { id: '6', name: 'Eco Warrior', description: 'Earn 2000 points', icon: '⚔️', earned: false },
  { id: '7', name: 'Community Leader', description: 'Help 20 other users', icon: '👑', earned: false },
  { id: '8', name: 'Green Guardian', description: 'Complete 100 cleanups', icon: '🛡️', earned: false }
]

const demoStats = {
  thisWeek: {
    points: 340,
    cleanups: 4,
    co2Saved: 12.5
  },
  allTime: {
    wasteRemoved: 145.7, // kg
    areasRestored: 23,
    co2Offset: 89.3, // kg
    treesWorth: 4.2
  }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  
  const { isAuthenticated, user, profile, signOut } = useAuth()
  
  const earnedAchievements = demoAchievements.filter(a => a.earned)
  const lockedAchievements = demoAchievements.filter(a => !a.earned)

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowSignOutConfirm(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="touch-target flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Profile</h1>
            <div className="w-5" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full text-center">
            <CardContent className="pt-6">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Create an account or sign in to track your environmental impact and compete with friends.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </div>
    )
  }

  // Use real user data if available, fallback to demo data
  const displayUser = {
    username: profile?.username || user?.email?.split('@')[0] || 'EcoUser',
    email: user?.email || 'user@example.com',
    avatar: profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '🌟',
    totalPoints: profile?.total_points || 1450,
    level: Math.floor((profile?.total_points || 1450) / 300) + 1, // Level based on points
    streak: 7, // Demo streak for now
    joinedAt: user?.created_at || '2024-01-15',
    completedCleanups: Math.floor((profile?.total_points || 1450) / 60), // Estimate from points
    reportedAreas: Math.floor((profile?.total_points || 1450) / 180) // Estimate from points
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <button
            className="touch-target flex items-center justify-center"
            onClick={() => setShowSignOutConfirm(true)}
          >
            <LogOut className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-6">
          <div className="max-w-md mx-auto text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{displayUser.avatar}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{displayUser.username}</h2>
            <p className="text-primary-100 text-sm mb-3">{displayUser.email}</p>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{displayUser.totalPoints.toLocaleString()}</p>
                <p className="text-primary-100 text-xs">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">#{displayUser.level}</p>
                <p className="text-primary-100 text-xs">Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{displayUser.streak}</p>
                <p className="text-primary-100 text-xs">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">+{demoStats.thisWeek.points}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{demoStats.thisWeek.cleanups}</p>
                  <p className="text-xs text-gray-500">Cleanups</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{demoStats.thisWeek.co2Saved}kg</p>
                  <p className="text-xs text-gray-500">CO₂ Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'stats'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Impact Stats
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Achievements
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Environmental Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🌍 Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Waste Removed</span>
                    <span className="font-semibold">{demoStats.allTime.wasteRemoved} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Areas Restored</span>
                    <span className="font-semibold">{demoStats.allTime.areasRestored}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CO₂ Offset</span>
                    <span className="font-semibold">{demoStats.allTime.co2Offset} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trees Worth Impact</span>
                    <span className="font-semibold">{demoStats.allTime.treesWorth} 🌳</span>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📈 Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cleanups Completed</span>
                    <Badge variant="success">{displayUser.completedCleanups}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Areas Reported</span>
                    <Badge variant="primary">{displayUser.reportedAreas}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium">{formatJoinDate(displayUser.joinedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Streak</span>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-orange-600">{displayUser.streak} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {/* Earned Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Earned ({earnedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {earnedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 text-center"
                      >
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h4 className="font-semibold text-sm text-yellow-800 mb-1">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-yellow-600">
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Locked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                    Locked ({lockedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {lockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center opacity-75"
                      >
                        <div className="text-2xl mb-2 grayscale">{achievement.icon}</div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4">
            <Button variant="primary" className="w-full" disabled>
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
            <Button variant="secondary" className="w-full" disabled>
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowSignOutConfirm(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Coming Soon */}
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="pt-6 text-center">
              <Star className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <h3 className="font-semibold text-primary-800 mb-2">More Features Coming!</h3>
              <p className="text-sm text-primary-600">
                Social sharing, detailed analytics, and profile customization.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign Out"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to sign out? You'll need to sign in again to access your profile and track your environmental impact.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowSignOutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}