// Google Maps configuration and utilities

export const defaultMapConfig = {
  center: {
    lat: 2.747749, // Malaysia default (Selangor)
    lng: 101.763832
  },
  zoom: 16,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    // Clean, minimal style inspired by modern map designs
    {
      featureType: 'all',
      elementType: 'geometry.fill',
      stylers: [
        { saturation: -30 },
        { lightness: 25 },
        { visibility: 'on' }
      ]
    },
    {
      featureType: 'administrative',
      elementType: 'labels',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [
        { saturation: -80 },
        { lightness: 60 }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [
        { visibility: 'simplified' }
      ]
    },
    {
      featureType: 'road.arterial',
      elementType: 'all',
      stylers: [
        { lightness: 40 }
      ]
    },
    {
      featureType: 'road.local',
      elementType: 'all',
      stylers: [
        { lightness: 50 }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        { color: '#d4e7f7' },
        { visibility: 'on' }
      ]
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [
        { color: '#f0f4f7' },
        { visibility: 'on' }
      ]
    },
    {
      featureType: 'landscape.natural',
      elementType: 'all',
      stylers: [
        { color: '#e8f4e8' },
        { visibility: 'on' }
      ]
    }
  ]
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface LatLng {
  lat: number
  lng: number
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

// Get map bounds from Google Maps instance
export function getMapBounds(map: google.maps.Map): MapBounds | null {
  const bounds = map.getBounds()
  if (!bounds) return null

  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()

  return {
    north: ne.lat(),
    south: sw.lat(),
    east: ne.lng(),
    west: sw.lng()
  }
}

// Check if point is within bounds
export function isPointInBounds(point: LatLng, bounds: MapBounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  )
}

// Get user's current location
export function getCurrentLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
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
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Cleanup area severity colors
export const SEVERITY_COLORS = {
  high: '#ef4444',    // red
  medium: '#eab308',  // yellow
  low: '#22c55e'      // green
} as const

// Map marker icons for different severities using custom images
export function createMarkerIcon(severity: 'high' | 'medium' | 'low', isSelected = false): google.maps.Icon {
  const severityToMarker = {
    high: '/assets/markers/red_marker.png',
    medium: '/assets/markers/yellow_marker.png',
    low: '/assets/markers/green_marker.png'
  }
  
  // Fixed dimensions to prevent glitching during zoom
  const width = isSelected ? 36 : 30
  const height = isSelected ? 54 : 45 // Maintain 2:3 ratio for stable scaling
  
  return {
    url: severityToMarker[severity],
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height) // Anchor at bottom center
  }
}

// Create shadow marker with proper alignment
export function createShadowIcon(isSelected = false): google.maps.Icon {
  // Shadow should be wider than marker but positioned to align
  const shadowWidth = isSelected ? 50 : 42
  const shadowHeight = isSelected ? 25 : 20
  
  // Marker dimensions for alignment calculation
  const markerWidth = isSelected ? 36 : 30
  const markerHeight = isSelected ? 54 : 45
  
  return {
    url: '/assets/markers/shadow_marker.png',
    scaledSize: new google.maps.Size(shadowWidth, shadowHeight),
    // Position shadow so marker bottom aligns with shadow bottom
    anchor: new google.maps.Point(shadowWidth / 2, shadowHeight - 2) // Slightly offset for natural look
  }
}

// Create user location marker icon
export function createUserLocationIcon(): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(20, 20),
    anchor: new google.maps.Point(10, 10)
  }
}

// Cluster styles for map markers
export const clusterStyles = [
  {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">TEXT</text>
      </svg>
    `)}`,
    height: 40,
    width: 40,
    textColor: 'transparent'
  }
]