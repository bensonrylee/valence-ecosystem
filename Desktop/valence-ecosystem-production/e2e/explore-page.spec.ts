import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore');
  });

  test('should display search and filter options', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Check for filter button
    const filterButton = page.locator('button:has-text("Filter")');
    await expect(filterButton).toBeVisible();
    
    // Check for category filters
    const categorySection = page.locator('text=/Categories/i');
    await expect(categorySection).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Type in search
    await searchInput.fill('yoga');
    await searchInput.press('Enter');
    
    // Wait for search to complete
    await page.waitForTimeout(1000);
    
    // Check that URL updated with search query
    const url = page.url();
    expect(url).toContain('search');
  });

  test('should display service cards', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-card"], .glass-card', { 
      state: 'visible',
      timeout: 10000 
    });
    
    // Check for service cards
    const serviceCards = page.locator('[data-testid="service-card"], .glass-card');
    const count = await serviceCards.count();
    
    // Should have at least one service card
    expect(count).toBeGreaterThan(0);
  });

  test('should handle empty search results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Search for something unlikely to exist
    await searchInput.fill('xyzabc123notfound');
    await searchInput.press('Enter');
    
    // Wait for search to complete
    await page.waitForTimeout(1000);
    
    // Should show no results message or empty state
    const noResults = page.locator('text=/No services found|No results/i');
    const hasNoResults = await noResults.count() > 0;
    
    // Or check if no service cards are shown
    const serviceCards = page.locator('[data-testid="service-card"], .glass-card');
    const cardCount = await serviceCards.count();
    
    expect(hasNoResults || cardCount === 0).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Category filters might be in a drawer/modal on mobile
    const filterButton = page.locator('button:has-text("Filter")');
    await expect(filterButton).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Categories should be visible in sidebar on desktop
    const categorySidebar = page.locator('aside, [role="complementary"]').first();
    const isSidebarVisible = await categorySidebar.isVisible();
    
    // Either sidebar is visible or filter button is visible
    expect(isSidebarVisible || await filterButton.isVisible()).toBeTruthy();
  });
});