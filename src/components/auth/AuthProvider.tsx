// src/components/auth/AuthProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserRole, DepartmentType, FormType } from '@/types/database'

// Auth Context Types
interface AuthContextType {
  // Authentication State
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  
  // Authentication Actions
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  
  // Permission Helpers
  hasRole: (role: UserRole) => boolean
  hasDepartmentAccess: (department: DepartmentType) => boolean
  canAccessForm: (formType: FormType) => boolean
  isAdmin: boolean
  isIpcFocal: boolean
  isIpcOfficer: boolean
  
  // User Info Helpers
  userName: string
  userDepartment: string
  userRole: string
  departmentDisplayName: string
  roleDisplayName: string
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode
}

// Display name mappings
const DEPARTMENT_DISPLAY_NAMES: Record<DepartmentType, string> = {
  ICU: 'Intensive Care Unit',
  NICU: 'Neonatal ICU',
  PICU: 'Pediatric ICU',
  CCU: 'Cardiac Care Unit',
  GENERAL_SURGERY: 'General Surgery',
  ORTHOPEDIC: 'Orthopedic',
  CARDIAC_SURGERY: 'Cardiac Surgery',
  NEUROSURGERY: 'Neurosurgery',
  OBSTETRICS_GYNECOLOGY: 'Obstetrics & Gynecology',
  PEDIATRICS: 'Pediatrics',
  INTERNAL_MEDICINE: 'Internal Medicine',
  EMERGENCY: 'Emergency Department',
  DIALYSIS: 'Dialysis Unit',
  ONCOLOGY: 'Oncology',
  BURNS_UNIT: 'Burns Unit',
  LABORATORY: 'Laboratory',
  RADIOLOGY: 'Radiology',
  PHARMACY: 'Pharmacy',
  IPC_COMMITTEE: 'IPC Committee'
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  IPC_FOCAL: 'IPC Focal Person',
  IPC_OFFICER: 'IPC Officer',
  IPC_COMMITTEE: 'IPC Committee Member',
  DEPARTMENT_HEAD: 'Department Head',
  CONSULTANT: 'Consultant',
  MEDICAL_OFFICER: 'Medical Officer',
  STAFF_NURSE: 'Staff Nurse',
  CHARGE_NURSE: 'Charge Nurse',
  INFECTION_CONTROL_NURSE: 'Infection Control Nurse',
  LABORATORY_TECHNICIAN: 'Laboratory Technician',
  VIEWER: 'Viewer'
}

