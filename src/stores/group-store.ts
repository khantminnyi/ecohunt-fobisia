import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Group {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
}

interface GroupMember {
  id: string
  role: 'admin' | 'member'
  joined_at: string
  profiles: {
    id: string
    username: string | null
    avatar_url: string | null
    total_points: number
  }
}

interface GroupState {
  // State
  currentGroup: Group | null
  userGroups: Group[]
  currentGroupMembers: GroupMember[]
  isLoading: boolean
  error: string | null

  // Actions
  loadUserGroups: () => Promise<void>
  setCurrentGroup: (group: Group) => void
  createGroup: (name: string, description?: string) => Promise<Group>
  joinGroup: (inviteCode: string) => Promise<void>
  loadGroupMembers: (groupId: string) => Promise<void>
  removeGroupMember: (groupId: string, userId: string) => Promise<void>
  leaveGroup: (groupId: string) => Promise<void>
  clearError: () => void
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentGroup: null,
      userGroups: [],
      currentGroupMembers: [],
      isLoading: false,
      error: null,

      // Load user's groups (mock data for demo)
      loadUserGroups: async () => {
        set({ isLoading: true, error: null })

        const mockGroups = [
          {
            id: 'global-group-1',
            name: 'Mercato Cleanup Crew',
            description: 'Default group for all EcoHunt AI users',
            invite_code: 'MERCATO-ECO',
            created_by: 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            member_count: 5,
            user_role: 'member'
          },
          {
            id: 'campus-group-2',
            name: 'Campus EcoWarriors',
            description: 'University cleanup group',
            invite_code: 'CAMPUS-CLEAN',
            created_by: 'user-id-1', // Mock user ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            member_count: 3,
            user_role: 'admin'
          }
        ]

        set({
          userGroups: mockGroups,
          isLoading: false
        })

        // Set current group if none selected
        const { currentGroup } = get()
        if (!currentGroup && mockGroups.length > 0) {
          set({ currentGroup: mockGroups[0] })
        }
      },

      // Set current active group
      setCurrentGroup: (group: Group) => {
        set({ currentGroup: group })
      },

      // Create new group (mock for demo)
      createGroup: async (name: string, description?: string) => {
        set({ isLoading: true, error: null })
        
        const newGroup = {
          id: `mock-group-${Date.now()}`,
          name,
          description: description || null,
          invite_code: `MOCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_count: 1,
          user_role: 'admin'
        }

        set(state => ({
          userGroups: [...state.userGroups, newGroup],
          currentGroup: newGroup,
          isLoading: false
        }))

        return newGroup
      },

      // Join group by invite code (mock for demo)
      joinGroup: async (inviteCode: string) => {
        set({ isLoading: true, error: null })

        const existingGroup = get().userGroups.find(g => g.invite_code === inviteCode)
        if (existingGroup) {
          set({ error: 'You are already a member of this group', isLoading: false })
          throw new Error('Already a member')
        }

        const mockJoinedGroup = {
          id: `mock-joined-group-${Date.now()}`,
          name: `Joined Group ${inviteCode}`,
          description: 'A mock joined group',
          invite_code: inviteCode,
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_count: 2,
          user_role: 'member'
        }

        set(state => ({
          userGroups: [...state.userGroups, mockJoinedGroup],
          currentGroup: mockJoinedGroup,
          isLoading: false
        }))
      },

      // Load group members (mock for demo)
      loadGroupMembers: async (groupId: string) => {
        set({ isLoading: true, error: null })

        const mockMembers = [
          {
            id: 'mock-member-1',
            role: 'admin' as const,
            joined_at: new Date().toISOString(),
            profiles: {
              id: 'mock-user-id-1',
              username: 'AdminUser',
              avatar_url: null,
              total_points: 2500
            }
          },
          {
            id: 'mock-member-2',
            role: 'member' as const,
            joined_at: new Date().toISOString(),
            profiles: {
              id: 'mock-user-id-2',
              username: 'DemoMember',
              avatar_url: null,
              total_points: 1200
            }
          }
        ]
        
        set({
          currentGroupMembers: mockMembers,
          isLoading: false
        })
      },

      // Remove group member (mock for demo)
      removeGroupMember: async (groupId: string, userId: string) => {
        set({ isLoading: true, error: null })
        
        set(state => ({
          currentGroupMembers: state.currentGroupMembers.filter(
            member => member.profiles.id !== userId
          ),
          isLoading: false
        }))
      },

      // Leave group (mock for demo)
      leaveGroup: async (groupId: string) => {
        set({ isLoading: true, error: null })
        
        set(state => {
          const newGroups = state.userGroups.filter(g => g.id !== groupId)
          return {
            userGroups: newGroups,
            currentGroup: newGroups.length > 0 ? newGroups[0] : null,
            isLoading: false
          }
        })
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'ecohunt-groups',
      partialize: (state) => ({
        currentGroup: state.currentGroup,
        userGroups: state.userGroups
      })
    }
  )
)