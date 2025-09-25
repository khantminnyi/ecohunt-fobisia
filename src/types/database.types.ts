// Database type definitions for Supabase
// This file will be auto-generated when you run: supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          invite_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          invite_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          invite_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      cleanup_areas: {
        Row: {
          id: string
          location: any // PostGIS geometry
          severity: string
          status: string
          description: string | null
          cleanup_instructions: string | null
          photos_before: string[]
          reported_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location: any
          severity: string
          status?: string
          description?: string | null
          cleanup_instructions?: string | null
          photos_before?: string[]
          reported_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location?: any
          severity?: string
          status?: string
          description?: string | null
          cleanup_instructions?: string | null
          photos_before?: string[]
          reported_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      cleanup_claims: {
        Row: {
          id: string
          area_id: string
          claimed_by: string
          collaborators: string[]
          status: string
          photos_after: string[]
          points_earned: number
          quality_score: number | null
          claimed_at: string
          completed_at: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          area_id: string
          claimed_by: string
          collaborators?: string[]
          status?: string
          photos_after?: string[]
          points_earned?: number
          quality_score?: number | null
          claimed_at?: string
          completed_at?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          area_id?: string
          claimed_by?: string
          collaborators?: string[]
          status?: string
          photos_after?: string[]
          points_earned?: number
          quality_score?: number | null
          claimed_at?: string
          completed_at?: string | null
          verified_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          points_required: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          points_required?: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          points_required?: number
          category?: string
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}