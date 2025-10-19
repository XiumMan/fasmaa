// src/components/auth/SimpleLoginForm.tsx
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
  Activity,
  User
} from 'lucide-react'
import { useSimpleAuth } from './SimpleAuthProvider'

export default function SimpleLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useSimpleAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await login(email.trim(), password)
    if (success) {
      router.push('/')
    }
  }

  const quickLogin = async (testEmail: string, testPassword: string) => {
    const success = await login(testEmail, testPassword)
    if (success) {
      router.push('/')
    }
  }

  const testAccounts = [
    { email: 'admin@test.com', password: 'admin123', name: 'Administrator', role: 'ADMIN' },
    { email: 'ipc@test.com', password: 'ipc123', name: 'IPC Focal Person', role: 'IPC_FOCAL' },
    { email: 'nurse@test.com', password: 'nurse123', name: 'ICU Head Nurse', role: 'CHARGE_NURSE' }
  ]

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
              Simple Login System
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
                  placeholder="Enter email"
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
                  placeholder="Enter password"
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

          {/* Quick Login Section */}
          <div className="mt-6 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">Test Accounts</h3>
            </div>

            <p className="text-sm text-green-700 mb-3">
              Click any account below to login instantly:
            </p>

            <div className="space-y-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(account.email, account.password)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 text-left border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <div>
                    <p className="font-medium text-green-800">{account.name}</p>
                    <p className="text-sm text-green-600">{account.email} / {account.password}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">{account.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs mb-2" style={{color: '#778ca3'}}>
                Simple Authentication System (No Email Required)
              </p>
              <p className="text-xs" style={{color: '#778ca3'}}>
                Use test accounts above or manual login
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white opacity-75">
            Development Mode - Simplified Authentication
          </p>
          <p className="text-xs text-white opacity-75 mt-1">
            © 2025 Hulhumale Hospital - All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}