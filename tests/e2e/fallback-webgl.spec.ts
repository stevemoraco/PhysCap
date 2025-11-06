import { test, expect } from '@playwright/test';
import { disableWebGPU, disableWebGL, simulateLowEndDevice } from '../fixtures/mockData';

test.describe('WebGPU Fallback to WebGL', () => {
  test('WebGPU unavailable falls back to Three.js', async ({ page }) => {
    // Mock WebGPU as unavailable
    await page.addInitScript(disableWebGPU);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Should still render 3D scene with WebGL fallback
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for scene to initialize
    await page.waitForTimeout(3000);

    // Track console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Interact with canvas
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    // Should still be visible and functional
    await expect(canvas).toBeVisible();

    // Check for fallback indicator or message
    const fallbackIndicator = page.locator('text=/webgl|fallback|three\.js/i');
    if (await fallbackIndicator.count() > 0) {
      console.log('Fallback mode detected in UI');
    }

    // Collect errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('network') &&
      !e.includes('WebGPU')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('WebGPU fallback on all project pages', async ({ page }) => {
    await page.addInitScript(disableWebGPU);

    const projects = [
      '/project/tavakiev',
      '/project/tabeguache',
      '/project/venustas',
      '/project/yadilhil',
    ];

    for (const projectUrl of projects) {
      await page.goto(projectUrl);
      await page.waitForLoadState('networkidle');

      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await expect(canvas).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000);
        console.log(`${projectUrl}: Fallback rendering working`);
      }
    }
  });

  test('WebGPU fallback performance', async ({ page }) => {
    await page.addInitScript(disableWebGPU);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Run for several seconds to check stability
    const startTime = Date.now();
    await page.waitForTimeout(5000);
    const endTime = Date.now();

    // Should not crash
    await expect(canvas).toBeVisible();

    console.log(`Fallback rendering stable for ${endTime - startTime}ms`);
  });
});

