import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, email, name } = await req.json();

    if (action === 'create_account') {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/providers/${userId}`,
          mcc: '7299', // Miscellaneous personal services
        },
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/provider/onboarding`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/provider/onboarding/complete`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ 
        accountId: account.id,
        onboardingUrl: accountLink.url 
      });
    }

    if (action === 'create_login_link') {
      const { accountId } = await req.json();
      
      if (!accountId) {
        return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
      }

      const loginLink = await stripe.accounts.createLoginLink(accountId);
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