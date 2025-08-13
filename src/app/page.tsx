// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import MainDashboard from '@/components/dashboard/MainDashboard'

export default function HomePage() {
  const { user, profile, loading, error } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Only redirect after loading is complete and we're sure there's no user
    if (!loading && !user) {
      setShouldRedirect(true)
      const timer = setTimeout(() => {
        router.push('/login')
      }, 100) // Small delay to prevent flash

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  // Show loading while checking authentication or preparing to redirect
  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#10ac84'}}></div>
          <p className="text-gray-600">
            {loading ? 'Loading FASMAA IPC Platform...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state if there's an authentication error but user exists
  if (user && error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6">
            <div className="text-yellow-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-yellow-800 mb-2">Profile Issue</h1>
            <p className="text-yellow-700 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                Retry
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !profile) {
    return null
  }

  // Render the main dashboard for authenticated users with profiles
  return <MainDashboard />
}