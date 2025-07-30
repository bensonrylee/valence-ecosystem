import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/config';
import { bookingsService } from '@/lib/supabase/services';

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
      },
    });

    // Create booking record in database
    const { data: booking, error } = await bookingsService.createBooking({
      service_id: serviceId,
      customer_id: userId,
      provider_id: providerId,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      price,
      platform_fee: platformFee,
      notes,
    });

    if (error) {
      // Cancel payment intent if booking creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Update booking with payment intent ID
    if (booking) {
      await bookingsService.updateBookingStatus(booking.id, 'pending', {
        stripe_payment_intent_id: paymentIntent.id,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking?.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}