// Permission matrix for form access based on roles
const ROLE_FORM_PERMISSIONS: Record<UserRole, FormType[]> = {
  ADMIN: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  IPC_FOCAL: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  IPC_OFFICER: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  IPC_COMMITTEE: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  DEPARTMENT_HEAD: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO'],
  CONSULTANT: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO'],
  MEDICAL_OFFICER: ['CAUTI', 'CLABSI', 'SSI', 'MDRO'],
  STAFF_NURSE: ['CAUTI', 'CLABSI', 'VAP'],
  CHARGE_NURSE: ['CAUTI', 'CLABSI', 'VAP', 'SSI'],
  INFECTION_CONTROL_NURSE: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO'],
  LABORATORY_TECHNICIAN: ['MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  VIEWER: []
}

// Department-specific form access
const DEPARTMENT_FORM_PERMISSIONS: Record<DepartmentType, FormType[]> = {
  ICU: ['CAUTI', 'CLABSI', 'VAP', 'HAP', 'MDRO'],
  NICU: ['CLABSI', 'VAP', 'MDRO'],
  PICU: ['CAUTI', 'CLABSI', 'VAP', 'MDRO'],
  CCU: ['CAUTI', 'CLABSI', 'VAP', 'MDRO'],
  GENERAL_SURGERY: ['SSI', 'CAUTI', 'MDRO'],
  ORTHOPEDIC: ['SSI', 'CAUTI', 'MDRO'],
  CARDIAC_SURGERY: ['SSI', 'CAUTI', 'CLABSI', 'MDRO'],
  NEUROSURGERY: ['SSI', 'CAUTI', 'MDRO'],
  OBSTETRICS_GYNECOLOGY: ['SSI', 'CAUTI', 'MDRO'],
  PEDIATRICS: ['CAUTI', 'MDRO'],
  INTERNAL_MEDICINE: ['CAUTI', 'MDRO'],
  EMERGENCY: ['CAUTI', 'MDRO'],
  DIALYSIS: ['CLABSI', 'MDRO'],
  ONCOLOGY: ['CAUTI', 'CLABSI', 'MDRO'],
  BURNS_UNIT: ['SSI', 'CAUTI', 'MDRO'],
  LABORATORY: ['MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL'],
  RADIOLOGY: ['MDRO'],
  PHARMACY: ['MDRO'],
  IPC_COMMITTEE: ['CAUTI', 'CLABSI', 'SSI', 'VAP', 'HAP', 'MDRO', 'C_DIFF', 'MRSA', 'VRE', 'ESBL']
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // Fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !profile) {
        return null
      }

      return profile
    } catch (err) {
      return null
    }
  }

  // Initialize auth state with better session management
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current session with retry logic
      let session = null
      let retryCount = 0
      const maxRetries = 3

      while (!session && retryCount < maxRetries) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          retryCount++
          if (retryCount >= maxRetries) {
            setError('Failed to verify session')
            return
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        session = currentSession
        break
      }

      if (session?.user) {
        // Fetch user profile
        const userProfile = await fetchUserProfile(session.user.id)
        
        if (userProfile) {
          setUser(session.user)
          setProfile(userProfile)
        } else {
          // Profile not found or inactive - don't sign out immediately, just set error
          setUser(session.user)
          setProfile(null)
          setError('User profile not found or inactive. Please contact administrator.')
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      setError('Failed to initialize authentication')
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  // Refresh user profile
  const refreshProfile = async (): Promise<void> => {
    if (!user) return

    try {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
      
      if (!userProfile) {
        setError('User profile not found or inactive')
      }
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError('Failed to refresh user profile')
    }
  }

  // Enhanced sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Clear local state first for immediate UI feedback
      setUser(null)
      setProfile(null)
      setError(null)

      // Then perform actual sign out
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out locally, faster than 'global'
      })
      
      if (error) {
        console.error('Sign out error:', error)
        // Don't show error to user since state is already cleared
      }

      // Navigate to login
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
      // Even if sign out fails, redirect to login since state is cleared
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Permission helper functions
  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role
  }

  const hasDepartmentAccess = (department: DepartmentType): boolean => {
    return profile?.department === department || hasRole('ADMIN') || hasRole('IPC_FOCAL')
  }

  const canAccessForm = (formType: FormType): boolean => {
    if (!profile) return false

    // Admin and IPC roles have full access
    if (hasRole('ADMIN') || hasRole('IPC_FOCAL') || hasRole('IPC_OFFICER')) {
      return true
    }

    // Check role-based permissions
    const rolePermissions = ROLE_FORM_PERMISSIONS[profile.role] || []
    const hasRolePermission = rolePermissions.includes(formType)

    // Check department-based permissions
    const departmentPermissions = DEPARTMENT_FORM_PERMISSIONS[profile.department] || []
    const hasDepartmentPermission = departmentPermissions.includes(formType)

    return hasRolePermission && hasDepartmentPermission
  }

  // Role shortcuts
  const isAdmin = hasRole('ADMIN')
  const isIpcFocal = hasRole('IPC_FOCAL')
  const isIpcOfficer = hasRole('IPC_OFFICER')

  // User info helpers
  const userName = profile?.full_name || user?.email || 'Unknown User'
  const userDepartment = profile?.department || ''
  const userRole = profile?.role || ''
  const departmentDisplayName = profile ? DEPARTMENT_DISPLAY_NAMES[profile.department] : ''
  const roleDisplayName = profile ? ROLE_DISPLAY_NAMES[profile.role] : ''

  // Set up auth state listener and initialization
  useEffect(() => {
    if (!initialized) {
      initializeAuth()
    }

    // Set up auth state listener with improved handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialized) return // Don't process events until initialized

        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          setUser(session.user)
          setProfile(userProfile)
          setError(null)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setError(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
          // Don't refetch profile on token refresh to avoid unnecessary calls
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initializeAuth, initialized])

  const value: AuthContextType = {
    // State
    user,
    profile,
    loading,
    error,
    
    // Actions
    signOut,
    refreshProfile,
    
    // Permissions
    hasRole,
    hasDepartmentAccess,
    canAccessForm,
    isAdmin,
    isIpcFocal,
    isIpcOfficer,
    
    // User Info
    userName,
    userDepartment,
    userRole,
    departmentDisplayName,
    roleDisplayName
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode
  requireRole?: UserRole
  requireDepartment?: DepartmentType
  fallback?: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  requireDepartment,
  fallback
}) => {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#10ac84'}}></div>
      </div>
    )
  }

  if (!user || !profile) {
    return fallback || null
  }

  // Check role requirement
  if (requireRole && profile.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Check department requirement
  if (requireDepartment && profile.department !== requireDepartment && !profile.role.includes('ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to {DEPARTMENT_DISPLAY_NAMES[requireDepartment]} staff.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider