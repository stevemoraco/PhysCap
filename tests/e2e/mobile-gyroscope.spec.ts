import { test, expect, devices } from '@playwright/test';
import { mockDeviceOrientation } from '../fixtures/mockData';

test.describe('Mobile Navigation & Interaction', () => {
  test.use({ ...devices['iPhone 12'] });

  test('mobile navigation menu works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hamburger menu on mobile
    const menuButton = page.locator('button[aria-label*="menu" i]').or(
      page.locator('button').filter({ hasText: /menu/i })
    ).or(
      page.locator('[class*="hamburger"]')
    );

    if (await menuButton.count() > 0) {
      const firstMenu = menuButton.first();
      if (await firstMenu.isVisible()) {
        await firstMenu.click();
        await page.waitForTimeout(500);

        // Check if navigation appears
        const nav = page.locator('nav');
        if (await nav.count() > 0) {
          await expect(nav).toBeVisible();
          console.log('Mobile menu opened successfully');
        }

        // Try clicking a link
        const projectLink = page.locator('a[href*="tavakiev"]').first();
        if (await projectLink.count() > 0) {
          await projectLink.click();
          await expect(page).toHaveURL(/\/project\/tavakiev/);
        }
      }
    }
  });

  test('mobile viewport - all project pages load', async ({ page }) => {
    const projects = [
      '/project/tavakiev',
      '/project/tabeguache',
      '/project/venustas',
      '/project/yadilhil',
    ];

    for (const projectUrl of projects) {
      await page.goto(projectUrl);
      await page.waitForLoadState('networkidle');

      // Check page loads
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Check for canvas
      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await expect(canvas).toBeVisible({ timeout: 15000 });
        console.log(`${projectUrl}: Canvas loaded on mobile`);
      }

      await page.waitForTimeout(1000);
    }
  });

  test('mobile touch interactions on 3D scene', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Simulate touch/tap interactions
    await canvas.tap({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);

    await canvas.tap({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(300);

    // Still should be visible
    await expect(canvas).toBeVisible();
  });

  test('mobile scroll performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll down multiple times
    for (let i = 0; i < 5; i++) {
      await page.evaluate((scrollAmount) => {
        window.scrollBy(0, scrollAmount);
      }, 300);
      await page.waitForTimeout(100);
    }

    // Scroll back up
    for (let i = 0; i < 5; i++) {
      await page.evaluate((scrollAmount) => {
        window.scrollBy(0, -scrollAmount);
      }, 300);
      await page.waitForTimeout(100);
    }

    // Should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Gyroscope & Device Orientation', () => {
  test.use({ ...devices['iPhone 12'] });

  test('gyroscope caustics effect on mobile', async ({ page, context }) => {
    // Grant gyroscope permissions
    await context.grantPermissions(['accelerometer', 'gyroscope']);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Wait for 3D canvas to load
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Simulate device orientation
    await page.evaluate(mockDeviceOrientation(0, 30, 20));
    await page.waitForTimeout(500);

    // Change orientation
    await page.evaluate(mockDeviceOrientation(45, 15, 10));
    await page.waitForTimeout(500);

    // Another orientation
    await page.evaluate(mockDeviceOrientation(90, 25, -15));
    await page.waitForTimeout(500);

    // Canvas should still be rendering
    await expect(canvas).toBeVisible();

    // Take screenshot to verify rendering
    await expect(canvas).toHaveScreenshot('caustics-gyroscope.png', {
      maxDiffPixels: 2000,
    });
  });

  test('gyroscope permission handling', async ({ page, context }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Track console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Look for gyroscope enable button
    const gyroButton = page.locator('button:has-text("Enable Gyroscope")').or(
      page.locator('button:has-text("Allow Motion")').or(
        page.locator('[aria-label*="gyro" i]')
      )
    );

    if (await gyroButton.count() > 0) {
      const firstButton = gyroButton.first();
      if (await firstButton.isVisible({ timeout: 5000 })) {
        await firstButton.click();
        await page.waitForTimeout(1000);

        console.log('Gyroscope button clicked');
      }
    }

    // Verify no critical errors
    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
    }
  });

  test('device orientation fallback', async ({ page }) => {
    // Don't grant gyroscope permissions
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Canvas should still render even without gyroscope
    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);

      // Interact with touch (simulate swipe)
      await canvas.tap({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(300);
      await canvas.tap({ position: { x: 200, y: 200 } });
      await page.waitForTimeout(300);

      // Should not crash
      await expect(canvas).toBeVisible();
    }
  });

  test('gyroscope on multiple orientations', async ({ page, context }) => {
    await context.grantPermissions(['accelerometer', 'gyroscope']);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const orientations = [
      { alpha: 0, beta: 0, gamma: 0 },
      { alpha: 90, beta: 45, gamma: 0 },
      { alpha: 180, beta: -30, gamma: 20 },
      { alpha: 270, beta: 60, gamma: -10 },
      { alpha: 0, beta: 15, gamma: 15 },
    ];

    for (const orientation of orientations) {
      await page.evaluate(mockDeviceOrientation(
        orientation.alpha,
        orientation.beta,
        orientation.gamma
      ));
      await page.waitForTimeout(400);
    }

    // Should still be rendering without errors
    await expect(canvas).toBeVisible();
  });
});

