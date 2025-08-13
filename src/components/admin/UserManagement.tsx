// src/components/admin/UserManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Key, 
  Search,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Link,
  UserPlus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  UserProfile, 
  UserProfileInsert, 
  DepartmentType, 
  UserRole,
  DEPARTMENT_DISPLAY_NAMES,
  ROLE_DISPLAY_NAMES 
} from '@/types/database'

interface UserManagementProps {
  className?: string
}

export default function UserManagement({ className = '' }: UserManagementProps) {
  // Auth context
  const { isAdmin, profile: currentProfile, refreshProfile } = useAuth()

  // State management
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentType | ''>('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<UserProfileInsert>>({
    email: '',
    full_name: '',
    employee_id: '',
    phone: '',
    department: 'ICU',
    role: 'STAFF_NURSE',
    is_active: true
  })

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Create new user (creates both auth + profile)
  const createUser = async () => {
    if (!formData.email || !formData.full_name || !formData.department || !formData.role) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setActionLoading('create')
      setError(null)
      setSuccess(null)

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'TempPass123!', // Temporary password - user should reset
        options: {
          data: {
            full_name: formData.full_name
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create user profile
      const profileData: UserProfileInsert = {
        user_id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name,
        employee_id: formData.employee_id,
        phone: formData.phone,
        department: formData.department as DepartmentType,
        role: formData.role as UserRole,
        is_active: formData.is_active
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])

      if (profileError) {
        // If profile creation fails, should clean up auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      // Refresh users list
      await fetchUsers()

      // Reset form and close modal
      setFormData({
        email: '',
        full_name: '',
        employee_id: '',
        phone: '',
        department: 'ICU',
        role: 'STAFF_NURSE',
        is_active: true
      })
      setShowCreateModal(false)

      setSuccess(`User ${formData.full_name} created successfully! Temporary password: TempPass123!`)

    } catch (err) {
      console.error('Error creating user:', err)
      const error = err as Error
      setError(error.message || 'Failed to create user')
    } finally {
      setActionLoading(null)
    }
  }

  // Update existing user (handles both profile + auth)
  const updateUser = async () => {
    if (!editingUser || !formData.email || !formData.full_name || !formData.department || !formData.role) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setActionLoading('update')
      setError(null)
      setSuccess(null)

      const emailChanged = editingUser.email !== formData.email
      const isCurrentUser = editingUser.id === currentProfile?.id

      // Update profile in database
      const updateData: Partial<UserProfile> = {
        email: formData.email,
        full_name: formData.full_name,
        employee_id: formData.employee_id,
        phone: formData.phone,
        department: formData.department as DepartmentType,
        role: formData.role as UserRole,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', editingUser.id)

      if (profileError) {
        throw profileError
      }

      // If user has auth account and email changed, update auth email too
      if (editingUser.user_id && emailChanged) {
        try {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            editingUser.user_id,
            { email: formData.email }
          )
          
          if (authError) {
            console.warn('Failed to update auth email:', authError)
            setSuccess(`Profile updated successfully, but email change in auth failed. User can still login with old email.`)
          } else {
            setSuccess(`User updated successfully! ${emailChanged ? 'Email updated in both profile and auth system.' : ''}`)
          }
        } catch (authErr) {
          console.warn('Auth update failed:', authErr)
          setSuccess(`Profile updated successfully, but auth email update failed.`)
        }
      } else {
        setSuccess(`User updated successfully!`)
      }

      // Refresh users list
      await fetchUsers()
      
      // If current user updated themselves, refresh their profile
      if (isCurrentUser) {
        await refreshProfile()
      }

      setEditingUser(null)
      setFormData({
        email: '',
        full_name: '',
        employee_id: '',
        phone: '',
        department: 'ICU',
        role: 'STAFF_NURSE',
        is_active: true
      })

    } catch (err) {
      console.error('Error updating user:', err)
      const error = err as Error
      setError(error.message || 'Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete user (handles both profile + auth if exists)
  const deleteUser = async (userId: string, userName: string, authUserId: string | null) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(`delete-${userId}`)
      setError(null)
      setSuccess(null)

      // Delete profile first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

      // Delete auth user if exists
      if (authUserId) {
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(authUserId)
          if (authError) {
            console.warn('Failed to delete auth user:', authError)
          }
        } catch (authErr) {
          console.warn('Auth deletion failed:', authErr)
        }
      }

      setSuccess(`User ${userName} deleted successfully!`)
      await fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      const error = err as Error
      setError(error.message || 'Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  // Reset user password (only for users with auth accounts)
  const resetPassword = async (email: string, userName: string, authUserId: string | null) => {
    if (!authUserId) {
      setError(`Cannot reset password for ${userName} - no auth account linked. This user needs to be recreated.`)
      return
    }

    if (!confirm(`Send password reset email to ${userName} (${email})?`)) {
      return
    }

    try {
      setActionLoading(`reset-${email}`)
      setError(null)
      setSuccess(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        throw error
      }

      setSuccess(`Password reset email sent to ${email}`)
    } catch (err) {
      console.error('Error resetting password:', err)
      const error = err as Error
      setError(error.message || 'Failed to send password reset email')
    } finally {
      setActionLoading(null)
    }
  }

  // Create auth account for existing profile (migration helper)
  const createAuthForProfile = async (user: UserProfile) => {
    if (!confirm(`Create auth account for ${user.full_name}? This will allow them to login.`)) {
      return
    }

    try {
      setActionLoading(`create-auth-${user.id}`)
      setError(null)
      setSuccess(null)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: 'TempPass123!',
        options: {
          data: {
            full_name: user.full_name
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create auth account')
      }

      // Update profile with auth user_id
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          user_id: authData.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        // Clean up auth user if profile update fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw updateError
      }

      setSuccess(`Auth account created for ${user.full_name}! Temporary password: TempPass123!`)
      await fetchUsers()

    } catch (err) {
      console.error('Error creating auth account:', err)
      const error = err as Error
      setError(error.message || 'Failed to create auth account')
    } finally {
      setActionLoading(null)
    }
  }

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(`toggle-${userId}`)
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      await fetchUsers()
    } catch (err) {
      console.error('Error toggling user status:', err)
      const error = err as Error
      setError(error.message || 'Failed to update user status')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle edit user
  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name,
      employee_id: user.employee_id,
      phone: user.phone,
      department: user.department,
      role: user.role,
      is_active: user.is_active
    })
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDepartment = !departmentFilter || user.department === departmentFilter
    const matchesRole = !roleFilter || user.role === roleFilter

    return matchesSearch && matchesDepartment && matchesRole
  })

  // User statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    ipcFocal: users.filter(u => u.role === 'IPC_FOCAL').length,
    ipcOfficers: users.filter(u => u.role === 'IPC_OFFICER').length,
    withAuth: users.filter(u => u.user_id).length,
    withoutAuth: users.filter(u => !u.user_id).length
  }

  // Load users on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Check admin access - this must come after all hooks
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#10ac84'}}></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage hospital staff accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-white rounded-md font-medium flex items-center"
          style={{backgroundColor: '#10ac84'}}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-800">{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="text-sm text-green-600 hover:text-green-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3" style={{color: '#10ac84'}} />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <X className="w-6 h-6 mr-3 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Shield className="w-6 h-6 mr-3 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-xl font-bold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">IPC Focal</p>
              <p className="text-xl font-bold text-gray-900">{stats.ipcFocal}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">IPC Officers</p>
              <p className="text-xl font-bold text-gray-900">{stats.ipcOfficers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Link className="w-6 h-6 mr-3 text-teal-600" />
            <div>
              <p className="text-sm text-gray-600">With Auth</p>
              <p className="text-xl font-bold text-gray-900">{stats.withAuth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 mr-3 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Need Auth</p>
              <p className="text-xl font-bold text-gray-900">{stats.withoutAuth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Alert for users without auth */}
      {stats.withoutAuth > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Migration Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.withoutAuth} users don&apos;t have auth accounts and cannot login. Use the &quot;Create Auth&quot; button to fix this.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as DepartmentType | '')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
            >
              <option value="">All Departments</option>
              {Object.entries(DEPARTMENT_DISPLAY_NAMES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
            >
              <option value="">All Roles</option>
              {Object.entries(ROLE_DISPLAY_NAMES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.employee_id && (
                        <div className="text-xs text-gray-400">ID: {user.employee_id}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'IPC_FOCAL' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'IPC_OFFICER' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ROLE_DISPLAY_NAMES[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {DEPARTMENT_DISPLAY_NAMES[user.department]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active || false)}
                      disabled={actionLoading === `toggle-${user.id}` || user.id === currentProfile?.id}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${user.id === currentProfile?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {actionLoading === `toggle-${user.id}` ? '...' : user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_id ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Linked
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        No Auth
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {user.user_id ? (
                        <button
                          onClick={() => resetPassword(user.email, user.full_name, user.user_id)}
                          disabled={actionLoading === `reset-${user.email}`}
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => createAuthForProfile(user)}
                          disabled={actionLoading === `create-auth-${user.id}`}
                          className="text-teal-600 hover:text-teal-800 disabled:opacity-50"
                          title="Create Auth Account"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      
                      {user.id !== currentProfile?.id && (
                        <button
                          onClick={() => deleteUser(user.id, user.full_name, user.user_id)}
                          disabled={actionLoading === `delete-${user.id}`}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id || ''}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value as DepartmentType})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                    required
                  >
                    {Object.entries(DEPARTMENT_DISPLAY_NAMES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                    required
                  >
                    {Object.entries(ROLE_DISPLAY_NAMES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                    style={{'--tw-ring-color': '#10ac84'} as React.CSSProperties}
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active User
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingUser(null)
                    setFormData({
                      email: '',
                      full_name: '',
                      employee_id: '',
                      phone: '',
                      department: 'ICU',
                      role: 'STAFF_NURSE',
                      is_active: true
                    })
                    setError(null)
                    setSuccess(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? updateUser : createUser}
                  disabled={actionLoading === 'create' || actionLoading === 'update'}
                  className="px-4 py-2 text-white rounded-md font-medium flex items-center disabled:opacity-50"
                  style={{backgroundColor: '#10ac84'}}
                >
                  {(actionLoading === 'create' || actionLoading === 'update') && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <Save className="w-4 h-4 mr-2" />
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}