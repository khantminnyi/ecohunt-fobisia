'use client'

import { useState, useEffect } from 'react'
import { Trophy, Users, Plus, ArrowLeft, Crown, Medal, Award, Copy, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/use-auth'
import { useGroupStore } from '@/stores/group-store'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'

interface LeaderboardEntry {
  user_id: string
  username: string | null
  avatar_url: string | null
  total_points: number
  rank: number
}

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'groups'>('leaderboard')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { isAuthenticated, user } = useAuth()
  const {
    currentGroup,
    userGroups,
    currentGroupMembers,
    loadUserGroups,
    loadGroupMembers,
    setCurrentGroup,
    createGroup,
    joinGroup,
    error,
    clearError
  } = useGroupStore()

  // Load user groups and current group leaderboard
  useEffect(() => {
    if (isAuthenticated) {
      loadUserGroups()
    }
  }, [isAuthenticated, loadUserGroups])

  // Load leaderboard when current group changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (currentGroup) {
        try {
          const response = await fetch(`/api/groups/${currentGroup.id}/leaderboard`)
          if (response.ok) {
            const result = await response.json()
            setLeaderboard(result.data || [])
          }
        } catch (error) {
          console.error('Error loading leaderboard:', error)
        }
        
        // Also load group members
        loadGroupMembers(currentGroup.id)
      }
    }

    loadLeaderboard()
  }, [currentGroup, loadGroupMembers])

  // Use demo leaderboard data if no real data
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : [
    { user_id: '1', username: 'EcoWarrior2024', avatar_url: null, total_points: 2340, rank: 1 },
    { user_id: '2', username: 'GreenGuardian', avatar_url: null, total_points: 1850, rank: 2 },
    { user_id: '3', username: 'CleanupCrusader', avatar_url: null, total_points: 1620, rank: 3 },
    { user_id: user?.id || '4', username: user?.email?.split('@')[0] || 'You', avatar_url: null, total_points: 1450, rank: 4 },
    { user_id: '5', username: 'EarthHero', avatar_url: null, total_points: 1280, rank: 5 }
  ]

  const handleJoinGroup = async () => {
    if (!inviteCode) return
    
    setIsLoading(true)
    try {
      await joinGroup(inviteCode)
      setShowJoinModal(false)
      setInviteCode('')
    } catch (error) {
      // Error is handled by store
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName) return
    
    setIsLoading(true)
    try {
      await createGroup(groupName, groupDescription)
      setShowCreateModal(false)
      setGroupName('')
      setGroupDescription('')
    } catch (error) {
      // Error is handled by store
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteCode = () => {
    const groupToUse = currentGroup || displayGroup
    if (groupToUse) {
      navigator.clipboard.writeText(groupToUse.invite_code)
      // Could add toast notification here
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="touch-target flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Groups</h1>
            <div className="w-5" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full text-center">
            <CardContent className="pt-6">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Join groups to compete with friends and track collective environmental impact.
              </p>
              <Link href="/?auth=required">
                <Button variant="primary" className="w-full">
                  Sign In / Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Show loading only if we're actually loading and have no fallback data
  if ((!currentGroup && userGroups.length === 0) ||
      (!currentGroup && userGroups.length > 0 && !userGroups[0])) {
    
    // Auto-set first group if available
    if (userGroups.length > 0 && userGroups[0]) {
      setCurrentGroup(userGroups[0])
    }
    
    return <LoadingScreen message="Loading groups..." />
  }

  // Ensure we have a current group
  const displayGroup = currentGroup || userGroups[0] || {
    id: 'fallback',
    name: 'Mercato Cleanup Crew',
    invite_code: 'MERCATO-ECO',
    description: '',
    created_by: '',
    created_at: '',
    updated_at: ''
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
          <div className="w-5" />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'leaderboard'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1" />
            Rankings
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'groups'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Groups
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'leaderboard' && (
          <div className="max-w-md mx-auto space-y-4">
            {/* Group Summary */}
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {displayGroup.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary-100 text-sm">
                      {displayGroup.member_count || currentGroupMembers.length || 1} members
                    </p>
                    <p className="text-xl font-bold">
                      {leaderboard.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()} pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-100 text-sm">Invite Code</p>
                    <button
                      onClick={copyInviteCode}
                      className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded text-sm"
                    >
                      <span className="font-mono">{displayGroup.invite_code}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">🏆 Weekly Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayLeaderboard.map((leaderUser) => (
                    <div
                      key={leaderUser.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        leaderUser.username === 'You' || leaderUser.user_id === user?.id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {leaderUser.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                          {leaderUser.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                          {leaderUser.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                          {leaderUser.rank > 3 && (
                            <span className="text-sm font-semibold text-gray-500">
                              #{leaderUser.rank}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {leaderUser.username?.[0]?.toUpperCase() || '👤'}
                          </span>
                          <div>
                            <p className={`font-medium ${
                              leaderUser.username === 'You' || leaderUser.user_id === user?.id ? 'text-primary-700' : 'text-gray-900'
                            }`}>
                              {leaderUser.username || 'Anonymous'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {leaderUser.total_points.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-base text-orange-800">🎯 Weekly Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-2">
                  "Clean 5 areas this week"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-orange-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '60%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-orange-800">3/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="max-w-md mx-auto space-y-4">
            {/* Current Group */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>👥 Your Group</span>
                  <Button variant="secondary" size="sm">Manage</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{displayGroup.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• {displayGroup.member_count || currentGroupMembers.length || 1} active members</p>
                  <p>• {leaderboard.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()} total points</p>
                  <p>• Invite code:
                    <button
                      onClick={copyInviteCode}
                      className="font-mono bg-gray-100 px-1 rounded ml-1 hover:bg-gray-200"
                    >
                      {displayGroup.invite_code}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Join/Create Group */}
            <Card className="border-primary-200 bg-primary-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-primary-600">
                    <Plus className="w-8 h-8 mx-auto" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 mb-2">Want to join another group?</h3>
                    <p className="text-sm text-primary-600 mb-4">
                      Get an invite code from friends or create your own group
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowJoinModal(true)}
                    >
                      Join Group
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create New Group
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Groups */}
            {userGroups.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📋 All Your Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg border ${
                          group.id === currentGroup?.id
                            ? 'border-primary-200 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{group.name}</h4>
                            <p className="text-sm text-gray-500">{group.invite_code}</p>
                          </div>
                          {group.id === currentGroup?.id && (
                            <Badge variant="primary" size="sm">Active</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Join Group Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Group"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Input
            label="Invite Code"
            placeholder="Enter invite code (e.g., ECO-ABC123)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            onFocus={clearError}
          />
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleJoinGroup}
              disabled={!inviteCode || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              Join Group
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Input
            label="Group Name"
            placeholder="e.g., Campus EcoWarriors"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onFocus={clearError}
          />
          
          <Input
            label="Description (optional)"
            placeholder="Describe your group's mission"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateGroup}
              disabled={!groupName || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              Create Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}