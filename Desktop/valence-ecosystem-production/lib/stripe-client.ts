import Stripe from 'stripe';

// Initialize Stripe with best practices
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
  appInfo: {
    name: 'Valence Ecosystem',
    version: '1.0.0',
    url: 'https://valence-ecosystem.com',
  },
});

// Helper functions for common operations
export const stripeHelpers = {
  /**
   * Create a checkout session with proper error handling
   */
  async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    try {
      return await stripe.checkout.sessions.create(params);
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  /**
   * Retrieve account with error handling
   */
  async retrieveAccount(accountId: string) {
    try {
      return await stripe.accounts.retrieve(accountId);
    } catch (error) {
      console.error('Stripe account retrieval error:', error);
      throw new Error('Failed to retrieve account');
    }
  },

  /**
   * Create account link for onboarding
   */
  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    try {
      return await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
    } catch (error) {
      console.error('Stripe account link error:', error);
      throw new Error('Failed to create account link');
    }
  },

  /**
   * Process refund with metadata
   */
  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    try {
      return await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as Stripe.RefundCreateParams.Reason,
        metadata: {
          processed_at: new Date().toISOString(),
          platform: 'ecosystem',
        },
      });
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error('Failed to process refund');
    }
  },

  /**
   * Get balance for connected account
   */
  async getAccountBalance(accountId: string) {
    try {
      return await stripe.balance.retrieve({
        stripeAccount: accountId,
      });
    } catch (error) {
      console.error('Stripe balance retrieval error:', error);
      throw new Error('Failed to retrieve balance');
    }
  },

  /**
   * List payouts for connected account
   */
  async listPayouts(accountId: string, limit: number = 10) {
    try {
      return await stripe.payouts.list(
        { limit },
        { stripeAccount: accountId }
      );
    } catch (error) {
      console.error('Stripe payouts list error:', error);
      throw new Error('Failed to list payouts');
    }
  },

  /**
   * Create transfer to connected account
   */
  async createTransfer(amount: number, destination: string, transferGroup?: string) {
    try {
      return await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination,
        transfer_group: transferGroup,
        metadata: {
          platform: 'ecosystem',
          created_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Stripe transfer error:', error);
      throw new Error('Failed to create transfer');
    }
  },
};

// Error type guards
export function isStripeError(error: any): error is Stripe.errors.StripeError {
  return error?.type?.includes('Stripe');
}

export function getStripeErrorMessage(error: any): string {
  if (isStripeError(error)) {
    return error.message;
  }
  return 'An unexpected error occurred';
}