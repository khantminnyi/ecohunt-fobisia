'use client'

import { MapPin, Trophy, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const navItems: NavItem[] = [
  {
    href: '/',
    icon: MapPin,
    label: 'Map'
  },
  {
    href: '/groups',
    icon: Trophy,
    label: 'Leaderboard'
  }
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-t border-gray-200 bottom-nav-safe">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 touch-target transition-colors duration-200',
                'rounded-lg min-w-[60px]',
                isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 mb-1',
                  isActive && 'text-primary-600'
                )} 
              />
              <span 
                className={cn(
                  'text-xs font-medium',
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}