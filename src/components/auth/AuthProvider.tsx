// src/components/auth/AuthProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserRole, DepartmentType, FormType } from '@/types/database'

// Auth Context Types
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (role: UserRole) => boolean
  hasDepartmentAccess: (department: DepartmentType) => boolean
  canAccessForm: (formType: FormType) => boolean
  isAdmin: boolean
  isIpcFocal: boolean
  isIpcOfficer: boolean
  userName: string
  userDepartment: string
  userRole: string
  departmentDisplayName: string
  roleDisplayName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Display name mappings (no changes needed here)
const DEPARTMENT_DISPLAY_NAMES: Record<DepartmentType, string> = {
  [DepartmentType.ICU]: 'Intensive Care Unit',
  [DepartmentType.NICU]: 'Neonatal ICU',
  [DepartmentType.PICU]: 'Pediatric ICU',
  [DepartmentType.CCU]: 'Cardiac Care Unit',
  [DepartmentType.GENERAL_SURGERY]: 'General Surgery',
  [DepartmentType.ORTHOPEDIC]: 'Orthopedic',
  [DepartmentType.CARDIAC_SURGERY]: 'Cardiac Surgery',
  [DepartmentType.NEUROSURGERY]: 'Neurosurgery',
  [DepartmentType.OBSTETRICS_GYNECOLOGY]: 'Obstetrics & Gynecology',
  [DepartmentType.PEDIATRICS]: 'Pediatrics',
  [DepartmentType.INTERNAL_MEDICINE]: 'Internal Medicine',
  [DepartmentType.EMERGENCY]: 'Emergency Department',
  [DepartmentType.DIALYSIS]: 'Dialysis Unit',
  [DepartmentType.ONCOLOGY]: 'Oncology',
  [DepartmentType.BURNS_UNIT]: 'Burns Unit',
  [DepartmentType.LABORATORY]: 'Laboratory',
  [DepartmentType.RADIOLOGY]: 'Radiology',
  [DepartmentType.PHARMACY]: 'Pharmacy',
  [DepartmentType.IPC_COMMITTEE]: 'IPC Committee'
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.IPC_FOCAL]: 'IPC Focal Person',
  [UserRole.IPC_OFFICER]: 'IPC Officer',
  [UserRole.IPC_COMMITTEE]: 'IPC Committee Member',
  [UserRole.DEPARTMENT_HEAD]: 'Department Head',
  [UserRole.CONSULTANT]: 'Consultant',
  [UserRole.MEDICAL_OFFICER]: 'Medical Officer',
  [UserRole.STAFF_NURSE]: 'Staff Nurse',
  [UserRole.CHARGE_NURSE]: 'Charge Nurse',
  [UserRole.INFECTION_CONTROL_NURSE]: 'Infection Control Nurse',
  [UserRole.LABORATORY_TECHNICIAN]: 'Laboratory Technician',
  [UserRole.VIEWER]: 'Viewer'
}

// FIX: Updated this entire object to use UserRole and FormType enums instead of strings
const ROLE_FORM_PERMISSIONS: Record<UserRole, FormType[]> = {
  [UserRole.ADMIN]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [UserRole.IPC_FOCAL]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [UserRole.IPC_OFFICER]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [UserRole.IPC_COMMITTEE]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [UserRole.DEPARTMENT_HEAD]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO],
  [UserRole.CONSULTANT]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO],
  [UserRole.MEDICAL_OFFICER]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.MDRO],
  [UserRole.STAFF_NURSE]: [FormType.CAUTI, FormType.CLABSI, FormType.VAP],
  [UserRole.CHARGE_NURSE]: [FormType.CAUTI, FormType.CLABSI, FormType.VAP, FormType.SSI],
  [UserRole.INFECTION_CONTROL_NURSE]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO],
  [UserRole.LABORATORY_TECHNICIAN]: [FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [UserRole.VIEWER]: []
}

