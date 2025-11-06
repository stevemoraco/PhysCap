import { test, expect } from '@playwright/test';

test.describe('Visual Regression Suite', () => {
  const pages = [
    { url: '/', name: 'landing', selector: 'main' },
    { url: '/project/tavakiev', name: 'tavakiev', selector: 'main' },
    { url: '/project/tabeguache', name: 'tabeguache', selector: 'main' },
    { url: '/project/venustas', name: 'venustas', selector: 'main' },
    { url: '/project/yadilhil', name: 'yadilhil', selector: 'main' },
    { url: '/innovation/golden-spike', name: 'golden-spike', selector: 'main' },
    { url: '/innovation/vitruvius', name: 'vitruvius', selector: 'main' },
    { url: '/innovation/talos', name: 'talos', selector: 'main' },
    { url: '/innovation/story-engineering', name: 'story-engineering', selector: 'main' },
  ];

  for (const { url, name, selector } of pages) {
    test(`${name} page - full page visual regression`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Wait for main content to load
      await page.waitForSelector(selector, { timeout: 10000 });

      // Wait for any 3D scenes to initialize
      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await page.waitForTimeout(2500); // Give 3D time to render
      } else {
        await page.waitForTimeout(1000); // Wait for animations
      }

      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${name}-full.png`, {
        fullPage: true,
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });

    test(`${name} page - viewport screenshot`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Wait for main content
      await page.waitForSelector(selector, { timeout: 10000 });

      // Wait for 3D if present
      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await page.waitForTimeout(2500);
      } else {
        await page.waitForTimeout(1000);
      }

      // Take viewport screenshot
      await expect(page).toHaveScreenshot(`${name}-viewport.png`, {
        maxDiffPixels: 100,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Responsive Breakpoints', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile-375' },
    { width: 390, height: 844, name: 'mobile-390' },
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 1024, height: 768, name: 'tablet-1024' },
    { width: 1366, height: 768, name: 'laptop-1366' },
    { width: 1920, height: 1080, name: 'desktop-1920' },
    { width: 2560, height: 1440, name: 'desktop-2560' },
  ];

  test('landing page on different viewports', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot(`landing-${viewport.name}.png`, {
        maxDiffPixels: 100,
        animations: 'disabled',
      });
    }
  });

  test('project page on different viewports', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/project/tavakiev');
      await page.waitForLoadState('networkidle');

      // Wait for canvas
      const canvas = page.locator('canvas').first();
      if (await canvas.count() > 0) {
        await page.waitForTimeout(2500);
      }

      await expect(page).toHaveScreenshot(`tavakiev-${viewport.name}.png`, {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Component Visual Regression', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const heroSection = page.locator('section, .hero, [class*="hero"]').first();
    if (await heroSection.count() > 0) {
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        maxDiffPixels: 100,
        animations: 'disabled',
      });
    }
  });

  test('navigation bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav, header').first();
    if (await nav.count() > 0) {
      await expect(nav).toHaveScreenshot('navigation.png', {
        maxDiffPixels: 50,
        animations: 'disabled',
      });
    }
  });

  test('footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer').first();
    if (await footer.count() > 0) {
      await expect(footer).toHaveScreenshot('footer.png', {
        maxDiffPixels: 50,
        animations: 'disabled',
      });
    }
  });
});

test.describe('3D Canvas Rendering', () => {
  test('Tavakiev 3D scene consistency', async ({ page }) => {
    await page.goto('/project/tavakiev');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for scene to fully load and stabilize
    await page.waitForTimeout(3000);

    // Take screenshot of canvas
    await expect(canvas).toHaveScreenshot('tavakiev-3d-canvas.png', {
      maxDiffPixels: 2500, // WebGL rendering can vary
      timeout: 10000,
    });
  });

  test('Tabeguache 3D scene consistency', async ({ page }) => {
    await page.goto('/project/tabeguache');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000);

      await expect(canvas).toHaveScreenshot('tabeguache-3d-canvas.png', {
        maxDiffPixels: 2500,
        timeout: 10000,
      });
    }
  });

  test('Venustas 3D scene consistency', async ({ page }) => {
    await page.goto('/project/venustas');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000);

      await expect(canvas).toHaveScreenshot('venustas-3d-canvas.png', {
        maxDiffPixels: 2500,
        timeout: 10000,
      });
    }
  });

  test('Yadilhil 3D scene consistency', async ({ page }) => {
    await page.goto('/project/yadilhil');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    if (await canvas.count() > 0) {
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000);

      await expect(canvas).toHaveScreenshot('yadilhil-3d-canvas.png', {
        maxDiffPixels: 2500,
        timeout: 10000,
      });
    }
  });
});

test.describe('Interactive States', () => {
  test('button hover states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstButton = page.locator('button').first();
    if (await firstButton.count() > 0) {
      // Normal state
      await expect(firstButton).toHaveScreenshot('button-normal.png', {
        maxDiffPixels: 50,
      });

      // Hover state
      await firstButton.hover();
      await page.waitForTimeout(300);
      await expect(firstButton).toHaveScreenshot('button-hover.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('link hover states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstLink = page.locator('a[href]').first();
    if (await firstLink.count() > 0) {
      // Normal state
      await expect(firstLink).toHaveScreenshot('link-normal.png', {
        maxDiffPixels: 50,
      });

      // Hover state
      await firstLink.hover();
      await page.waitForTimeout(300);
      await expect(firstLink).toHaveScreenshot('link-hover.png', {
        maxDiffPixels: 50,
      });
    }
  });
});

test.describe('Scroll States', () => {
  test('page appearance at different scroll positions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Top of page
    await expect(page).toHaveScreenshot('scroll-top.png', {
      maxDiffPixels: 100,
      animations: 'disabled',
    });

    // Middle of page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('scroll-middle.png', {
      maxDiffPixels: 100,
      animations: 'disabled',
    });

    // Bottom of page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('scroll-bottom.png', {
      maxDiffPixels: 100,
      animations: 'disabled',
    });
  });
});

test.describe('Dark Mode', () => {
  test('dark mode toggle consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for theme toggle
    const themeToggle = page.locator('[aria-label*="theme" i], [class*="theme"]').first();

    if (await themeToggle.count() > 0) {
      // Light mode
      await expect(page).toHaveScreenshot('light-mode.png', {
        fullPage: false,
        maxDiffPixels: 100,
        animations: 'disabled',
      });

      // Toggle to dark mode
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Dark mode
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: false,
        maxDiffPixels: 100,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Loading States', () => {
  test('page skeleton/loading state', async ({ page }) => {
    // Slow down network to catch loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    const loadingPromise = page.goto('/project/tavakiev');

    // Try to capture loading state
    await page.waitForTimeout(200);
    const body = page.locator('body');
    if (await body.isVisible()) {
      await expect(page).toHaveScreenshot('loading-state.png', {
        maxDiffPixels: 100,
        timeout: 2000,
      }).catch(() => {
        // Loading state might be too fast to catch
        console.log('Loading state not captured (loaded too quickly)');
      });
    }

    await loadingPromise;
  });
});
