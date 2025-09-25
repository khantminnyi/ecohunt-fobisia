'use client'

import { useState } from 'react'
import { Camera, ArrowLeft, Upload, Image } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function CameraPage() {
  const [isCapturing, setIsCapturing] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Report Cleanup Area</h1>
          <div className="w-5" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📸 How to Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>1. Take a clear photo of the cleanup area</p>
              <p>2. AI will analyze severity and generate cleanup instructions</p>
              <p>3. Your report will appear on the map for others to claim</p>
            </CardContent>
          </Card>

          {/* Camera Interface Placeholder */}
          <div className="aspect-square bg-gray-900 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Camera View</p>
                <p className="text-sm opacity-75">Point camera at cleanup area</p>
              </div>
            </div>

            {/* Camera controls overlay */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-6">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full w-12 h-12 p-0"
                disabled
              >
                <Image className="w-5 h-5" />
              </Button>

              <Button
                variant="primary"
                size="lg"
                className="rounded-full w-16 h-16 p-0 bg-white text-primary-600 hover:bg-gray-100"
                onClick={() => setIsCapturing(!isCapturing)}
                disabled
              >
                <div className="w-12 h-12 border-4 border-primary-600 rounded-full" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="rounded-full w-12 h-12 p-0"
                disabled
              >
                <Upload className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="pt-6 text-center">
              <div className="text-primary-600 mb-2">
                <Camera className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-semibold text-primary-800 mb-2">Coming Soon!</h3>
              <p className="text-sm text-primary-600">
                Camera integration and AI photo analysis will be available in the next update.
              </p>
            </CardContent>
          </Card>

          {/* Back to map */}
          <div className="pt-4">
            <Link href="/">
              <Button variant="secondary" className="w-full">
                Back to Map
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}