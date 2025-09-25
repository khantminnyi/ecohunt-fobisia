'use client'

import { Users } from 'lucide-react'
import { Group } from '@/types'

interface GroupCardProps {
  group: Group
  areaCount: number
  onClick: () => void
  isActive?: boolean
}

export function GroupCard({ group, areaCount, onClick, isActive = false }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white p-4 border border-gray-200 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
        isActive ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="p-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-900">{group.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{areaCount} areas</div>
      </div>
    </div>
  )
}