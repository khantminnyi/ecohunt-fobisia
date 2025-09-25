'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { MapPin, Locate, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  defaultMapConfig,
  getCurrentLocation,
  createMarkerIcon,
  createShadowIcon,
  createUserLocationIcon,
  getMapBounds,
  calculateDistance,
  formatDistance,
  type LatLng,
  type MapBounds
} from '@/lib/maps/google-maps'
import { CleanupArea } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

interface MapContainerProps {
  cleanupAreas?: CleanupArea[]
  onAreaClick?: (area: CleanupArea) => void
  onAreaRemove?: (areaId: string) => void
  onMapClick?: (latLng: LatLng) => void
  onBoundsChange?: (bounds: MapBounds) => void
  className?: string
}

export function MapContainer({
  cleanupAreas = [],
  onAreaClick,
  onAreaRemove,
  onMapClick,
  onBoundsChange,
  className
}: MapContainerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState<LatLng>(defaultMapConfig.center)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const mapRef = useRef<GoogleMap>(null)

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry']
  })

  // Get user location on mount and lock to it initially
  useEffect(() => {
    const getUserLocation = async () => {
      setIsLoadingLocation(true)
      try {
        const location = await getCurrentLocation()
        setUserLocation(location)
        setCenter(location)
        
        // If map is loaded, center on user location
        if (map) {
          map.panTo(location)
          map.setZoom(17) // Closer zoom for initial view
        }
      } catch (error) {
        console.log('Could not get user location:', error)
        // Keep default center (Malaysia coordinates)
        setCenter(defaultMapConfig.center)
      } finally {
        setIsLoadingLocation(false)
      }
    }

    getUserLocation()
  }, [map])

  // Handle map load
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)

    // Set up bounds change listener
    if (onBoundsChange) {
      mapInstance.addListener('bounds_changed', () => {
        const bounds = getMapBounds(mapInstance)
        if (bounds) {
          onBoundsChange(bounds)
        }
      })
    }
    
    // If we already have user location, center on it
    if (userLocation) {
      mapInstance.panTo(userLocation)
      mapInstance.setZoom(17)
    }
  }, [onBoundsChange, userLocation])

  // Handle map unmount
  const onMapUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Handle map click
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng && onMapClick) {
      const latLng = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      onMapClick(latLng)
    }
  }, [onMapClick])

  // Handle marker click
  const handleMarkerClick = useCallback((area: CleanupArea, event?: google.maps.MapMouseEvent) => {
    // Check if Ctrl key is pressed for removal
    if (event && (event.domEvent as MouseEvent).ctrlKey && onAreaRemove) {
      onAreaRemove(area.id)
      return
    }

    setSelectedAreaId(area.id)
    if (onAreaClick) {
      onAreaClick(area)
    }
  }, [onAreaClick, onAreaRemove])

  // Center map on user location with smooth animation
  const centerOnUser = useCallback(async () => {
    if (!map) return
    
    setIsLoadingLocation(true)
    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      map.panTo(location)
      map.setZoom(17) // Close zoom to see details
    } catch (error) {
      console.log('Could not get user location:', error)
    } finally {
      setIsLoadingLocation(false)
    }
  }, [map])

  // Add distances to cleanup areas
  const areasWithDistances = cleanupAreas.map(area => ({
    ...area,
    distance_from_user: userLocation 
      ? calculateDistance(userLocation, area.location)
      : undefined
  }))

  if (loadError) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-lg', className)}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Error</h3>
          <p className="text-gray-500">Failed to load Google Maps</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-lg', className)}>
        <div className="text-center p-8">
          <LoadingSpinner className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Map</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <GoogleMap
        ref={mapRef}
        mapContainerClassName="w-full h-full rounded-lg"
        center={center}
        zoom={17} // Closer default zoom
        options={{
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy', // Allow all gestures for mobile
          draggable: true, // Ensure map is draggable
          scrollwheel: true, // Enable zoom with scroll
          disableDoubleClickZoom: false, // Allow double-click zoom
          styles: [
            {
              "featureType": "poi",
              "stylers": [
                { "visibility": "off" }
              ]
            },
            {
              "featureType": "transit",
              "stylers": [
                { "visibility": "off" }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels.icon",
              "stylers": [
                { "visibility": "off" }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels",
              "stylers": [
                { "visibility": "off" }
              ]
            }
          ]
        }}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
            title="Your location"
            zIndex={1000} // Ensure user location appears on top
          />
        )}

        {/* Shadow markers (rendered first to appear behind main markers) */}
        {areasWithDistances.map((area) => (
          <Marker
            key={`shadow-${area.id}`}
            position={area.location}
            icon={createShadowIcon(selectedAreaId === area.id)}
            zIndex={1} // Low z-index for shadows
          />
        ))}

        {/* Cleanup area markers */}
        {areasWithDistances.map((area) => (
          <Marker
            key={area.id}
            position={area.location}
            icon={createMarkerIcon(area.severity, selectedAreaId === area.id)}
            title={`${area.severity.toUpperCase()} - ${area.description || 'Cleanup needed'}`}
            onClick={(event) => handleMarkerClick(area, event)}
            zIndex={10} // Higher z-index for main markers
          />
        ))}
      </GoogleMap>

      {/* Location button */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-4 right-4 z-10 shadow-lg"
        onClick={centerOnUser}
        disabled={isLoadingLocation}
        aria-label="Center on my location"
      >
        {isLoadingLocation ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Locate className="w-4 h-4" />
        )}
      </Button>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Severity Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  )
}