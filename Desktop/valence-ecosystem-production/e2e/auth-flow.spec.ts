import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in form with all fields', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Check for all form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('text=/Sign in with Google/i')).toBeVisible();
    
    // Check for forgot password link
    await expect(page.locator('text=/Forgot password/i')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click sign in without filling form
    await page.click('button:has-text("Sign In")');
    
    // Should show validation errors
    await expect(page.locator('text=/required/i')).toBeVisible();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click on sign up link
    await page.click('text=/Sign up/i');
    await page.waitForURL('/auth/sign-up');
    
    // Should show sign up form
    await expect(page.locator('input[placeholder*="Full Name"]')).toBeVisible();
    
    // Navigate back to sign in
    await page.click('text=/Sign in/i');
    await page.waitForURL('/auth/sign-in');
  });

  test('should display password reset form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Click forgot password
    await page.click('text=/Forgot password/i');
    await page.waitForURL('/auth/forgot-password');
    
    // Check for reset form
    await expect(page.locator('text=/Reset Password/i')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Email")')).toBeVisible();
  });

  test('should handle form input correctly', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Fill in email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Fill in password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('testpassword123');
    await expect(passwordInput).toHaveValue('testpassword123');
  });
});