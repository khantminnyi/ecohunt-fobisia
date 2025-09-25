'use client'

import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'md',
  children,
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-primary-100 text-primary-800 border border-primary-200',
    secondary: 'bg-ocean-100 text-ocean-800 border border-ocean-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    success: 'bg-green-100 text-green-800 border border-green-200'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs min-h-[20px]',
    md: 'px-2.5 py-1 text-sm min-h-[24px]',
    lg: 'px-3 py-1.5 text-base min-h-[28px]'
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Severity-specific badges for cleanup areas
export function SeverityBadge({
  severity,
  size = 'md',
  className,
  ...props
}: {
  severity: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const severityConfig = {
    high: {
      variant: 'danger' as const,
      label: 'High Priority',
      icon: '🔴'
    },
    medium: {
      variant: 'warning' as const,
      label: 'Medium Priority', 
      icon: '🟡'
    },
    low: {
      variant: 'success' as const,
      label: 'Low Priority',
      icon: '🟢'
    }
  }

  const config = severityConfig[severity]

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn('gap-1', className)}
      {...props}
    >
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  )
}

// Points badge for gamification
export function PointsBadge({
  points,
  size = 'md',
  className,
  ...props
}: {
  points: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <Badge
      variant="primary"
      size={size}
      className={cn('gap-1', className)}
      {...props}
    >
      <span>🎯</span>
      {points} pts
    </Badge>
  )
}