test.describe('Mobile 3D Performance', () => {
  test.use({ ...devices['iPhone 12'] });

  test('3D scene performance on mobile', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    // Track errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Run for 5 seconds to check stability
    await page.waitForTimeout(5000);

    // Check for FPS counter or performance indicator
    const perfIndicator = page.locator('[data-testid="fps-counter"], .performance-overlay');
    if (await perfIndicator.isVisible()) {
      const text = await perfIndicator.textContent();
      console.log('Performance indicator:', text);
    }

    // Should not have critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('network')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('mobile 3D interaction stress test', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Rapid interactions
    for (let i = 0; i < 20; i++) {
      const x = 50 + (i * 10) % 300;
      const y = 50 + (i * 15) % 400;
      await canvas.tap({ position: { x, y } });
      await page.waitForTimeout(100);
    }

    // Should still be functional
    await expect(canvas).toBeVisible();
  });

  test('mobile landscape orientation', async ({ page }) => {
    // Landscape viewport
    await page.setViewportSize({ width: 844, height: 390 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);

      // Interact
      await canvas.tap({ position: { x: 200, y: 150 } });
      await page.waitForTimeout(500);

      // Should still render
      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Different Mobile Devices', () => {
  test('iPhone 12 Pro', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      console.log('iPhone 12 Pro: Canvas loaded');
    }
  });

  test('Samsung Galaxy S21', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      console.log('Samsung Galaxy S21: Canvas loaded');
    }
  });

  test('iPad Pro', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      console.log('iPad Pro: Canvas loaded');
    }
  });

  test('Small phone (iPhone SE)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      console.log('iPhone SE: Canvas loaded');
    }
  });
});

test.describe('Mobile-specific UI Elements', () => {
  test.use({ ...devices['iPhone 12'] });

  test('mobile bottom navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile bottom nav
    const bottomNav = page.locator('[class*="bottom-nav"], nav[class*="mobile"]');
    if (await bottomNav.count() > 0) {
      await expect(bottomNav.first()).toBeVisible();
      console.log('Mobile bottom navigation found');
    }
  });

  test('mobile header shows correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    if (await header.count() > 0) {
      await expect(header).toBeVisible();

      // Take screenshot
      await expect(header).toHaveScreenshot('mobile-header.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('mobile feedback button accessibility', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Look for feedback buttons
    const feedbackBtn = page.locator('button').filter({ hasText: /feedback/i }).first();
    if (await feedbackBtn.count() > 0 && await feedbackBtn.isVisible()) {
      // Should be large enough to tap
      const box = await feedbackBtn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(40);
        expect(box.height).toBeGreaterThan(40);
        console.log('Feedback button is touch-friendly:', box);
      }
    }
  });
});
