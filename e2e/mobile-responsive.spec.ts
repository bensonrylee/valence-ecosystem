import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('should display mobile navigation menu', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      // Mobile menu button should be visible
      const menuButton = page.getByRole('button', { name: /menu/i });
      await expect(menuButton).toBeVisible();
      
      // Desktop navigation should be hidden
      const desktopNav = page.locator('.hidden.md\\:flex');
      await expect(desktopNav).toBeHidden();
    } else {
      // Desktop navigation should be visible
      const desktopNav = page.locator('.hidden.md\\:flex');
      await expect(desktopNav).toBeVisible();
    }
  });

  test('should open mobile menu drawer', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/');
    
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Mobile menu should slide in
    await expect(page.locator('.md\\:hidden.py-4')).toBeVisible();
    
    // Should show navigation links
    await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bookings' })).toBeVisible();
  });

  test('should stack service cards vertically on mobile', async ({ page, viewport }) => {
    await page.goto('/explore');
    
    // Service grid should be single column on mobile
    const serviceGrid = page.locator('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
    await expect(serviceGrid).toBeVisible();
    
    // On mobile viewports, cards should stack
    if (viewport && viewport.width < 768) {
      const cards = page.getByTestId('service-card');
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      if (await secondCard.isVisible()) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        // Second card should be below first card
        expect(secondBox?.y).toBeGreaterThan(firstBox?.y || 0);
      }
    }
  });

  test('should show mobile-optimized booking calendar', async ({ page }) => {
    await page.goto('/booking/1');
    
    // Calendar should be visible
    const calendar = page.locator('.grid.grid-cols-7');
    await expect(calendar).toBeVisible();
    
    // Time slots should be visible
    const timeSlots = page.locator('.grid.grid-cols-2.sm\\:grid-cols-3');
    await expect(timeSlots).toBeVisible();
  });

  test('should have touch-friendly button sizes', async ({ page, isMobile }) => {
    await page.goto('/');
    
    // Primary CTA buttons should be large enough for touch
    const ctaButton = page.getByRole('button', { name: /Get Started/i }).first();
    const box = await ctaButton.boundingBox();
    
    if (isMobile && box) {
      // Minimum touch target size is 44x44 pixels
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('should handle mobile filters in explore page', async ({ page, viewport }) => {
    await page.goto('/explore');
    
    // Check if it's actually mobile viewport
    if (viewport && viewport.width < 1024) {
      // Mobile filter button should be visible
      const mobileFilterBtn = page.getByTestId('mobile-filter-button');
      await expect(mobileFilterBtn).toBeVisible();
      
      // Desktop sidebar should be hidden
      const sidebar = page.locator('aside.lg\\:w-64');
      await expect(sidebar).toBeHidden();
    }
  });

  test('should have proper tap targets for interactive elements', async ({ page }) => {
    await page.goto('/explore');
    
    // All clickable elements should have adequate spacing
    const links = page.locator('a');
    
    // Check first few links
    for (let i = 0; i < Math.min(await links.count(), 3); i++) {
      const link = links.nth(i);
      const box = await link.boundingBox();
      
      if (box) {
        // Verify minimum dimensions for touch
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('should display tablet-optimized layout', async ({ page, viewport }) => {
    await page.goto('/explore');
    
    // Should show appropriate columns based on viewport
    const serviceGrid = page.locator('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
    await expect(serviceGrid).toBeVisible();
    
    // Navigation visibility depends on viewport
    const desktopNav = page.locator('.hidden.md\\:flex');
    
    if (viewport && viewport.width >= 768) {
      await expect(desktopNav).toBeVisible();
    }
  });
});

test.describe('Performance', () => {
  test('should load quickly on simulated slow network', async ({ page }) => {
    // Skip this test in CI to avoid flakiness
    if (process.env.CI) {
      test.skip();
    }

    // Simulate slow 3G
    await page.route('**/*', async route => {
      // Skip delay for critical resources
      const url = route.request().url();
      if (url.includes('.js') || url.includes('.css')) {
        await route.continue();
      } else {
        await new Promise(resolve => setTimeout(resolve, 50));
        await route.continue();
      }
    });
    
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should be interactive within 10 seconds even on slow network
    expect(loadTime).toBeLessThan(10000);
    
    // Critical content should be visible
    await expect(page.getByTestId('hero-title')).toBeVisible();
  });
});