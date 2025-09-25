'use client'

import { Clock, MapPin, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { CleanupArea } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { SeverityBadge, PointsBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDistance } from '@/lib/maps/google-maps'
import { cn } from '@/lib/utils/cn'

interface AreaCardProps {
  area: CleanupArea
  onClaim?: () => void
  onViewDetails?: () => void
  showActions?: boolean
  className?: string
}

export function AreaCard({
  area,
  onClaim,
  onViewDetails,
  showActions = true,
  className
}: AreaCardProps) {
  const isAvailable = area.status === 'available'
  const isClaimed = area.status === 'claimed'
  const isCompleted = area.status === 'completed'

  const getPointsForSeverity = (severity: string) => {
    switch (severity) {
      case 'high': return 150
      case 'medium': return 100
      case 'low': return 50
      default: return 50
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

  return (
    <Card className={cn('relative overflow-hidden', className)} hover>
      {/* Status indicator stripe */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1',
        area.severity === 'high' && 'bg-severity-high',
        area.severity === 'medium' && 'bg-severity-medium',
        area.severity === 'low' && 'bg-severity-low'
      )} />

      <CardContent className="pt-4">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={area.severity} />
            {isAvailable && <PointsBadge points={getPointsForSeverity(area.severity)} />}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-1 text-sm">
            {isAvailable && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            {isClaimed && <Users className="w-4 h-4 text-blue-500" />}
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            <span className={cn(
              'text-xs font-medium capitalize',
              isAvailable && 'text-yellow-600',
              isClaimed && 'text-blue-600',
              isCompleted && 'text-green-600'
            )}>
              {area.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {area.description || `${area.severity.charAt(0).toUpperCase() + area.severity.slice(1)} priority cleanup area`}
        </h3>

        {/* Before photos preview */}
        {area.photos_before.length > 0 && (
          <div className="flex space-x-2 mb-3 overflow-x-auto">
            {area.photos_before.slice(0, 3).map((photo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Area photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {area.photos_before.length > 3 && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">+{area.photos_before.length - 3}</span>
              </div>
            )}
          </div>
        )}

        {/* Meta information */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(area.created_at)}</span>
            </div>
            
            {area.distance_from_user && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{formatDistance(area.distance_from_user)}</span>
              </div>
            )}
          </div>

          {/* Cleanup instructions preview */}
          {area.cleanup_instructions && (
            <p className="text-xs text-gray-400 line-clamp-2">
              {area.cleanup_instructions}
            </p>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex space-x-2 w-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              className="flex-1"
            >
              View Details
            </Button>
            
            {isAvailable && (
              <Button
                variant="primary"
                size="sm"
                onClick={onClaim}
                className="flex-1"
              >
                Claim Area
              </Button>
            )}
            
            {isClaimed && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="flex-1"
              >
                In Progress
              </Button>
            )}
            
            {isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className="flex-1"
              >
                View Results
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

// Compact version for map popups
export function AreaCardCompact({
  area,
  onClaim,
  onViewDetails,
  className
}: AreaCardProps) {
  const isAvailable = area.status === 'available'

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-4 min-w-[280px]', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <SeverityBadge severity={area.severity} size="sm" />
        {isAvailable && (
          <PointsBadge points={getPointsForSeverity(area.severity)} size="sm" />
        )}
      </div>

      {/* Description */}
      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
        {area.description || `${area.severity} priority cleanup needed`}
      </h3>

      {/* Photo preview */}
      {area.photos_before[0] && (
        <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden mb-2">
          <img
            src={area.photos_before[0]}
            alt="Area preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 text-xs"
        >
          Details
        </Button>
        
        {isAvailable && (
          <Button
            variant="primary"
            size="sm"
            onClick={onClaim}
            className="flex-1 text-xs"
          >
            Claim
          </Button>
        )}
        {!isAvailable && (
          <Button
            variant="secondary"
            size="sm"
            disabled
            className="flex-1 text-xs"
          >
            {area.status === 'claimed' ? 'In Progress' : 'Completed'}
          </Button>
        )}
      </div>
    </div>
  )

  function getPointsForSeverity(severity: string) {
    switch (severity) {
      case 'high': return 150
      case 'medium': return 100
      case 'low': return 50
      default: return 50
    }
  }
}