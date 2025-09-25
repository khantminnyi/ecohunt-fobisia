'use client'

import { useState } from 'react'
import { Users, Plus, ArrowRight, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useGroupStore } from '@/stores/group-store'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
  username: string
}

export function OnboardingModal({ isOpen, onComplete, username }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [groupChoice, setGroupChoice] = useState<'join' | 'create' | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const { createGroup, joinGroup, error, clearError } = useGroupStore()

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode) return
    
    setIsProcessing(true)
    try {
      clearError()
      await joinGroup(inviteCode)
      handleNext()
    } catch (error) {
      // Error handled by store
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName) return
    
    setIsProcessing(true)
    try {
      clearError()
      await createGroup(groupName, groupDescription)
      handleNext()
    } catch (error) {
      // Error handled by store
    } finally {
      setIsProcessing(false)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} showCloseButton={false}>
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber < step
                  ? 'bg-primary-500 text-white'
                  : stepNumber === step
                  ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stepNumber < step ? <Check className="w-4 h-4" /> : stepNumber}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to EcoHunt AI, {username}!
              </h2>
              <p className="text-gray-600">
                You're about to join the movement to clean our planet. Let's get you set up to start making an impact!
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-semibold text-primary-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>• Join or create a cleanup group</li>
                <li>• Discover cleanup areas near you</li>
                <li>• Earn points and compete with friends</li>
                <li>• Make a real environmental impact</li>
              </ul>
            </div>
            <Button variant="primary" onClick={handleNext} className="w-full">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Group Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join a Group</h2>
              <p className="text-gray-600">
                Groups help you compete with friends and track collective impact. You can always join more groups later.
              </p>
            </div>

            <div className="space-y-3">
              {/* Join existing group */}
              <Card 
                className={`cursor-pointer transition-all ${
                  groupChoice === 'join' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setGroupChoice('join')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Join Existing Group</h3>
                      <p className="text-sm text-gray-500">Use an invite code from friends</p>
                    </div>
                  </div>
                  
                  {groupChoice === 'join' && (
                    <div className="mt-4 space-y-3">
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      <Input
                        placeholder="Enter invite code (e.g., ECO-5X2P)"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="text-center font-mono"
                        onFocus={clearError}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleJoinGroup}
                        disabled={!inviteCode || isProcessing}
                        loading={isProcessing}
                        className="w-full"
                      >
                        Join Group
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create new group */}
              <Card 
                className={`cursor-pointer transition-all ${
                  groupChoice === 'create' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setGroupChoice('create')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Create New Group</h3>
                      <p className="text-sm text-gray-500">Start your own cleanup community</p>
                    </div>
                  </div>

                  {groupChoice === 'create' && (
                    <div className="mt-4 space-y-3">
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      <Input
                        placeholder="Group name (e.g., Campus EcoWarriors)"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onFocus={clearError}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreateGroup}
                        disabled={!groupName || isProcessing}
                        loading={isProcessing}
                        className="w-full"
                      >
                        Create Group
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Note: Users must join a group */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                You must join at least one group to use EcoHunt AI
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set! 🌍
              </h2>
              <p className="text-gray-600">
                Welcome to the EcoHunt AI community! Start exploring cleanup areas near you and begin making a difference.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-primary-800 mb-2">Ready to Start?</h3>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>✅ Explore the map for cleanup areas</li>
                <li>✅ Tap the + button to report new areas</li>
                <li>✅ Claim areas to start earning points</li>
                <li>✅ Compete with your group members</li>
              </ul>
            </div>

            <Button variant="primary" onClick={handleComplete} className="w-full">
              Start Cleaning! 🚀
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}