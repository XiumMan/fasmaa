// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle,
  Shield,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/database'

interface LoginFormProps {
  onSuccess?: (user: UserProfile) => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Login failed - no user data received')
      }

      // Get user profile to check if account is active
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single()

      // Also check if user exists but is inactive
      const { data: anyProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError || !profile) {
        // Sign out the user if profile doesn't exist or is inactive
        await supabase.auth.signOut()
        
        if (anyProfile && !anyProfile.is_active) {
          throw new Error('Your account has been deactivated. Please contact your administrator.')
        } else if (!anyProfile) {
          throw new Error(`No user profile found for ${authData.user.email}. Please contact your administrator to set up your profile.`)
        } else {
          throw new Error('Account not found or inactive. Please contact your administrator.')
        }
      }

      // Success - call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess(profile)
      } else {
        router.push('/')  // Redirect to home/dashboard
      }

    } catch (err: unknown) {
      console.error('Login error:', err)
      
      const error = err as Error
      
      // Handle specific error messages
      if (error.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else if (error.message.includes('inactive')) {
        setError('Your account has been deactivated. Please contact your administrator.')
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #0abde3 0%, #54a0ff 100%)'}}>
      <div className="w-full max-w-md">
        {/* Hospital Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full" style={{backgroundColor: '#10ac84'}}>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
            Hulhumale Hospital
          </h1>
          <p className="font-medium mb-1 text-white drop-shadow-sm" style={{color: '#96ceb4'}}>
            Infection Prevention & Control
          </p>
          <p className="text-sm text-white opacity-90">
            Surveillance Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-5 h-5 mr-2" style={{color: '#10ac84'}} />
            <h2 className="text-lg font-semibold text-gray-800">
              Secure Access Portal
            </h2>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-md flex items-start" style={{backgroundColor: '#ff6b6b20', borderColor: '#ff6b6b', borderWidth: '1px'}}>
              <AlertCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" style={{color: '#ff6b6b'}} />
              <div>
                <p className="text-sm" style={{color: '#c44569'}}>{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    '--tw-ring-color': '#10ac84'
                  } as React.CSSProperties}
                  placeholder="your.email@hmh.mv"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    '--tw-ring-color': '#10ac84'
                  } as React.CSSProperties}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
              style={{
                backgroundColor: loading || !email || !password ? '#778ca3' : '#10ac84',
                '--tw-ring-color': '#10ac84'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!loading && email && password) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#0e9574'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && email && password) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#10ac84'
                }
              }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs mb-2" style={{color: '#778ca3'}}>
                Authorized Personnel Only
              </p>
              <p className="text-xs" style={{color: '#778ca3'}}>
                Need access? Contact your administrator or IPC Committee
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white opacity-75">
            Protected by hospital security protocols
          </p>
          <p className="text-xs text-white opacity-75 mt-1">
            © 2025 Hulhumale Hospital - All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}