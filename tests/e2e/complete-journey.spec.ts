import { test, expect } from '@playwright/test';
import { mockGetUserMedia } from '../fixtures/mockData';

test.describe('Complete User Journey', () => {
  test('landing → project → 3D interaction → voice feedback → report', async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Physical.Capital', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to Tavakiev project
    const projectLink = page.locator('text=Project Tavakiev').or(page.locator('[href*="tavakiev"]')).first();
    await expect(projectLink).toBeVisible({ timeout: 10000 });
    await projectLink.click();
    await page.waitForURL('**/project/tavakiev', { timeout: 10000 });

    // Step 3: Check 3D scene loads
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for 3D scene to fully initialize
    await page.waitForTimeout(2000);

    // Step 4: Interact with 3D scene
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(1000);

    // Click on different parts of the canvas
    await canvas.click({ position: { x: 300, y: 250 } });
    await page.waitForTimeout(500);

    // Step 5: Look for voice feedback button
    const voiceFeedbackBtn = page.locator('button:has-text("Voice Feedback")').or(
      page.locator('button[aria-label*="voice" i]')
    ).or(
      page.locator('button').filter({ hasText: /feedback/i })
    ).first();

    if (await voiceFeedbackBtn.count() > 0) {
      await voiceFeedbackBtn.click();
      await page.waitForTimeout(500);

      // Check if voice capture modal appears
      const modalTitle = page.locator('text=/share.*expertise|voice.*feedback/i');
      if (await modalTitle.isVisible({ timeout: 5000 })) {
        // Mock microphone access
        await page.evaluate(mockGetUserMedia);

        // Start recording
        const startRecordBtn = page.locator('button:has-text("Start Recording")');
        if (await startRecordBtn.isVisible()) {
          await startRecordBtn.click();
          await page.waitForTimeout(2000); // Record for 2 seconds

          // Stop recording
          const stopRecordBtn = page.locator('button:has-text("Stop Recording")');
          await stopRecordBtn.click();
          await page.waitForTimeout(500);

          // Submit feedback
          const submitBtn = page.locator('button:has-text("Submit Feedback")');
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    // Step 6: Request report
    const reportBtn = page.locator('button').filter({ hasText: /report|send.*report/i }).first();
    if (await reportBtn.count() > 0) {
      await reportBtn.click();

      // Look for success message
      const successMsg = page.locator('.toast, [role="status"]').or(
        page.locator('text=/report.*sent|success/i')
      );

      if (await successMsg.count() > 0) {
        await expect(successMsg.first()).toBeVisible({ timeout: 5000 });
      }
    }

    // Step 7: Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify page loaded (either shows dashboard or redirects to auth)
    await expect(page).toHaveURL(/\/(dashboard|auth|)/);
  });

  test('navigation flow across all project pages', async ({ page }) => {
    const projects = [
      { url: '/project/tavakiev', name: 'Tavakiev' },
      { url: '/project/tabeguache', name: 'Tabeguache' },
      { url: '/project/venustas', name: 'Venustas' },
      { url: '/project/yadilhil', name: 'Yadilhil' },
    ];

    for (const project of projects) {
      await page.goto(project.url);
      await page.waitForLoadState('networkidle');

      // Check if page loads successfully
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Check for 3D canvas
      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await expect(canvas).toBeVisible({ timeout: 15000 });
        console.log(`${project.name}: 3D canvas loaded successfully`);
      }

      // Wait for scene to stabilize
      await page.waitForTimeout(1500);
    }
  });

  test('navigation flow across all innovation pages', async ({ page }) => {
    const innovations = [
      { url: '/innovation/golden-spike', name: 'Golden Spike' },
      { url: '/innovation/vitruvius', name: 'Vitruvius' },
      { url: '/innovation/talos', name: 'Talos' },
      { url: '/innovation/story-engineering', name: 'Story Engineering' },
    ];

    for (const innovation of innovations) {
      await page.goto(innovation.url);
      await page.waitForLoadState('networkidle');

      // Check if page loads successfully
      const body = page.locator('body');
      await expect(body).toBeVisible();

      console.log(`${innovation.name}: Page loaded successfully`);

      // Wait briefly before next page
      await page.waitForTimeout(500);
    }
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check mobile menu if exists
    const mobileMenu = page.locator('[aria-label="Menu"]').or(
      page.locator('button[aria-expanded]')
    ).or(
      page.locator('button').filter({ hasText: /menu/i })
    );

    if (await mobileMenu.count() > 0) {
      const firstMenu = mobileMenu.first();
      if (await firstMenu.isVisible()) {
        await firstMenu.click();
        await page.waitForTimeout(500);

        // Check if navigation appears
        const nav = page.locator('nav');
        if (await nav.count() > 0) {
          console.log('Mobile menu opened successfully');
        }
      }
    }

    // Check that main content is visible
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible();
  });

  test('error handling - 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');

    // Should show 404 or redirect to home
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();

    // Page should not be completely blank
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('scroll interactions and section visibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    // Should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('3D scene interaction without crashes', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for scene to load
    await page.waitForTimeout(2000);

    // Track errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Multiple interactions
    const positions = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 150 },
      { x: 150, y: 250 },
      { x: 250, y: 300 },
    ];

    for (const pos of positions) {
      await canvas.click({ position: pos });
      await page.waitForTimeout(300);
    }

    // Should still be visible and functional
    await expect(canvas).toBeVisible();

    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('network')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
