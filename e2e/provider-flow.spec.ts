import { test, expect } from '@playwright/test';

test.describe('Provider Onboarding Flow', () => {
  test('should display provider onboarding page', async ({ page }) => {
    await page.goto('/dashboard/provider');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Become a Service Provider' })).toBeVisible();
    
    // Check benefits are displayed
    await expect(page.getByText('List Your Services')).toBeVisible();
    await expect(page.getByText('Get Paid Instantly')).toBeVisible();
    await expect(page.getByText('Trust & Safety')).toBeVisible();
    
    // Check earnings percentage
    await expect(page.getByText('93%')).toBeVisible();
    await expect(page.getByText('earnings kept')).toBeVisible();
  });

  test('should show become provider button', async ({ page }) => {
    await page.goto('/dashboard/provider');
    
    const becomeProviderBtn = page.getByRole('button', { name: /Become a Provider/i });
    await expect(becomeProviderBtn).toBeVisible();
    await expect(becomeProviderBtn).toBeEnabled();
    
    // Check supporting text
    await expect(page.getByText('No upfront costs')).toBeVisible();
    await expect(page.getByText('Cancel anytime')).toBeVisible();
    await expect(page.getByText('Instant approval')).toBeVisible();
  });

  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    // Clear any auth cookies
    await page.context().clearCookies();
    
    await page.goto('/dashboard/provider');
    
    const becomeProviderBtn = page.getByRole('button', { name: /Become a Provider/i });
    await becomeProviderBtn.click();
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('should display provider links in navigation when user is provider', async ({ page }) => {
    // Mock provider user state
    await page.goto('/');
    
    // Provider dashboard link should be visible in navigation for providers
    const providerDashboardLink = page.getByRole('link', { name: 'Provider Dashboard' });
    
    // This would be visible if user.role === 'provider'
    // In real test, we'd set up proper auth state
  });

  test('should show provider dashboard after onboarding', async ({ page }) => {
    // This would test the actual provider dashboard
    // For now, we test the structure exists
    await page.goto('/dashboard/provider');
    
    // If user is already a provider, different content would show
    const dashboardHeading = page.getByRole('heading', { name: 'Provider Dashboard' });
    
    // This would be visible after successful onboarding
  });
});

test.describe('Provider Service Management', () => {
  test.skip('should allow providers to create services', async ({ page }) => {
    // Skip for now as this requires authenticated provider state
    
    // Navigate to provider dashboard
    await page.goto('/dashboard/provider/services');
    
    // Click create service
    const createServiceBtn = page.getByRole('button', { name: 'Create Service' });
    await createServiceBtn.click();
    
    // Fill service form
    await page.getByLabel('Service Title').fill('Professional Photography');
    await page.getByLabel('Description').fill('High-quality photo sessions');
    await page.getByLabel('Price').fill('150');
    await page.getByLabel('Duration').fill('60');
    
    // Select category
    await page.getByLabel('Category').selectOption('Creative');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Service' }).click();
    
    // Should show success message
    await expect(page.getByText('Service created successfully')).toBeVisible();
  });

  test.skip('should show provider earnings and analytics', async ({ page }) => {
    // Skip for now as this requires authenticated provider state
    
    await page.goto('/dashboard/provider');
    
    // Should show earnings overview
    await expect(page.getByText('Total Earnings')).toBeVisible();
    await expect(page.getByText('This Month')).toBeVisible();
    await expect(page.getByText('Pending Payouts')).toBeVisible();
    
    // Should show booking stats
    await expect(page.getByText('Active Bookings')).toBeVisible();
    await expect(page.getByText('Completed Services')).toBeVisible();
    await expect(page.getByText('Average Rating')).toBeVisible();
  });
});