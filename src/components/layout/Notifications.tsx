'use client'

import { useState } from 'react'
import { Bell, X, MapPin, Trophy, Users, CheckCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface Notification {
  id: string
  type: 'cleanup_nearby' | 'group_challenge' | 'achievement_unlocked' | 'cleanup_verified'
  message: string
  timestamp: string
  read: boolean
  link?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'cleanup_nearby',
    message: 'New high priority cleanup area near you!',
    timestamp: '2 minutes ago',
    read: false,
    link: '/area/1'
  },
  {
    id: '2',
    type: 'cleanup_verified',
    message: 'Your cleanup of "Park Entrance" has been verified! +150 pts',
    timestamp: '1 hour ago',
    read: false,
    link: '/profile'
  },
  {
    id: '3',
    type: 'group_challenge',
    message: 'EcoWarriors: New weekly challenge "Clean 5 areas" started!',
    timestamp: '3 hours ago',
    read: true,
    link: '/groups'
  },
  {
    id: '4',
    type: 'achievement_unlocked',
    message: 'Achievement Unlocked: "First Cleanup"! Keep up the great work!',
    timestamp: 'Yesterday',
    read: true,
    link: '/profile'
  },
  {
    id: '5',
    type: 'cleanup_nearby',
    message: 'Medium priority cleanup area detected in city center.',
    timestamp: '2 days ago',
    read: true,
    link: '/area/2'
  },
]

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'cleanup_nearby': return <MapPin className="w-5 h-5 text-primary-500" />
      case 'group_challenge': return <Users className="w-5 h-5 text-ocean-500" />
      case 'achievement_unlocked': return <Trophy className="w-5 h-5 text-sunshine-500" />
      case 'cleanup_verified': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="touch-target flex items-center justify-center relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notifications">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    'flex items-start space-x-3 p-4',
                    !notification.read && 'bg-primary-50 border-primary-200'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}