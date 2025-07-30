import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import { bookingsService } from '@/lib/supabase/services';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update booking status to confirmed
        await bookingsService.updateBookingStatus(
          paymentIntent.metadata.bookingId,
          'confirmed',
          {
            stripe_payment_intent_id: paymentIntent.id,
          }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update booking status to cancelled
        await bookingsService.updateBookingStatus(
          failedPayment.metadata.bookingId,
          'cancelled'
        );
        break;

      case 'charge.captured':
        const charge = event.data.object as Stripe.Charge;
        
        // Transfer funds to provider after capturing (minus platform fee)
        const transferAmount = charge.amount - Math.round(parseFloat(charge.metadata.platformFee) * 100);
        
        const transfer = await stripe.transfers.create({
          amount: transferAmount,
          currency: 'usd',
          destination: charge.metadata.providerStripeAccountId,
          transfer_group: charge.payment_intent as string,
        });

        // Update booking with transfer ID
        await bookingsService.updateBookingStatus(
          charge.metadata.bookingId,
          'completed',
          {
            stripe_transfer_id: transfer.id,
          }
        );
        break;

      case 'account.updated':
        // Handle Connect account updates
        const account = event.data.object as Stripe.Account;
        console.log('Connect account updated:', account.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}