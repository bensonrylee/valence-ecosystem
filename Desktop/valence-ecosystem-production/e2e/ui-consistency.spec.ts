import { test, expect } from '@playwright/test';

test.describe('UI Consistency & Design System', () => {
  test('should maintain consistent dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Check background colors
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be a dark color (rgb values should be low)
    const rgbMatch = backgroundColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      expect(r).toBeLessThan(50);
      expect(g).toBeLessThan(50);
      expect(b).toBeLessThan(50);
    }
  });

  test('should have smooth animations', async ({ page }) => {
    await page.goto('/');
    
    // Check for transition classes
    const animatedElements = await page.locator('[class*="transition"], [class*="animate"]').count();
    expect(animatedElements).toBeGreaterThan(0);
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/explore');
    
    // Check for skeleton loaders or loading indicators
    const hasSkeletons = await page.locator('[class*="skeleton"], [class*="pulse"], [class*="loading"]').count() > 0;
    const hasSpinners = await page.locator('[class*="spinner"], [class*="animate-spin"]').count() > 0;
    
    expect(hasSkeletons || hasSpinners).toBeTruthy();
  });

  test('should have proper glass morphism effects', async ({ page }) => {
    await page.goto('/');
    
    // Check for glass effect classes
    const glassElements = await page.locator('[class*="glass"], [class*="backdrop-blur"]').count();
    expect(glassElements).toBeGreaterThan(0);
  });

  test('should have accessible focus states', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focused element has visible focus indicator
    const focusedElement = page.locator(':focus');
    const hasRing = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow.includes('rgb') || styles.outline !== 'none';
    });
    
    expect(hasRing).toBeTruthy();
  });

  test('should maintain consistent spacing', async ({ page }) => {
    await page.goto('/');
    
    // Check for consistent padding/margin classes
    const spacingElements = await page.locator('[class*="p-"], [class*="m-"], [class*="space-"]').count();
    expect(spacingElements).toBeGreaterThan(0);
  });

  test('should have proper typography hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for different heading sizes
    const h1 = await page.locator('h1').first();
    const h2 = await page.locator('h2').first();
    
    if (await h1.count() > 0 && await h2.count() > 0) {
      const h1Size = await h1.evaluate(el => 
        parseInt(window.getComputedStyle(el).fontSize)
      );
      const h2Size = await h2.evaluate(el => 
        parseInt(window.getComputedStyle(el).fontSize)
      );
      
      expect(h1Size).toBeGreaterThan(h2Size);
    }
  });
});