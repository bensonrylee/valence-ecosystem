import { supabase } from './supabase/config';

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string;
  image_url?: string;
  role: 'customer' | 'provider' | 'admin';
  created_at: Date;
  updated_at: Date;
  email_verified: boolean;
  phone_number?: string;
  bio?: string;
  location?: string;
  settings?: {
    notifications: boolean;
    marketing: boolean;
    two_factor: boolean;
  };
  // Provider-specific fields
  provider_profile?: {
    business_name?: string;
    services?: string[];
    availability?: any;
    rating?: number;
    reviews_count?: number;
    stripe_account_id?: string;
  };
}

class ClerkAuthService {
  // Create or update user profile in Supabase
  async syncUserProfile(clerkUser: any): Promise<UserProfile | null> {
    try {
      const userData = {
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        display_name: clerkUser.fullName || clerkUser.username || 'User',
        image_url: clerkUser.imageUrl,
        email_verified: clerkUser.emailAddresses?.[0]?.verification?.status === 'verified',
        phone_number: clerkUser.phoneNumbers?.[0]?.phoneNumber,
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'clerk_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in syncUserProfile:', error);
      return null;
    }
  }

  // Get user profile from Supabase
  async getUserProfile(clerkId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Get user profile by user ID (not clerk ID)
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile by ID:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfileById:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(clerkId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Switch user role between customer and provider
  async switchUserRole(clerkId: string, role: 'customer' | 'provider') {
    try {
      const updates: Partial<UserProfile> = {
        role,
      };

      // Initialize provider profile if switching to provider
      if (role === 'provider') {
        updates.provider_profile = {
          services: [],
          availability: {},
          rating: 0,
          reviews_count: 0,
        };
      }

      return await this.updateUserProfile(clerkId, updates);
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Get current user from server components
  async getCurrentUserServer(clerkUserId: string) {
    if (!clerkUserId) return null;
    
    try {
      // First check if user exists in Supabase
      const userProfile = await this.getUserProfile(clerkUserId);
      
      if (!userProfile) {
        // User doesn't exist, we need to create them
        // This would typically be done through the webhook
        console.warn('User not found in Supabase, profile sync required');
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export const clerkAuthService = new ClerkAuthService();