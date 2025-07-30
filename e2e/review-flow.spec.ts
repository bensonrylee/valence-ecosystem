import { test, expect } from '@playwright/test';

test.describe('Review System', () => {
  test('should show review section on service detail page', async ({ page }) => {
    await page.goto('/services/1');
    
    // Review section should be visible
    const reviewSection = page.getByRole('heading', { name: 'Reviews' });
    await expect(reviewSection).toBeVisible();
    
    // Should show review cards
    const reviewCards = page.locator('.border-b.border-gray-800');
    await expect(reviewCards.first()).toBeVisible();
    
    // Review should have rating stars
    const stars = page.locator('.text-yellow-400').first();
    await expect(stars).toBeVisible();
    
    // Review should have customer name and date
    await expect(page.getByText(/Customer \d/)).toBeVisible();
    await expect(page.getByText(/days ago/)).toBeVisible();
  });

  test('should show leave review button for completed bookings', async ({ page }) => {
    await page.goto('/bookings');
    
    // Switch to past bookings
    const pastTab = page.getByRole('button', { name: 'Past' });
    await pastTab.click();
    
    // Should show leave review button
    const reviewButton = page.getByRole('button', { name: 'Leave Review' });
    await expect(reviewButton).toBeVisible();
  });

  test.skip('should display review form when clicking leave review', async ({ page }) => {
    // This would open the review modal/page
    await page.goto('/bookings');
    
    const pastTab = page.getByRole('button', { name: 'Past' });
    await pastTab.click();
    
    const reviewButton = page.getByRole('button', { name: 'Leave Review' });
    await reviewButton.click();
    
    // Review form should appear
    await expect(page.getByText('How was your experience?')).toBeVisible();
    
    // Should show service and provider info
    await expect(page.getByText(/with/)).toBeVisible();
    
    // Should show star rating selector
    const starButtons = page.locator('button svg.w-10.h-10');
    await expect(starButtons).toHaveCount(5);
  });

  test.skip('should allow star rating selection', async ({ page }) => {
    // Navigate to review form
    await page.goto('/review/booking-id');
    
    // Click 4 stars
    const fourthStar = page.locator('button svg.w-10.h-10').nth(3);
    await fourthStar.click();
    
    // Should show "Very Good" label
    await expect(page.getByText('Very Good')).toBeVisible();
    
    // First 4 stars should be filled
    const filledStars = page.locator('svg.fill-\\[\\#00FFAD\\]');
    await expect(filledStars).toHaveCount(4);
  });

  test.skip('should allow writing review comment', async ({ page }) => {
    await page.goto('/review/booking-id');
    
    // Select rating first
    const fifthStar = page.locator('button svg.w-10.h-10').nth(4);
    await fifthStar.click();
    
    // Write comment
    const commentBox = page.getByPlaceholder('What did you like or dislike about this service?');
    await commentBox.fill('Excellent service! The provider was very professional and delivered exactly what was promised.');
    
    // Character count should update
    await expect(page.getByText('89/500')).toBeVisible();
  });

  test.skip('should show referral prompt for 5-star reviews', async ({ page }) => {
    await page.goto('/review/booking-id');
    
    // Select 5 stars
    const fifthStar = page.locator('button svg.w-10.h-10').nth(4);
    await fifthStar.click();
    
    // Referral prompt should appear
    const referralPrompt = page.getByText('Glad you had a great experience! Would you like to refer a friend?');
    await expect(referralPrompt).toBeVisible();
    
    // Should have celebration emoji
    await expect(page.getByText('🎉')).toBeVisible();
  });

  test.skip('should allow image upload in reviews', async ({ page }) => {
    await page.goto('/review/booking-id');
    
    // Upload button should be visible
    const uploadLabel = page.locator('label.w-20.h-20.border-dashed');
    await expect(uploadLabel).toBeVisible();
    
    // Should have camera icon
    const cameraIcon = uploadLabel.locator('svg');
    await expect(cameraIcon).toBeVisible();
    
    // File input should be hidden but present
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeHidden();
    await expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  test.skip('should submit review successfully', async ({ page }) => {
    await page.goto('/review/booking-id');
    
    // Select rating
    const fourthStar = page.locator('button svg.w-10.h-10').nth(3);
    await fourthStar.click();
    
    // Add comment
    const commentBox = page.getByPlaceholder('What did you like or dislike about this service?');
    await commentBox.fill('Great service!');
    
    // Submit button should be enabled
    const submitButton = page.getByRole('button', { name: 'Submit Review' });
    await expect(submitButton).toBeEnabled();
    
    // Click submit
    await submitButton.click();
    
    // Would redirect to bookings or show success message
  });

  test.skip('should allow skipping review', async ({ page }) => {
    await page.goto('/review/booking-id');
    
    // Skip button should be visible
    const skipButton = page.getByRole('button', { name: 'Skip' });
    await expect(skipButton).toBeVisible();
    
    await skipButton.click();
    
    // Should close review form or redirect
  });
});

test.describe('Review Display', () => {
  test('should show average rating on service page', async ({ page }) => {
    await page.goto('/services/1');
    
    // Should show rating with star
    const ratingDisplay = page.locator('.flex.items-center.gap-1').first();
    await expect(ratingDisplay).toBeVisible();
    
    // Should show number of reviews
    await expect(page.getByText(/reviews\)/)).toBeVisible();
  });

  test('should show provider rating in search results', async ({ page }) => {
    await page.goto('/explore');
    
    // Each service card should show rating
    const serviceCard = page.getByTestId('service-card').first();
    const rating = serviceCard.locator('.text-yellow-400');
    await expect(rating).toBeVisible();
    
    // Should show review count
    const reviewCount = serviceCard.locator('.text-gray-400.text-sm.ml-1');
    await expect(reviewCount).toBeVisible();
  });
});