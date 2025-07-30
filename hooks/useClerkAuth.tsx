'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { clerkAuthService, UserProfile } from '@/lib/clerk-auth-service';

export function useAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async () => {
      if (!isClerkLoaded) return;

      if (clerkUser && isSignedIn) {
        try {
          // Sync profile with Supabase
          const profile = await clerkAuthService.syncUserProfile(clerkUser);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    };

    syncProfile();
  }, [clerkUser, isClerkLoaded, isSignedIn]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!clerkUser) return { data: null, error: 'No user logged in' };
    
    const result = await clerkAuthService.updateUserProfile(clerkUser.id, updates);
    if (result.data) {
      setUserProfile(result.data as UserProfile);
    }
    return result;
  };

  const switchRole = async (role: 'customer' | 'provider') => {
    if (!clerkUser) return { data: null, error: 'No user logged in' };
    
    const result = await clerkAuthService.switchUserRole(clerkUser.id, role);
    if (result.data) {
      setUserProfile(result.data as UserProfile);
    }
    return result;
  };

  return {
    user: userProfile,
    clerkUser,
    loading,
    isSignedIn,
    signOut,
    updateProfile,
    switchRole,
    isProvider: userProfile?.role === 'provider',
    isAdmin: userProfile?.role === 'admin',
  };
}