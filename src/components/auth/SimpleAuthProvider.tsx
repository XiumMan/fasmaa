// src/components/auth/SimpleAuthProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, UserRole, DepartmentType, FormType } from '@/types/database'

// Simple Auth Context
interface SimpleAuthContextType {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
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

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

// Hard-coded users for testing
const TEST_USERS = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    profile: {
      id: 'test-admin-1',
      user_id: 'test-admin-1',
      email: 'admin@test.com',
      full_name: 'System Administrator',
      employee_id: 'ADMIN001',
      role: 'ADMIN' as UserRole,
      department: 'IPC_COMMITTEE' as DepartmentType,
      is_active: true,
      phone: '+960-123-4567',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    email: 'ipc@test.com',
    password: 'ipc123',
    profile: {
      id: 'test-ipc-1',
      user_id: 'test-ipc-1',
      email: 'ipc@test.com',
      full_name: 'IPC Focal Person',
      employee_id: 'IPC001',
      role: 'IPC_FOCAL' as UserRole,
      department: 'IPC_COMMITTEE' as DepartmentType,
      is_active: true,
      phone: '+960-123-4568',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    email: 'nurse@test.com',
    password: 'nurse123',
    profile: {
      id: 'test-nurse-1',
      user_id: 'test-nurse-1',
      email: 'nurse@test.com',
      full_name: 'ICU Head Nurse',
      employee_id: 'NURSE001',
      role: 'CHARGE_NURSE' as UserRole,
      department: 'ICU' as DepartmentType,
      is_active: true,
      phone: '+960-123-4569',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

// Display mappings
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

// Form permissions
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

interface SimpleAuthProviderProps {
  children: ReactNode
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize auth from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('simple_auth')
    if (savedAuth) {
      try {
        const { user: savedUser, profile: savedProfile } = JSON.parse(savedAuth)
        setUser(savedUser)
        setProfile(savedProfile)
      } catch (error) {
        localStorage.removeItem('simple_auth')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Find matching user
      const testUser = TEST_USERS.find(u => u.email === email && u.password === password)

      if (!testUser) {
        setError('Invalid email or password')
        setLoading(false)
        return false
      }

      const mockUser = {
        id: testUser.profile.user_id,
        email: testUser.email,
        email_confirmed_at: new Date().toISOString()
      }

      // Save to state
      setUser(mockUser)
      setProfile(testUser.profile)

      // Save to localStorage
      localStorage.setItem('simple_auth', JSON.stringify({
        user: mockUser,
        profile: testUser.profile
      }))

      setLoading(false)
      return true

    } catch (err) {
      setError('Login failed')
      setLoading(false)
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    setUser(null)
    setProfile(null)
    setError(null)
    localStorage.removeItem('simple_auth')
    router.push('/login')
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
    return rolePermissions.includes(formType)
  }

  const isAdmin = hasRole(UserRole.ADMIN)
  const isIpcFocal = hasRole(UserRole.IPC_FOCAL)
  const isIpcOfficer = hasRole(UserRole.IPC_OFFICER)

  const userName = profile?.full_name || user?.email || 'Unknown User'
  const userDepartment = profile?.department || ''
  const userRole = profile?.role || ''
  const departmentDisplayName = profile ? DEPARTMENT_DISPLAY_NAMES[profile.department] : ''
  const roleDisplayName = profile ? ROLE_DISPLAY_NAMES[profile.role] : ''

  const value: SimpleAuthContextType = {
    user,
    profile,
    loading,
    error,
    signOut,
    login,
    hasRole,
    hasDepartmentAccess,
    canAccessForm,
    isAdmin,
    isIpcFocal,
    isIpcOfficer,
    userName,
    userDepartment,
    userRole,
    departmentDisplayName,
    roleDisplayName
  }

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}

export default SimpleAuthProvider