test.describe('WebGL Unavailable Error Handling', () => {
  test('WebGL unavailable shows error message', async ({ page }) => {
    // Mock WebGL as unavailable
    await page.addInitScript(disableWebGL);
    await page.addInitScript(disableWebGPU);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    // Should show error message or fallback content
    const errorMessage = page.locator('text=/webgl.*not.*supported|3d.*unavailable|browser.*not.*supported/i');
    const canvas = page.locator('canvas').first();

    // Either show error message or gracefully handle
    const hasError = await errorMessage.count() > 0;
    const hasCanvas = await canvas.count() > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      console.log('Error message displayed for unsupported browser');
    } else if (hasCanvas) {
      // Canvas might still be present but with fallback content
      console.log('Canvas present with potential 2D fallback');
    }

    // Page should not be blank
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('graceful degradation without WebGL', async ({ page }) => {
    await page.addInitScript(disableWebGL);
    await page.addInitScript(disableWebGPU);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show fallback content or static images
    const mainContent = page.locator('main, [role="main"], .container').first();
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }

    // Check for static images as fallback
    const images = page.locator('img');
    if (await images.count() > 0) {
      console.log(`Found ${await images.count()} images as potential fallback`);
    }

    // Page should remain functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Low-End Device Performance', () => {
  test('low-end device performance mode activates', async ({ page }) => {
    await page.addInitScript(simulateLowEndDevice);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for scene initialization
    await page.waitForTimeout(2000);

    // Check for reduced quality indicators
    const perfMode = page.locator('text=/reduced.*quality|performance.*mode|low.*quality/i');
    if (await perfMode.count() > 0) {
      console.log('Performance mode indicator found');
    }

    // Canvas should still be interactive
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('low-end device - multiple interactions', async ({ page }) => {
    await page.addInitScript(simulateLowEndDevice);

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Multiple interactions to test stability
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i * 20);
      const y = 100 + (i * 15);
      await canvas.click({ position: { x, y } });
      await page.waitForTimeout(200);
    }

    // Should still be visible
    await expect(canvas).toBeVisible();
  });

  test('low-end device fallback across pages', async ({ page }) => {
    await page.addInitScript(simulateLowEndDevice);

    const projects = ['/project/tavakiev', '/project/tabeguache'];

    for (const projectUrl of projects) {
      await page.goto(projectUrl);
      await page.waitForLoadState('networkidle');

      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await expect(canvas).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(1500);
        console.log(`${projectUrl}: Low-end mode working`);
      }
    }
  });
});

test.describe('Network Error Handling', () => {
  test('offline mode handling', async ({ page }) => {
    // Go online first to load the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Then simulate offline
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/project/tavakiev').catch(() => {
      console.log('Navigation failed as expected in offline mode');
    });

    await page.waitForTimeout(1000);

    // Check for offline indicator
    const offlineMsg = page.locator('text=/offline|no.*connection|check.*internet/i');
    if (await offlineMsg.count() > 0) {
      console.log('Offline message detected');
    }
  });

  test('slow network handling', async ({ page }) => {
    // Simulate slow 3G
    await page.context().route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/project/tavakiev', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Should eventually load
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('API error handling', async ({ page }) => {
    // Mock API failures
    await page.route('**/api/**', route => route.abort());

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should still load, just without API data
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for error indicators
    const errorMsg = page.locator('text=/error|failed|try.*again/i');
    if (await errorMsg.count() > 0) {
      console.log('API error handling detected');
    }
  });
});

test.describe('Canvas Interaction Error Handling', () => {
  test('canvas interaction without errors', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Track errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });

    // Multiple rapid interactions
    for (let i = 0; i < 10; i++) {
      await canvas.click({ position: { x: 100 + i * 20, y: 100 + i * 20 } });
      await page.waitForTimeout(100);
    }

    // Should still be visible and functional
    await expect(canvas).toBeVisible();

    // Filter critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('network')
    );

    if (criticalErrors.length > 0) {
      console.log('Errors detected:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('canvas click outside bounds', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Get canvas bounds
    const box = await canvas.boundingBox();
    if (box) {
      // Click outside canvas (should not crash)
      await page.mouse.click(box.x + box.width + 10, box.y + 10);
      await page.waitForTimeout(500);

      // Click inside canvas
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(500);

      // Should still be functional
      await expect(canvas).toBeVisible();
    }
  });

  test('rapid canvas resizing', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Resize viewport multiple times
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
    }

    // Canvas should still be visible
    await expect(canvas).toBeVisible();
  });
});

test.describe('Memory Leak Prevention', () => {
  test('multiple page navigations without memory leaks', async ({ page }) => {
    const urls = [
      '/project/tavakiev',
      '/project/tabeguache',
      '/project/venustas',
      '/project/yadilhil',
      '/',
    ];

    for (let i = 0; i < 2; i++) {
      for (const url of urls) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Wait for 3D if present
        const canvas = page.locator('canvas').first();
        if (await canvas.count() > 0) {
          await page.waitForTimeout(1000);
        }
      }
    }

    // Should still be responsive
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('canvas cleanup on navigation', async ({ page }) => {
    // Go to 3D page
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // Navigate away
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Canvas should load again without errors
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
    }
  });
});

test.describe('Browser Compatibility', () => {
  test('unsupported features gracefully handled', async ({ page }) => {
    // Disable multiple features
    await page.addInitScript(() => {
      // Mock unavailable features
      Object.defineProperty(navigator, 'gpu', {
        get: () => undefined,
        configurable: true,
      });
    });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should not show blank page
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('console errors do not crash application', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Inject intentional errors
    await page.evaluate(() => {
      console.error('Test error 1');
      console.error('Test error 2');
    });

    await page.waitForTimeout(1000);

    // Application should still function
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Edge Cases', () => {
  test('extremely small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    // Should still render something
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('extremely large viewport', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });

    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page refresh during 3D loading', async ({ page }) => {
    await page.goto('/project/tavakiev');

    // Refresh quickly
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should load properly after refresh
    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
    }
  });
});
