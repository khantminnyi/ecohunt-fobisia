'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils/cn'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { signIn, signUp, signInWithGoogle, isLoading, error, clearError } = useAuthStore()

  const isSignUp = mode === 'signup'

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (isSignUp) {
      if (!formData.username) {
        errors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      clearError()
      
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.username)
      } else {
        await signIn(formData.email, formData.password)
      }
      
      // Close modal on success
      onClose()
    } catch (error) {
      // Error is handled by the store
      console.error('Auth error:', error)
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      clearError()
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Switch between sign in and sign up
  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setFormData({ email: '', password: '', username: '', confirmPassword: '' })
    setValidationErrors({})
    clearError()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Join EcoHunt AI' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isSignUp 
              ? 'Start your environmental cleanup adventure' 
              : 'Continue cleaning the world, one click at a time'
            }
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Google Sign In */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (sign up only) */}
          {isSignUp && (
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={validationErrors.username}
              disabled={isLoading}
            />
          )}

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={validationErrors.email}
            disabled={isLoading}
          />

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={validationErrors.password}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password (sign up only) */}
          {isSignUp && (
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={validationErrors.confirmPassword}
              disabled={isLoading}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Switch mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={isLoading}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        {/* Terms (sign up only) */}
        {isSignUp && (
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <button className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </button>
          </p>
        )}
      </div>
    </Modal>
  )
}