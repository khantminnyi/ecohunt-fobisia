'use client'

import { cn } from '@/lib/utils/cn'

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'danger'
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  children: React.ReactNode
}

export function FloatingActionButton({
  className,
  size = 'md',
  variant = 'primary',
  position = 'bottom-right',
  children,
  ...props
}: FloatingActionButtonProps) {
  const baseClasses = 'fixed z-40 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target'
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-primary-500/25',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-red-500/25'
  }
  
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 sm:bottom-24 sm:right-6',
    'bottom-left': 'bottom-20 left-4 sm:bottom-24 sm:left-6',
    'bottom-center': 'bottom-20 left-1/2 transform -translate-x-1/2 sm:bottom-24'
  }

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        positionClasses[position],
        'active:scale-95 hover:scale-105',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-full h-full">
        {children}
      </div>
    </button>
  )
}

// Preset FABs for common actions
export function AddAreaFAB({ onClick }: { onClick: () => void }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      position="bottom-right"
      className="bottom-40 right-2 sm:bottom-44 sm:right-3"
      aria-label="Report new cleanup area"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </FloatingActionButton>
  )
}

export function CameraFAB({ onClick }: { onClick: () => void }) {
  return (
    <FloatingActionButton onClick={onClick} aria-label="Take photo">
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </FloatingActionButton>
  )
}

export function FilterFAB({
  onClick,
  isActive = false
}: {
  onClick: () => void
  isActive?: boolean
}) {
  return (
    <FloatingActionButton
      onClick={onClick}
      variant={isActive ? 'primary' : 'secondary'}
      position="bottom-left"
      size="sm"
      aria-label="Filter cleanup areas"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    </FloatingActionButton>
  )
}
