// Core type definitions for EcoHunt AI

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  total_points: number
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  invite_code: string
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  user?: User
}

export interface CleanupArea {
  id: string
  location: {
    lat: number
    lng: number
  }
  severity: 'high' | 'medium' | 'low'
  status: 'available' | 'claimed' | 'completed'
  description?: string
  cleanup_instructions?: string
  photos_before: string[]
  reported_by: string
  created_at: string
  updated_at: string
  reporter?: User
  distance_from_user?: number
}

export interface CleanupClaim {
  id: string
  area_id: string
  claimed_by: string
  collaborators: string[]
  status: 'in_progress' | 'completed' | 'verified'
  photos_after: string[]
  points_earned: number
  quality_score?: number
  claimed_at: string
  completed_at?: string
  verified_at?: string
  area?: CleanupArea
  claimer?: User
  collaborator_users?: User[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points_required: number
  category: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url?: string
  total_points: number
  rank: number
  group_id?: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  count: number
  page: number
  limit: number
  has_more: boolean
}

// Location and Map types
export interface LatLng {
  lat: number
  lng: number
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MapMarker {
  id: string
  position: LatLng
  severity: 'high' | 'medium' | 'low'
  status: 'available' | 'claimed' | 'completed'
  title: string
  description?: string
  points?: number
}

// AI Analysis types
export interface AIAnalysisRequest {
  image_base64: string
  context?: string
}

export interface AIAnalysisResult {
  severity: 'high' | 'medium' | 'low'
  description: string
  cleanup_instructions: string[]
  estimated_time: number
  difficulty: number
  waste_types: string[]
  safety_considerations: string[]
}

export interface AIVerificationRequest {
  before_image_base64: string
  after_image_base64: string
  area_id: string
}

export interface AIVerificationResult {
  quality_score: number
  completeness: number
  feedback: string
  points_earned: number
  verification_status: 'approved' | 'rejected' | 'needs_review'
  improvements_suggested?: string[]
}

// Form types
export interface CreateGroupForm {
  name: string
  description?: string
}

export interface JoinGroupForm {
  invite_code: string
}

export interface ReportAreaForm {
  photo: File
  description?: string
  location: LatLng
}

export interface ClaimAreaForm {
  area_id: string
  collaborators: string[]
  notes?: string
}

// Store/State types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface MapState {
  center: LatLng
  zoom: number
  bounds: MapBounds | null
  markers: MapMarker[]
  selectedMarker: MapMarker | null
  isLoading: boolean
}

export interface GroupState {
  currentGroup: Group | null
  groups: Group[]
  members: GroupMember[]
  leaderboard: LeaderboardEntry[]
  isLoading: boolean
}

// Component Props types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

// Event types
export interface MapClickEvent {
  latLng: LatLng
  pixel: { x: number; y: number }
}

export interface MarkerClickEvent {
  marker: MapMarker
  latLng: LatLng
}

// Utility types
export type SeverityLevel = 'high' | 'medium' | 'low'
export type CleanupStatus = 'available' | 'claimed' | 'completed'
export type UserRole = 'admin' | 'member'
export type ClaimStatus = 'in_progress' | 'completed' | 'verified'
export type VerificationStatus = 'approved' | 'rejected' | 'needs_review'

// Constants
export const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#22c55e',
} as const

export const SEVERITY_POINTS = {
  high: 150,
  medium: 100,
  low: 50,
} as const

export const ACHIEVEMENT_CATEGORIES = {
  cleanup: 'Cleanup',
  social: 'Social',
  streak: 'Streak',
  special: 'Special',
} as const