// FIX: Updated this entire object to use DepartmentType and FormType enums instead of strings
const DEPARTMENT_FORM_PERMISSIONS: Record<DepartmentType, FormType[]> = {
  [DepartmentType.ICU]: [FormType.CAUTI, FormType.CLABSI, FormType.VAP, FormType.HAP, FormType.MDRO],
  [DepartmentType.NICU]: [FormType.CLABSI, FormType.VAP, FormType.MDRO],
  [DepartmentType.PICU]: [FormType.CAUTI, FormType.CLABSI, FormType.VAP, FormType.MDRO],
  [DepartmentType.CCU]: [FormType.CAUTI, FormType.CLABSI, FormType.VAP, FormType.MDRO],
  [DepartmentType.GENERAL_SURGERY]: [FormType.SSI, FormType.CAUTI, FormType.MDRO],
  [DepartmentType.ORTHOPEDIC]: [FormType.SSI, FormType.CAUTI, FormType.MDRO],
  [DepartmentType.CARDIAC_SURGERY]: [FormType.SSI, FormType.CAUTI, FormType.CLABSI, FormType.MDRO],
  [DepartmentType.NEUROSURGERY]: [FormType.SSI, FormType.CAUTI, FormType.MDRO],
  [DepartmentType.OBSTETRICS_GYNECOLOGY]: [FormType.SSI, FormType.CAUTI, FormType.MDRO],
  [DepartmentType.PEDIATRICS]: [FormType.CAUTI, FormType.MDRO],
  [DepartmentType.INTERNAL_MEDICINE]: [FormType.CAUTI, FormType.MDRO],
  [DepartmentType.EMERGENCY]: [FormType.CAUTI, FormType.MDRO],
  [DepartmentType.DIALYSIS]: [FormType.CLABSI, FormType.MDRO],
  [DepartmentType.ONCOLOGY]: [FormType.CAUTI, FormType.CLABSI, FormType.MDRO],
  [DepartmentType.BURNS_UNIT]: [FormType.SSI, FormType.CAUTI, FormType.MDRO],
  [DepartmentType.LABORATORY]: [FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL],
  [DepartmentType.RADIOLOGY]: [FormType.MDRO],
  [DepartmentType.PHARMACY]: [FormType.MDRO],
  [DepartmentType.IPC_COMMITTEE]: [FormType.CAUTI, FormType.CLABSI, FormType.SSI, FormType.VAP, FormType.HAP, FormType.MDRO, FormType.C_DIFF, FormType.MRSA, FormType.VRE, FormType.ESBL]
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).eq('is_active', true).single()
      if (error || !profile) return null
      return profile
    } catch (err) {
      return null
    }
  }

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id)
        if (userProfile) {
          setUser(currentSession.user)
          setProfile(userProfile)
        } else {
          setUser(currentSession.user)
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

  const refreshProfile = async (): Promise<void> => {
    if (!user) return
    try {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
      if (!userProfile) setError('User profile not found or inactive')
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError('Failed to refresh user profile')
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      setUser(null)
      setProfile(null)
      setError(null)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (role: UserRole): boolean => profile?.role === role

  const hasDepartmentAccess = (department: DepartmentType): boolean => {
    return profile?.department === department || hasRole(UserRole.ADMIN) || hasRole(UserRole.IPC_FOCAL)
  }

  const canAccessForm = (formType: FormType): boolean => {
    if (!profile) return false
    if (hasRole(UserRole.ADMIN) || hasRole(UserRole.IPC_FOCAL) || hasRole(UserRole.IPC_OFFICER)) {
      return true
    }
    const rolePermissions = ROLE_FORM_PERMISSIONS[profile.role] || []
    const hasRolePermission = rolePermissions.includes(formType)
    const departmentPermissions = DEPARTMENT_FORM_PERMISSIONS[profile.department] || []
    const hasDepartmentPermission = departmentPermissions.includes(formType)
    return hasRolePermission && hasDepartmentPermission
  }

  // FIX: Use enums for role shortcuts
  const isAdmin = hasRole(UserRole.ADMIN)
  const isIpcFocal = hasRole(UserRole.IPC_FOCAL)
  const isIpcOfficer = hasRole(UserRole.IPC_OFFICER)

  const userName = profile?.full_name || user?.email || 'Unknown User'
  const userDepartment = profile?.department || ''
  const userRole = profile?.role || ''
  const departmentDisplayName = profile ? DEPARTMENT_DISPLAY_NAMES[profile.department] : ''
  const roleDisplayName = profile ? ROLE_DISPLAY_NAMES[profile.role] : ''

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initialized) return
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
      }
    })
    return () => subscription.unsubscribe()
  }, [initializeAuth, initialized])

  const value: AuthContextType = { user, profile, loading, error, signOut, refreshProfile, hasRole, hasDepartmentAccess, canAccessForm, isAdmin, isIpcFocal, isIpcOfficer, userName, userDepartment, userRole, departmentDisplayName, roleDisplayName }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole, requireDepartment, fallback }) => {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#10ac84'}}></div></div>
  }

  if (!user || !profile) return fallback || null

  if (requireRole && profile.role !== requireRole) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1><p className="text-gray-600">You don&apos;t have permission to access this page.</p></div></div>
  }

  // FIX: Use enum for role check
  if (requireDepartment && profile.department !== requireDepartment && profile.role !== UserRole.ADMIN) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1><p className="text-gray-600">This page is restricted to {DEPARTMENT_DISPLAY_NAMES[requireDepartment]} staff.</p></div></div>
  }

  return <>{children}</>
}

export default AuthProvider

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
  requireDepartment?: DepartmentType;
  fallback?: ReactNode;
}