// src/lib/supabase.ts
// Supabase client configuration for HMH IPC Platform

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId?: string) => {
  try {
    const user = userId || (await getCurrentUser())?.id
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return false
  }
  return true
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}

export default supabase