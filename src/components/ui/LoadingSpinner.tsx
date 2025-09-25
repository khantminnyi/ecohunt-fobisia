'use client'

import { cn } from '@/lib/utils/cn'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-500',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  )
}

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-primary-600">
          {message || 'Loading EcoHunt AI...'}
        </h2>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner className="mx-auto mb-2" />
        <p className="text-sm text-gray-600 text-center">Processing...</p>
      </div>
    </div>
  )
}