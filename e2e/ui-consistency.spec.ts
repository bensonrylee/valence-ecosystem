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
    
    // Check for transition classes on interactive elements
    const buttons = page.locator('button, a[href]').first();
    const hasTransitions = await buttons.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.transition !== 'all 0s ease 0s' && styles.transition !== 'none';
    });
    
    expect(hasTransitions).toBeTruthy();
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/explore');
    
    // Check for skeleton loaders initially
    const skeletons = page.getByTestId('service-skeleton');
    const hasSkeletons = await skeletons.count() > 0;
    
    if (hasSkeletons) {
      // Wait for loading to complete
      await page.waitForTimeout(1000);
      
      // Should show actual content after loading
      const serviceCards = page.getByTestId('service-card');
      const hasCards = await serviceCards.count() > 0;
      
      expect(hasCards).toBeTruthy();
    }
  });

  test('should have proper glass morphism effects', async ({ page }) => {
    await page.goto('/');
    
    // Check for glass effect classes on panels
    const glassPanels = page.locator('.glass-panel, [class*="glass"]');
    const hasGlassEffects = await glassPanels.count() > 0;
    
    if (hasGlassEffects) {
      const firstPanel = glassPanels.first();
      const hasBackdropBlur = await firstPanel.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.backdropFilter.includes('blur') || styles.webkitBackdropFilter.includes('blur');
      });
      
      expect(hasBackdropBlur).toBeTruthy();
    }
  });

  test('should have accessible focus states', async ({ page }) => {
    await page.goto('/');
    
    // Focus on a specific element we know exists
    const signInLink = page.getByTestId('sign-in-link');
    await signInLink.focus();
    
    // Check if focused element has visible focus indicator
    const hasFocusRing = await signInLink.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow.includes('rgb') || 
             styles.outline !== 'none' ||
             styles.ringWidth !== '0px';
    });
    
    expect(hasFocusRing).toBeTruthy();
  });

  test('should maintain consistent spacing', async ({ page }) => {
    await page.goto('/');
    
    // Check for consistent spacing classes
    const elementsWithSpacing = page.locator('[class*="p-"], [class*="m-"], [class*="space-"], [class*="gap-"]');
    const spacingCount = await elementsWithSpacing.count();
    
    expect(spacingCount).toBeGreaterThan(0);
  });

  test('should have proper typography hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for different heading sizes
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();
    
    const h1Exists = await h1.count() > 0;
    const h2Exists = await h2.count() > 0;
    
    if (h1Exists && h2Exists) {
      const h1Size = await h1.evaluate(el => 
        parseInt(window.getComputedStyle(el).fontSize)
      );
      const h2Size = await h2.evaluate(el => 
        parseInt(window.getComputedStyle(el).fontSize)
      );
      
      expect(h1Size).toBeGreaterThan(h2Size);
    } else {
      // At least one heading should exist
      expect(h1Exists || h2Exists).toBeTruthy();
    }
  });
});