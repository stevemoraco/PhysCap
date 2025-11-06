# E2E Test Suite Overview

## Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npx playwright test tests/e2e/complete-journey.spec.ts

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

## Test Files

### 1. complete-journey.spec.ts (8 tests)
- Full user journey from landing to feedback
- Navigation across all 4 projects
- Navigation across all 4 innovation pages
- Mobile viewport testing
- 404 error handling
- Scroll interactions
- 3D interaction stress testing
- Keyboard navigation

### 2. visual-regression.spec.ts (34 tests)
- Full page screenshots for 9 pages
- Viewport screenshots for 9 pages
- 7 different viewport sizes tested
- Component-level screenshots (hero, nav, footer)
- 3D canvas rendering consistency
- Interactive state screenshots (hover)
- Scroll position screenshots
- Dark mode consistency
- Loading state capture

### 3. mobile-gyroscope.spec.ts (18 tests)
- Mobile navigation menu
- Touch interactions on 3D scenes
- Scroll performance
- Gyroscope caustics effects
- Device orientation handling
- Multiple device sizes (iPhone, Galaxy, iPad)
- Mobile-specific UI elements
- Button accessibility checks

### 4. fallback-webgl.spec.ts (21 tests)
- WebGPU → WebGL fallback
- WebGL unavailable handling
- Low-end device performance
- Network error handling (offline, slow)
- API error handling
- Canvas interaction edge cases
- Memory leak prevention
- Browser compatibility
- Edge cases (tiny/huge viewports)

## Test Fixtures

Located in: `tests/fixtures/mockData.ts`

Helper functions available:
- `mockGetUserMedia()` - Mock microphone access
- `mockDeviceOrientation(alpha, beta, gamma)` - Simulate gyroscope
- `disableWebGPU()` - Test WebGL fallback
- `disableWebGL()` - Test complete fallback
- `simulateLowEndDevice()` - Test performance mode

Mock data available:
- `mockUser` - Test user profile
- `mockProfile` - Investment profile
- `mockFeedback` - Voice feedback
- `mockInteractions` - User interactions
- `mockProjects` - Project metadata
- `mockInnovations` - Innovation metadata

## Coverage

- **Total Test Cases**: 63
- **Total Test Suites**: 22
- **Lines of Code**: 1,781
- **Pages Tested**: 9 (landing + 4 projects + 4 innovations)
- **Viewports Tested**: 7 (mobile to 4K)
- **Browsers**: 5 (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)

## Key Features Tested

✓ 3D rendering and interactions
✓ Mobile responsiveness
✓ Gyroscope effects
✓ Voice feedback
✓ Report requests
✓ WebGPU/WebGL fallback
✓ Error handling
✓ Memory management
✓ Accessibility
✓ Visual regression
✓ Performance
✓ Browser compatibility

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Docker Example

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
WORKDIR /app
COPY . .
RUN npm install
RUN npm run test:e2e
```

## Debugging Failed Tests

1. Run with UI mode: `npx playwright test --ui`
2. Run with debug: `npx playwright test --debug`
3. View trace: `npx playwright show-trace trace.zip`
4. Check screenshots in: `test-results/`
5. Check HTML report: `npx playwright show-report`

## Test Organization

```
tests/
├── e2e/
│   ├── complete-journey.spec.ts    # User flows
│   ├── visual-regression.spec.ts   # Screenshots
│   ├── mobile-gyroscope.spec.ts    # Mobile & device
│   └── fallback-webgl.spec.ts      # Error handling
├── fixtures/
│   └── mockData.ts                 # Mock data & helpers
└── TEST_OVERVIEW.md                # This file
```

## Best Practices

1. Use `waitForLoadState('networkidle')` for page loads
2. Set appropriate timeouts for 3D scenes (15000ms)
3. Filter out non-critical errors (favicon, 404s)
4. Use flexible selectors with `.or()` fallbacks
5. Check for element existence before interacting
6. Mock external services (microphone, gyroscope)
7. Clean up resources (streams, timeouts)

## Notes

- Tests require dev server running on localhost:5000
- Visual regression baselines created on first run
- 3D scenes need time to initialize (2-3 seconds)
- Mobile tests use iPhone 12 configuration by default
- Screenshot diffs allow for rendering variations
