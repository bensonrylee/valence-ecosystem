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

    const body = await req.json();
    const { serviceId, providerId, startTime, endTime, price, notes } = body;

    // Validate required fields
    if (!serviceId || !providerId || !startTime || !endTime || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate platform fee (7%)
    const platformFee = Math.round(price * 0.07 * 100) / 100;
    const totalAmount = price + platformFee;

    // Create payment intent with manual capture for escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      capture_method: 'manual', // Hold funds until service completion
      metadata: {
        serviceId,
        providerId,
        customerId: userId,
        platformFee: platformFee.toString(),
        bookingStartTime: startTime,
        bookingEndTime: endTime,
      },
    });

    // In a real app, you would also create a booking record in your database here
    // For now, we'll just return the payment intent

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}