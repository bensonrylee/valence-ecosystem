import { currentUser } from '@clerk/nextjs/server';
import { clerkAuthService } from './clerk-auth-service';

export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) return null;

  // Get or create user profile in Supabase
  const userProfile = await clerkAuthService.getCurrentUserServer(user.id);
  return userProfile;
}