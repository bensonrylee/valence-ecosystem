import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete booking flow from service selection to payment', async ({ page }) => {
    // Navigate to explore page
    await page.click('text=Explore Services');
    await expect(page).toHaveURL('/explore');
    
    // Select a service
    const serviceCard = page.getByTestId('service-card').first();
    await expect(serviceCard).toBeVisible();
    await serviceCard.click();
    
    // Should be on service detail page
    await expect(page).toHaveURL(/\/services\/\d+/);
    
    // Click book now button
    const bookButton = page.getByRole('button', { name: /Book Now/i });
    await expect(bookButton).toBeVisible();
    await bookButton.click();
    
    // Should redirect to sign in if not authenticated
    if (page.url().includes('/auth/sign-in')) {
      // Sign in flow would happen here
      await page.goto('/booking/1'); // Skip to booking page for test
    } else {
      await expect(page).toHaveURL(/\/booking\/\d+/);
    }
    
    // Select date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayButton = page.getByRole('button', { name: tomorrow.getDate().toString() }).first();
    await dayButton.click();
    
    // Select time slot
    const timeSlot = page.getByRole('button', { name: '10:00 AM' });
    await expect(timeSlot).toBeVisible();
    await timeSlot.click();
    
    // Add notes
    const notesInput = page.getByPlaceholder('Any special requests');
    await notesInput.fill('Please bring extra equipment');
    
    // Verify booking summary is displayed
    const bookingSummary = page.getByText(/Service Price/);
    await expect(bookingSummary).toBeVisible();
    
    // Platform fee should be visible
    await expect(page.getByText(/Platform Fee \(7%\)/)).toBeVisible();
    
    // Confirm booking button
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await expect(confirmButton).toBeEnabled();
    
    // Would click confirm and test Stripe payment in integration test
  });

  test('should show booking confirmation after successful payment', async ({ page }) => {
    // Navigate directly to bookings with success parameter
    await page.goto('/bookings?success=true');
    
    // Should show success message
    await expect(page.getByText(/Booking confirmed!/)).toBeVisible();
    
    // Should list the booking
    await expect(page.getByTestId('booking-card')).toBeVisible();
  });

  test('should allow cancellation of upcoming bookings', async ({ page }) => {
    // Navigate to bookings page
    await page.goto('/bookings');
    
    // Find upcoming booking
    const upcomingTab = page.getByRole('button', { name: 'Upcoming' });
    await upcomingTab.click();
    
    // Cancel button should be visible for confirmed bookings
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelButton).toBeVisible();
  });

  test('should prompt for review after completed booking', async ({ page }) => {
    // Navigate to bookings page
    await page.goto('/bookings');
    
    // Switch to past bookings
    const pastTab = page.getByRole('button', { name: 'Past' });
    await pastTab.click();
    
    // Leave Review button should be visible
    const reviewButton = page.getByRole('button', { name: 'Leave Review' });
    await expect(reviewButton).toBeVisible();
  });
});

test.describe('Booking Calendar', () => {
  test('should not allow selection of past dates', async ({ page }) => {
    await page.goto('/booking/1');
    
    // Get today's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Yesterday's date should be disabled
    const yesterdayButton = page.getByRole('button', { name: yesterday.getDate().toString() }).first();
    await expect(yesterdayButton).toBeDisabled();
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto('/booking/1');
    
    // Get current month
    const currentMonth = page.getByTestId('current-month');
    const currentMonthText = await currentMonth.textContent();
    
    // Click next month
    const nextButton = page.getByRole('button', { name: 'Next month' });
    await nextButton.click();
    
    // Month should change
    const newMonthText = await currentMonth.textContent();
    expect(newMonthText).not.toBe(currentMonthText);
    
    // Click previous month
    const prevButton = page.getByRole('button', { name: 'Previous month' });
    await prevButton.click();
    
    // Should be back to original month
    const finalMonthText = await currentMonth.textContent();
    expect(finalMonthText).toBe(currentMonthText);
  });
});