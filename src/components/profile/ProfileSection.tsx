// src/components/profile/ProfileSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Building2, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Save,
  AlertCircle,
  CheckCircle,
  Edit,
  Camera
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { DEPARTMENT_DISPLAY_NAMES, ROLE_DISPLAY_NAMES } from '@/types/database'

interface ProfileFormData {
  full_name: string
  email: string
  phone: string
  employee_id: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfileSection() {
  const { user, profile, refreshProfile, userName, roleDisplayName, departmentDisplayName } = useAuth()
  
  // State management
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form data
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    employee_id: ''
  })

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && user) {
      setProfileData({
        full_name: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        employee_id: profile.employee_id || ''
      })
    }
  }, [profile, user])

  // Clear messages when tab changes
  useEffect(() => {
    setSuccess(null)
    setError(null)
  }, [activeTab])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate required fields
      if (!profileData.full_name.trim()) {
        throw new Error('Full name is required')
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim() || null,
          employee_id: profileData.employee_id.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (updateError) {
        throw updateError
      }

      // Update email in auth if changed
      if (profileData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email.trim()
        })

        if (emailError) {
          throw new Error(`Email update failed: ${emailError.message}`)
        }
      }

      // Refresh the profile data
      await refreshProfile()
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate password requirements
      if (!passwordData.currentPassword) {
        throw new Error('Current password is required')
      }

      if (!passwordData.newPassword) {
        throw new Error('New password is required')
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long')
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      if (passwordData.newPassword === passwordData.currentPassword) {
        throw new Error('New password must be different from current password')
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      })

      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) {
        throw updateError
      }

      setSuccess('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      console.error('Password update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (!profile || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* New Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200" />
        <div className="p-6">
          <div className="flex items-end -mt-20">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <button 
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Change profile picture"
              >
                  <Camera className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="ml-5 mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
              <p className="text-gray-600">{roleDisplayName}</p>
              <p className="text-sm text-gray-500">{departmentDisplayName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Change Password
          </button>
        </nav>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleProfileSubmit}>
            {/* Read-only Role and Department Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Role
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {ROLE_DISPLAY_NAMES[profile.role]}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Department
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {DEPARTMENT_DISPLAY_NAMES[profile.department]}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  placeholder="Enter your email"
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Changing email will require verification
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
                  <IdCard className="w-4 h-4 inline mr-2" />
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employee_id"
                  value={profileData.employee_id}
                  onChange={(e) => setProfileData({ ...profileData, employee_id: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  placeholder="Enter your employee ID"
                />
              </div>
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="max-w-md">
            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current_password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new_password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm_password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Different from your current password</li>
                <li>• Recommended: Mix of letters, numbers, and symbols</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}