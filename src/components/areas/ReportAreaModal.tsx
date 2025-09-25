'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, MapPin, X, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { CleanupArea } from '@/types'

interface ReportAreaModalProps {
  isOpen: boolean
  onClose: () => void
  onAreaReported: (area: CleanupArea) => void
}

export function ReportAreaModal({ isOpen, onClose, onAreaReported }: ReportAreaModalProps) {
  const [step, setStep] = useState<'location' | 'photo' | 'details' | 'confirm'>('location')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const resetForm = () => {
    setStep('location')
    setLocation('')
    setDescription('')
    setPhoto(null)
    setSeverity('medium')
    setIsAnalyzing(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleLocationSubmit = () => {
    if (location.trim()) {
      setStep('photo')
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
        setStep('details')
        // TODO: Future OpenRouter Integration for Area Analysis:
        // Same analysis as above but for camera-captured photos
        // Will use identical OpenRouter API structure for consistency
        setIsAnalyzing(true)
        setTimeout(() => {
          setIsAnalyzing(false)
          // Random severity for demo - will be replaced with AI analysis
          const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
          setSeverity(severities[Math.floor(Math.random() * severities.length)])
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePhoto = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setCameraStream(stream)

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
      const mockPhotoUrl = `/assets/demo/demo-report-photo.jpg`
      setPhoto(mockPhotoUrl)
      setStep('details')
      setIsAnalyzing(true)
      setTimeout(() => {
        setIsAnalyzing(false)
        const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
        setSeverity(severities[Math.floor(Math.random() * severities.length)])
      }, 2000)
    }
  }

  const handleCapturePhoto = () => {
    if (videoRef.current && cameraStream) {
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
              setPhoto(photoDataUrl)
              setStep('details')

              // Stop camera stream
              cameraStream.getTracks().forEach(track => track.stop())
              setCameraStream(null)
              setShowCamera(false)

              // TODO: Future OpenRouter Integration for Area Analysis:
              // 1. Send photo to OpenRouter vision API for waste analysis
              // 2. Determine cleanup priority (low/medium/high) based on:
              //    - Amount and type of waste detected
              //    - Environmental impact assessment
              //    - Safety hazards identification
              //    - Cleanup complexity estimation
              // 3. Generate automated cleanup instructions
              // 4. Calculate estimated time and difficulty
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
              //             text: `Analyze this cleanup area photo and determine:
              //               - Cleanup priority level (low/medium/high)
              //               - Waste types and quantities
              //               - Safety hazards present
              //               - Estimated cleanup time
              //               - Specific cleanup instructions
              //               - Environmental impact assessment`
              //           },
              //           {
              //             type: 'image_url',
              //             image_url: { url: photoDataUrl }
              //           }
              //         ]
              //       }
              //     ],
              //     max_tokens: 1500
              //   })
              // });
              // const aiResult = await openRouterResponse.json();
              // const analysis = JSON.parse(aiResult.choices[0].message.content);
              // setSeverity(analysis.priority);
              setIsAnalyzing(true)
              setTimeout(() => {
                setIsAnalyzing(false)
                // Random severity for demo - will be replaced with AI analysis
                const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
                setSeverity(severities[Math.floor(Math.random() * severities.length)])
              }, 2000)
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
    setShowCamera(false)
  }

  const handleDetailsSubmit = () => {
    if (description.trim()) {
      setStep('confirm')
    }
  }

  const handleConfirm = async () => {
    try {
      // Get user's current location
      const userLocation = await new Promise<{lat: number, lng: number}>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (error) => {
            console.error('Error getting location:', error)
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })

      // Create new cleanup area with user's actual location
      const newArea: CleanupArea = {
        id: `reported-${Date.now()}`,
        location: userLocation,
        severity,
        status: 'available',
        description: description.trim(),
        cleanup_instructions: 'AI analysis in progress. Instructions will be generated upon claiming.',
        photos_before: photo ? [photo] : [],
        reported_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      onAreaReported(newArea)
      handleClose()
    } catch (error) {
      console.error('Error getting user location:', error)
      // Fallback to demo location if geolocation fails
      const newArea: CleanupArea = {
        id: `reported-${Date.now()}`,
        location: {
          lat: 2.747749 + (Math.random() - 0.5) * 0.01,
          lng: 101.763832 + (Math.random() - 0.5) * 0.01
        },
        severity,
        status: 'available',
        description: description.trim(),
        cleanup_instructions: 'AI analysis in progress. Instructions will be generated upon claiming.',
        photos_before: photo ? [photo] : [],
        reported_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      onAreaReported(newArea)
      handleClose()
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'High Priority'
      case 'medium': return 'Medium Priority'
      case 'low': return 'Low Priority'
      default: return 'Unknown'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {['location', 'photo', 'details', 'confirm'].map((stepName, index) => (
            <div
              key={stepName}
              className={`w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                stepName === step ? 'bg-primary-500' :
                ['location', 'photo', 'details', 'confirm'].indexOf(step) > index
                  ? 'bg-primary-300' : 'bg-gray-300'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Step: Location */}
        {step === 'location' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Report Cleanup Area</h2>
              <p className="text-gray-600">Tell us where you found this cleanup area</p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Description
                  </label>
                  <Input
                    placeholder="e.g., Near park entrance, behind the shopping mall..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">GPS Location</p>
                      <p className="text-xs text-blue-600">
                        We'll automatically detect your current location when you submit the report.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleLocationSubmit}
                disabled={!location.trim()}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step: Photo */}
        {step === 'photo' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Take a Photo</h2>
              <p className="text-gray-600">Show us the cleanup area so AI can analyze it</p>
            </div>

            {!photo ? (
              <Card className="border-dashed border-2 border-green-300">
                <CardContent className="text-center py-8">
                  <Camera className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">Capture Photo</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Take a clear photo of the area that needs cleaning
                  </p>

                  {showCamera ? (
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
                          >
                            <Camera className="w-6 h-6" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex space-x-3 justify-center">
                        <Button
                          variant="secondary"
                          onClick={handleCancelCamera}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-3 justify-center">
                      <Button
                        variant="primary"
                        onClick={handleTakePhoto}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Open Camera
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-3">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img src={photo} alt="Cleanup area" className="w-full h-full object-cover" />
                  </div>

                  {isAnalyzing && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
                      <p className="text-sm text-blue-600">AI analyzing photo...</p>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" onClick={() => {
                    setPhoto(null)
                    setStep('photo')
                  }}>
                    Retake Photo
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setStep('location')} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('details')}
                disabled={!photo || isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? 'Analyzing...' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Details</h2>
              <p className="text-gray-600">Describe what you see in the cleanup area</p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the waste you see, estimated amount, any hazards..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2">AI Analysis Result</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Severity Level:</span>
                    <span className={`font-semibold ${getSeverityColor(severity)}`}>
                      {getSeverityLabel(severity)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setStep('photo')} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleDetailsSubmit}
                disabled={!description.trim()}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Report</h2>
              <p className="text-gray-600">Review your report before submitting</p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Severity</p>
                    <p className={`font-medium ${getSeverityColor(severity)}`}>
                      {getSeverityLabel(severity)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Description</p>
                  <p className="text-sm bg-gray-50 rounded p-2">{description}</p>
                </div>

                <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src={photo || ''} alt="Cleanup area" className="w-full h-full object-cover" />
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">What happens next?</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your report will appear on the map. Other users can claim and clean this area to earn points.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button variant="primary" onClick={handleConfirm} className="flex-1">
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}