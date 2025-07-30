import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Here you would update your database to mark the booking as confirmed
        // and handle any post-payment logic
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        
        // Here you would update your database to mark the booking as failed
        break;

      case 'charge.captured':
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge captured:', charge.id);
        
        // Here you would transfer funds to the provider after capturing
        // (minus platform fee) and mark the service as completed
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        console.log('Connect account updated:', account.id);
        
        // Here you would update the provider's account status in your database
        break;

      case 'transfer.created':
        const transfer = event.data.object as Stripe.Transfer;
        console.log('Transfer created:', transfer.id);
        
        // Here you would log the transfer for accounting purposes
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