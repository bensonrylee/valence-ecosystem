import { currentUser } from '@clerk/nextjs';
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
      const userProfile: Partial<UserProfile> = {
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        display_name: clerkUser.fullName || clerkUser.username || '',
        image_url: clerkUser.imageUrl,
        email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        phone_number: clerkUser.phoneNumbers[0]?.phoneNumber,
        updated_at: new Date(),
      };

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        return null;
      }

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update(userProfile)
          .eq('clerk_id', clerkUser.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          return null;
        }
        return data as UserProfile;
      } else {
        // Create new user
        const newUserProfile: Partial<UserProfile> = {
          ...userProfile,
          role: 'customer',
          created_at: new Date(),
          settings: {
            notifications: true,
            marketing: true,
            two_factor: false,
          },
        };

        const { data, error } = await supabase
          .from('users')
          .insert(newUserProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          return null;
        }
        return data as UserProfile;
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
      return null;
    }
  }

  // Get user profile by Clerk ID
  async getUserProfile(clerkId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
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
          updated_at: new Date(),
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
      const updates: Partial<UserProfile> = { role };
      
      // If switching to provider, initialize provider profile
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
  async getCurrentUser() {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      // Sync profile and return
      const profile = await this.syncUserProfile(clerkUser);
      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is provider
  async isProvider(clerkId: string): Promise<boolean> {
    const profile = await this.getUserProfile(clerkId);
    return profile?.role === 'provider';
  }

  // Check if user is admin
  async isAdmin(clerkId: string): Promise<boolean> {
    const profile = await this.getUserProfile(clerkId);
    return profile?.role === 'admin';
  }
}

export const clerkAuthService = new ClerkAuthService();
export default clerkAuthService;