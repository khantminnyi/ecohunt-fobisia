'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Check, Upload, AlertTriangle, Users, Star } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SeverityBadge, PointsBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { CleanupArea } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { useGroupStore } from '@/stores/group-store'

interface ClaimingFlowProps {
  area: CleanupArea | null
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type ClaimingStep = 'collaborators' | 'after-photo' | 'verification' | 'complete'

export function ClaimingFlow({ area, isOpen, onClose, onComplete }: ClaimingFlowProps) {
  const [step, setStep] = useState<ClaimingStep>('collaborators')
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([])
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraType, setCameraType] = useState<'before' | 'after' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video stream when camera is shown
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error)
      }
    }
  }, [showCamera, cameraStream])

  const { isAuthenticated, user } = useAuth()
  const { currentGroupMembers, loadGroupMembers, currentGroup } = useGroupStore()

  // Load group members when modal opens
  useEffect(() => {
    if (isOpen && currentGroup) {
      loadGroupMembers(currentGroup.id)
    }
  }, [isOpen, currentGroup, loadGroupMembers])

  if (!area) return null

  const getPointsForSeverity = (severity: string) => {
    switch (severity) {
      case 'high': return 150
      case 'medium': return 100
      case 'low': return 50
      default: return 50
    }
  }

  const pointsPerPerson = Math.floor(getPointsForSeverity(area.severity) / (selectedCollaborators.length + 1))

  // AI analysis function with OpenRouter integration planned
  // TODO: Future OpenRouter Integration Plan:
  // 1. Convert photo to base64 and send to OpenRouter API
  // 2. Use vision model (e.g., gpt-4-vision-preview) to analyze cleanup quality
  // 3. Extract: waste types, cleanup completeness, environmental impact metrics
  // 4. Calculate quality score based on before/after comparison
  // 5. Generate personalized feedback and improvement suggestions
  //
  // OpenRouter API call structure:
  // const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  //     'Content-Type': 'application/json',
  //     'HTTP-Referer': window.location.origin,
  //     'X-Title': 'EcoHunt AI'
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4-vision-preview',
  //     messages: [
  //       {
  //         role: 'user',
  //         content: [
  //           {
  //             type: 'text',
  //             text: `Analyze this ${photoType} cleanup photo and provide:
  //               - Quality score (0-100)
  //               - Cleanup completeness assessment
  //               - Environmental impact metrics
  //               - Specific feedback and improvements
  //               - Waste type identification
  //               - Safety assessment`
  //           },
  //           {
  //             type: 'image_url',
  //             image_url: { url: photoDataUrl }
  //           }
  //         ]
  //       }
  //     ],
  //     max_tokens: 1000
  //   })
  // });
  // const aiResult = await openRouterResponse.json();
  // const parsedAnalysis = JSON.parse(aiResult.choices[0].message.content);
  const analyzePhoto = async (photoType: 'before' | 'after') => {
    setIsProcessing(true)
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock analysis for demo - will be replaced with OpenRouter API call

    const mockAnalysis = {
      before: {
        severity: area.severity,
        wasteTypes: ['plastic bottles', 'food waste', 'paper litter'],
        estimatedTime: '15-20 minutes',
        safetyNotes: ['Wear gloves', 'Watch for sharp objects'],
        description: 'Moderate accumulation of mixed waste requiring standard cleanup procedures'
      },
      after: {
        qualityScore: 92,
        completeness: 'Excellent',
        pointsEarned: pointsPerPerson,
        improvements: ['Area thoroughly cleaned', 'Proper waste separation', 'No remaining debris'],
        environmentalImpact: {
          wasteRemoved: '2.3 kg',
          co2Saved: '1.2 kg',
          recyclablesRecovered: '8 items'
        }
      }
    }
    
    setAiAnalysis(mockAnalysis[photoType])
    setIsProcessing(false)
  }

  // Real camera capture with failure for green marker (area ID '3')
  const capturePhoto = async (type: 'before' | 'after') => {
    try {
      // Make green marker (area '3') camera always fail for demo
      if (area.id === '3' && type === 'after') {
        const mockPhotoUrl = `/assets/demo/demo-${type}-photo.jpg`
        setAfterPhoto(mockPhotoUrl)

        setIsProcessing(true)
        setTimeout(() => {
          setAiAnalysis({
            qualityScore: 0,
            completeness: 'Failed',
            pointsEarned: 0,
            error: 'The area isn\'t cleaned sufficiently. Please ensure all visible waste is removed before taking the photo.',
            failed: true
          })
          setIsProcessing(false)
        }, 2000)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setCameraStream(stream)
      setCameraType(type)

      // Wait a bit for the stream to be ready, then show camera
      setTimeout(() => {
        setShowCamera(true)

        // Ensure video element is properly connected
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error)
          }
        }
      }, 100)

    } catch (error) {
      console.error('Error accessing camera:', error)
      // Fallback to mock photo if camera access fails
      const mockPhotoUrl = `/assets/demo/demo-${type}-photo.jpg`
      if (type === 'before') {
        setBeforePhoto(mockPhotoUrl)
      } else {
        setAfterPhoto(mockPhotoUrl)
      }
      analyzePhoto(type)
    }
  }

  const handleCapturePhoto = () => {
    if (videoRef.current && cameraStream && cameraType) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)

        // Convert to blob and then to data URL
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const photoDataUrl = e.target?.result as string
              if (cameraType === 'before') {
                setBeforePhoto(photoDataUrl)
              } else {
                setAfterPhoto(photoDataUrl)
              }
              analyzePhoto(cameraType)

              // Stop camera stream
              cameraStream.getTracks().forEach(track => track.stop())
              setCameraStream(null)
              setCameraType(null)
              setShowCamera(false)
            }
            reader.readAsDataURL(blob)
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const handleCancelCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCameraType(null)
    setShowCamera(false)
  }

  const toggleCollaborator = (userId: string) => {
    if (selectedCollaborators.includes(userId)) {
      setSelectedCollaborators(selectedCollaborators.filter(id => id !== userId))
    } else {
      setSelectedCollaborators([...selectedCollaborators, userId])
    }
  }

  const handleNext = () => {
    const stepOrder: ClaimingStep[] = ['collaborators', 'after-photo', 'verification', 'complete']
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const stepOrder: ClaimingStep[] = ['collaborators', 'after-photo', 'verification', 'complete']
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1])
    }
  }

  const resetFlow = () => {
    setStep('collaborators')
    setSelectedCollaborators([])
    setBeforePhoto(null)
    setAfterPhoto(null)
    setAiAnalysis(null)
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetFlow()
    onClose()
  }

  const handleComplete = async () => {
    if (!afterPhoto || !aiAnalysis) return
    
    setIsProcessing(true)
    try {
      // Submit claim to API
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area_id: area.id,
          collaborators: selectedCollaborators,
          photos_after: [afterPhoto],
          quality_score: aiAnalysis.qualityScore,
          points_earned: aiAnalysis.pointsEarned
        })
      })

      if (response.ok) {
        console.log('Claim submitted successfully')
        resetFlow()
        onComplete()
      } else {
        console.error('Failed to submit claim')
        // Still complete the flow for demo purposes
        resetFlow()
        onComplete()
      }
    } catch (error) {
      console.error('Error submitting claim:', error)
      // Still complete the flow for demo purposes
      resetFlow()
      onComplete()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {['collaborators', 'after-photo', 'verification', 'complete'].map((stepName, index) => (
            <div
              key={stepName}
              className={`w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                stepName === step ? 'bg-primary-500' :
                ['collaborators', 'after-photo', 'verification', 'complete'].indexOf(step) > index
                  ? 'bg-primary-300' : 'bg-gray-300'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Step: Collaborators */}
        {step === 'collaborators' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Claim Cleanup Area</h2>
              <p className="text-gray-600">Add collaborators to split points, then upload your completion photo</p>
            </div>

            {/* Area summary */}
            <Card className="border-primary-200 bg-primary-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-800">{area.description}</h3>
                    <p className="text-sm text-primary-600">Claiming this {area.severity} priority area</p>
                  </div>
                  <PointsBadge points={getPointsForSeverity(area.severity)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Group Members to Help</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentGroupMembers
                      .filter(member => member.profiles.id !== user?.id) // Exclude current user
                      .map((member) => (
                        <button
                          key={member.id}
                          onClick={() => toggleCollaborator(member.profiles.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedCollaborators.includes(member.profiles.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                  {member.profiles.username?.[0]?.toUpperCase() || '👤'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.profiles.username || 'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.profiles.total_points} points
                                </p>
                              </div>
                            </div>
                            {selectedCollaborators.includes(member.profiles.id) && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                  
                  {currentGroupMembers.length <= 1 && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">You're the only member in this group</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-700">Points per person:</span>
                    <span className="font-bold text-primary-800">{pointsPerPerson} pts</span>
                  </div>
                  {selectedCollaborators.length > 0 && (
                    <p className="text-xs text-primary-600 mt-1">
                      Split among {selectedCollaborators.length + 1} people
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleNext} className="flex-1">
                Start Cleanup
              </Button>
            </div>
          </div>
        )}


        {/* Step: After Photo */}
        {step === 'after-photo' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Completion Photo</h2>
              <p className="text-gray-600">Show the cleaned area for verification and earn your points</p>
            </div>

            {!afterPhoto ? (
              <Card className="border-dashed border-2 border-green-300">
                <CardContent className="text-center py-8">
                  <Camera className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">Capture After Photo</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Take a photo showing the completed cleanup
                  </p>

                  {showCamera && cameraType === 'after' ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-full max-w-sm">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 bg-gray-900 rounded-lg object-cover border-2 border-gray-300"
                          style={{ transform: 'scaleX(-1)' }} // Mirror the camera
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={handleCapturePhoto}
                            className="rounded-full w-16 h-16 p-0 shadow-lg"
                            disabled={isProcessing}
                          >
                            <Camera className="w-6 h-6" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleCancelCamera}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => capturePhoto('after')}
                      disabled={isProcessing}
                      loading={isProcessing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-3">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img src={afterPhoto} alt="After cleanup" className="w-full h-full object-cover" />
                  </div>
                  
                  {isProcessing && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
                      <p className="text-sm text-blue-600">AI analyzing cleanup quality...</p>
                    </div>
                  )}

                  {aiAnalysis && !isProcessing && (
                    <div className={`rounded-lg p-3 ${aiAnalysis.failed ? 'bg-red-50' : 'bg-green-50'}`}>
                      <h4 className={`font-medium mb-2 ${aiAnalysis.failed ? 'text-red-800' : 'text-green-800'}`}>
                        {aiAnalysis.failed ? '❌ Verification Failed!' : '🎉 Cleanup Verified!'}
                      </h4>
                      <div className={`text-sm space-y-1 ${aiAnalysis.failed ? 'text-red-700' : 'text-green-700'}`}>
                        {aiAnalysis.failed ? (
                          <p><strong>Error:</strong> {aiAnalysis.error}</p>
                        ) : (
                          <>
                            <p><strong>Quality Score:</strong> {aiAnalysis.qualityScore}/100</p>
                            <p><strong>Status:</strong> {aiAnalysis.completeness}</p>
                            <p><strong>Points Earned:</strong> {aiAnalysis.pointsEarned}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" onClick={() => {
                    setAfterPhoto(null)
                    setAiAnalysis(null)
                  }}>
                    Retake Photo
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!afterPhoto || !aiAnalysis || isProcessing || (aiAnalysis && aiAnalysis.failed)}
                className="flex-1"
              >
                {aiAnalysis && aiAnalysis.failed ? 'Fix Issues First' : 'Submit Cleanup'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Verification */}
        {step === 'verification' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cleanup Summary</h2>
              <p className="text-gray-600">Review your environmental impact</p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Before</h4>
                    <img src={area.photos_before[0]} alt="Before" className="w-full h-24 object-cover rounded-lg" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">After</h4>
                    <img src={afterPhoto || ''} alt="After" className="w-full h-24 object-cover rounded-lg" />
                  </div>
                </div>

                {aiAnalysis && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-3">🌍 Environmental Impact</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Waste Removed</p>
                        <p className="font-bold text-green-600">{aiAnalysis.environmentalImpact.wasteRemoved}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CO₂ Saved</p>
                        <p className="font-bold text-blue-600">{aiAnalysis.environmentalImpact.co2Saved}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Items Recycled</p>
                        <p className="font-bold text-purple-600">{aiAnalysis.environmentalImpact.recyclablesRecovered}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Points Earned</p>
                        <p className="font-bold text-orange-600">{aiAnalysis.pointsEarned} pts</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCollaborators.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-2">👥 Team Effort</h4>
                    <p className="text-sm text-gray-600">
                      Points split equally among {selectedCollaborators.length + 1} people:
                      <span className="font-bold text-primary-600"> {pointsPerPerson} pts each</span>
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedCollaborators.map(userId => {
                        const member = currentGroupMembers.find(m => m.profiles.id === userId)
                        return member?.profiles.username || 'Unknown'
                      }).join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button variant="primary" onClick={handleNext} className="flex-1">
                Complete Cleanup
              </Button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Great Work!</h2>
              <p className="text-gray-600">You've successfully cleaned this area and made a real environmental impact!</p>
            </div>

            {aiAnalysis && (
              <Card className="bg-gradient-to-r from-green-500 to-primary-500 text-white">
                <CardContent className="text-center py-6">
                  <div className="text-3xl font-bold mb-2">+{aiAnalysis.pointsEarned}</div>
                  <div className="text-green-100">Points Earned</div>
                </CardContent>
              </Card>
            )}

            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-semibold text-primary-800 mb-2">🌟 Achievement Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-600">First Cleanup</span>
                  <span className="text-green-600 font-bold">✓ Unlocked!</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Eco Warrior (2000 pts)</span>
                  <span className="text-gray-500">{Math.min(100, (1450 + (aiAnalysis?.pointsEarned || 0)) / 20)}%</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleComplete}
              className="w-full"
              loading={isProcessing}
              disabled={isProcessing}
            >
              <Star className="w-4 h-4 mr-2" />
              Return to Map
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}