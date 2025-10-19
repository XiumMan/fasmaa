// src/components/auth/SimpleAuthWrapper.tsx
'use client'

import React from 'react'
import { useSimpleAuth } from './SimpleAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface SimpleAuthWrapperProps {
  children: React.ReactNode
}

export default function SimpleAuthWrapper({ children }: SimpleAuthWrapperProps) {
  const { user, profile, loading } = useSimpleAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#10ac84'}}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to login
  }

  return <>{children}</>
}