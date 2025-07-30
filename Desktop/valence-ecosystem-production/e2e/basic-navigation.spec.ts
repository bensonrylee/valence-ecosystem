import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Valence Ecosystem/);
    
    // Check for main hero section
    const hero = page.locator('text=/Find & Book Premium Services/i');
    await expect(hero).toBeVisible();
  });

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/');
    
    // Click on explore link
    await page.click('text=/Explore/i');
    
    // Wait for explore page to load
    await page.waitForURL('/explore');
    
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should navigate to auth pages', async ({ page }) => {
    await page.goto('/');
    
    // Click on Sign In button
    await page.click('text=/Sign In/i');
    
    // Should redirect to auth/sign-in
    await page.waitForURL('/auth/sign-in');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Navigate to sign up
    await page.click('text=/Sign up/i');
    await page.waitForURL('/auth/sign-up');
    
    // Check for sign up form
    const nameInput = page.locator('input[placeholder*="Full Name"]');
    await expect(nameInput).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Desktop navigation should be visible
    const desktopNav = page.locator('nav').first();
    await expect(desktopNav).toBeVisible();
  });
});