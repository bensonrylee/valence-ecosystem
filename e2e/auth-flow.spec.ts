import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in form with all fields', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Check for all form elements using test IDs
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('sign-in-button')).toBeVisible();
    await expect(page.getByTestId('google-sign-in-button')).toBeVisible();
    
    // Check for forgot password link
    await expect(page.getByTestId('forgot-password-link')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click sign in without filling form
    await page.getByTestId('sign-in-button').click();
    
    // Should show validation errors
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click on sign up link
    await page.getByTestId('sign-up-link').click();
    await page.waitForURL('/auth/sign-up');
    
    // Should show sign up form
    await expect(page.getByTestId('full-name-input')).toBeVisible();
    
    // Navigate back to sign in
    await page.getByTestId('sign-in-link').click();
    await page.waitForURL('/auth/sign-in');
  });

  test('should display password reset form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click forgot password
    await page.getByTestId('forgot-password-link').click();
    await page.waitForURL('/auth/forgot-password');
    
    // Check for reset form
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByTestId('reset-email-input')).toBeVisible();
    await expect(page.getByTestId('send-reset-email-button')).toBeVisible();
  });

  test('should handle form input correctly', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Fill in email
    const emailInput = page.getByTestId('email-input');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Fill in password
    const passwordInput = page.getByTestId('password-input');
    await passwordInput.fill('testpassword123');
    await expect(passwordInput).toHaveValue('testpassword123');
  });
});