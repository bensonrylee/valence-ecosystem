import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Valence Ecosystem/);
    
    // Check for main hero section
    const hero = page.getByTestId('hero-title');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Find & Book Premium Services');
  });

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/');
    
    // Click on explore link in navigation (use first one)
    await page.getByRole('link', { name: 'Explore' }).first().click();
    
    // Wait for explore page to load
    await page.waitForURL('/explore');
    
    // Check for search input
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
  });

  test('should navigate to auth pages', async ({ page }) => {
    await page.goto('/');
    
    // Click on Sign In link
    await page.getByTestId('sign-in-link').click();
    
    // Should redirect to auth/sign-in
    await page.waitForURL('/auth/sign-in');
    
    // Check for email input
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toBeVisible();
    
    // Navigate to sign up
    await page.getByTestId('sign-up-link').click();
    await page.waitForURL('/auth/sign-up');
    
    // Check for sign up form
    const nameInput = page.getByTestId('full-name-input');
    await expect(nameInput).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button is visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Desktop navigation should be visible
    const exploreLink = page.getByRole('link', { name: 'Explore' }).first();
    await expect(exploreLink).toBeVisible();
  });
});