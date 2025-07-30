import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/config';
import { clerkAuthService } from '@/lib/clerk-auth-service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_account') {
      // Get user profile
      const userProfile = await clerkAuthService.getUserProfile(userId);
      if (!userProfile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: userProfile.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/providers/${userId}`,
          mcc: '7299', // Miscellaneous personal services
        },
      });

      // Update user profile with Stripe account ID
      await clerkAuthService.updateUserProfile(userId, {
        role: 'provider',
        provider_profile: {
          stripe_account_id: account.id,
        },
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/onboarding`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/onboarding/complete`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ url: accountLink.url });
    }

    if (action === 'create_login_link') {
      const userProfile = await clerkAuthService.getUserProfile(userId);
      
      if (!userProfile?.provider_profile?.stripe_account_id) {
        return NextResponse.json({ error: 'No Stripe account found' }, { status: 404 });
      }

      const loginLink = await stripe.accounts.createLoginLink(
        userProfile.provider_profile.stripe_account_id
      );

      return NextResponse.json({ url: loginLink.url });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to process Stripe Connect request' },
      { status: 500 }
    );
  }
}