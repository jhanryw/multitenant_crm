'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string
  name?: string
  email?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const profileOperations = {
    async load(userId: string) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (!error) setUserProfile(data)
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },
    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    },
  }

  const authStateHandlers = {
    onChange: (_event: string | null, session: Session | null) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) profileOperations.load(session.user.id)
      else profileOperations.clear()
    },
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      authStateHandlers.onChange(null, session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(authStateHandlers.onChange)

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      return { data, error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        profileOperations.clear()
      }
      return { error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (!error) setUserProfile(data)
      return { data, error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
