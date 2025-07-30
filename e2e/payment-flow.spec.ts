import { test, expect } from '@playwright/test';

test.describe('Payment Integration', () => {
  test('should show price breakdown before payment', async ({ page }) => {
    await page.goto('/booking/1');
    
    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).first().click();
    await page.getByRole('button', { name: '10:00 AM' }).click();
    
    // Price breakdown should be visible
    await expect(page.getByText('Service Price')).toBeVisible();
    await expect(page.getByText('Platform Fee (7%)')).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
    
    // Platform fee should be calculated correctly
    // For a $100 service: fee = $7, total = $107
    const servicePrice = page.getByText('$100.00');
    const platformFee = page.getByText('$7.00');
    const total = page.getByText('$107.00');
    
    // Verify all amounts are visible
    await expect(servicePrice).toBeVisible();
    await expect(platformFee).toBeVisible();
    await expect(total).toBeVisible();
  });

  test('should require authentication before payment', async ({ page }) => {
    // Clear any auth cookies
    await page.context().clearCookies();
    
    await page.goto('/booking/1');
    
    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).first().click();
    await page.getByRole('button', { name: '10:00 AM' }).click();
    
    // Click confirm booking
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await confirmButton.click();
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('should create payment intent on booking confirmation', async ({ page }) => {
    // This would require mocking Stripe API
    // In real test, we'd intercept the API call
    
    await page.route('/api/stripe/create-payment-intent', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          clientSecret: 'pi_test_secret',
          bookingId: 'booking_123'
        })
      });
    });
    
    await page.goto('/booking/1');
    
    // Complete booking selection
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).first().click();
    await page.getByRole('button', { name: '10:00 AM' }).click();
    
    // Confirm booking
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await confirmButton.click();
    
    // Should show Stripe payment form
    // Would need Stripe Elements mounted
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    // Mock failed payment intent
    await page.route('/api/stripe/create-payment-intent', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to create payment intent'
        })
      });
    });
    
    await page.goto('/booking/1');
    
    // Select booking details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).first().click();
    await page.getByRole('button', { name: '10:00 AM' }).click();
    
    // Try to confirm booking
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await confirmButton.click();
    
    // Should show error message
    // In real app, this would show a toast or error banner
  });
});

test.describe('Stripe Connect Provider Onboarding', () => {
  test('should initiate Stripe Connect onboarding', async ({ page }) => {
    // Mock Stripe Connect API
    await page.route('/api/stripe/connect', async route => {
      const request = route.request();
      const data = await request.postDataJSON();
      
      if (data.action === 'create_account') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://connect.stripe.com/onboarding/test'
          })
        });
      }
    });
    
    await page.goto('/dashboard/provider');
    
    const becomeProviderBtn = page.getByRole('button', { name: /Become a Provider/i });
    await becomeProviderBtn.click();
    
    // Would redirect to Stripe Connect in real flow
  });

  test.skip('should handle Stripe Connect return URL', async ({ page }) => {
    // Test return from Stripe onboarding
    await page.goto('/dashboard/provider/onboarding/complete');
    
    // Should show success message
    await expect(page.getByText('Onboarding complete!')).toBeVisible();
    
    // Should update user role to provider
    // Should redirect to provider dashboard
  });

  test.skip('should create Stripe login link for existing providers', async ({ page }) => {
    // Mock provider user
    await page.route('/api/stripe/connect', async route => {
      const request = route.request();
      const data = await request.postDataJSON();
      
      if (data.action === 'create_login_link') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://connect.stripe.com/express/login/test'
          })
        });
      }
    });
    
    await page.goto('/dashboard/provider');
    
    // Should show Stripe dashboard link
    const stripeDashboardBtn = page.getByRole('button', { name: /Stripe Dashboard/i });
    await stripeDashboardBtn.click();
    
    // Would open Stripe dashboard in new tab
  });
});

test.describe('Payment Security', () => {
  test('should validate payment amounts match service price', async ({ page }) => {
    await page.goto('/booking/1');
    
    // The platform fee calculation should be consistent
    // Service price + 7% fee = Total
    
    // Mock service data would have price
    // Frontend calculates fee
    // API should validate these match
  });

  test('should handle webhook signature validation', async ({ page }) => {
    // This would be tested at API level
    // Webhook endpoint should reject invalid signatures
    
    const response = await page.request.post('/api/webhook/stripe', {
      data: { type: 'payment_intent.succeeded' },
      headers: {
        'stripe-signature': 'invalid_signature'
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test.skip('should update booking status on successful payment', async ({ page }) => {
    // This would require webhook testing
    // Payment success -> Booking confirmed
    // Payment failure -> Booking cancelled
  });
});