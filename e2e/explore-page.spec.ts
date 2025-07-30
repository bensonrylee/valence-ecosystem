import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore');
  });

  test('should display search and filter options', async ({ page }) => {
    // Check for search input
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    
    // Check for categories section
    const categoriesHeading = page.getByRole('heading', { name: 'Categories' });
    await expect(categoriesHeading).toBeVisible();
    
    // Check for category buttons
    await expect(page.getByTestId('category-all')).toBeVisible();
    await expect(page.getByTestId('category-wellness')).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    // Type in search
    await searchInput.fill('yoga');
    await searchInput.press('Enter');
    
    // Wait for search to complete (loading state)
    await page.waitForTimeout(1000);
    
    // Should show filtered results or no results message
    const serviceCards = page.getByTestId('service-card');
    const noResults = page.getByTestId('no-results');
    
    const hasCards = await serviceCards.count() > 0;
    const hasNoResults = await noResults.isVisible();
    
    expect(hasCards || hasNoResults).toBeTruthy();
  });

  test('should display service cards', async ({ page }) => {
    // Wait for services to load (there might be loading skeletons first)
    await page.waitForTimeout(1000);
    
    // Check for service cards or loading skeletons
    const serviceCards = page.getByTestId('service-card');
    const skeletons = page.getByTestId('service-skeleton');
    
    const cardCount = await serviceCards.count();
    const skeletonCount = await skeletons.count();
    
    // Should have either service cards or loading skeletons
    expect(cardCount + skeletonCount).toBeGreaterThan(0);
  });

  test('should filter by category', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Click on a specific category
    await page.getByTestId('category-wellness').click();
    
    // Wait for filtering
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    const serviceCards = page.getByTestId('service-card');
    const noResults = page.getByTestId('no-results');
    
    const hasCards = await serviceCards.count() > 0;
    const hasNoResults = await noResults.isVisible();
    
    expect(hasCards || hasNoResults).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile filter button should be visible
    const mobileFilterButton = page.getByTestId('mobile-filter-button');
    await expect(mobileFilterButton).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Categories sidebar should be visible on desktop
    const categoriesHeading = page.getByRole('heading', { name: 'Categories' });
    await expect(categoriesHeading).toBeVisible();
  });
});