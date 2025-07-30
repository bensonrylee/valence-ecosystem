import { currentUser, auth } from '@clerk/nextjs/server';
import { useUser, useAuth } from '@clerk/nextjs';

// Server-side auth functions (for API routes and server components)
export async function getCurrentUser() {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getAuth() {
  try {
    const { userId } = await auth();
    return { userId };
  } catch (error) {
    console.error('Error getting auth:', error);
    return { userId: null };
  }
}

// Client-side hooks (for components)
export function useClerkAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useAuth();

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    getToken,
    // Compatibility methods with Firebase pattern
    currentUser: user,
    loading: !isLoaded,
    authenticated: isSignedIn,
  };
}

// Utility functions
export function getUserId(user: any) {
  return user?.id || null;
}

export function getUserEmail(user: any) {
  return user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || null;
}

export function getUserName(user: any) {
  return user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous';
}

export function getUserAvatar(user: any) {
  return user?.imageUrl || user?.profileImageUrl || null;
}