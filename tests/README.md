# Testing Infrastructure for Physical.Capital

## Overview

This directory contains comprehensive test coverage for the Physical.Capital platform, including:
- E2E tests with Playwright
- Unit tests with Vitest
- Integration tests for API routes
- Visual regression tests
- Performance monitoring

## Test Structure

```
tests/
├── e2e/                          # Playwright E2E tests
│   ├── complete-journey.spec.ts  # Full user journey test
│   ├── mobile-gyroscope.spec.ts  # Mobile device orientation tests
│   ├── fallback-webgl.spec.ts    # Low-end device fallback tests
│   └── visual-regression.spec.ts # Visual regression baseline tests
├── unit/
│   ├── hooks/                    # Custom React hooks tests
│   │   ├── useDevicePerformance.test.ts
│   │   ├── useInteractionTracking.test.ts
│   │   └── use3DInteraction.test.ts
│   └── components/               # Component unit tests
│       ├── ErrorBoundary.test.tsx
│       └── GoldButton.test.tsx
├── integration/
│   └── api/
│       └── routes.test.ts        # API integration tests
├── fixtures/                     # Test data and fixtures
└── setup.ts                      # Test environment setup

```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:unit
```

### Unit Tests with Coverage
```bash
npm run test:unit -- --coverage
```

### E2E Tests
```bash
npm run test:e2e
```

### E2E Tests with UI
```bash
npm run test:e2e:ui
```

### E2E Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### Watch Mode (Unit Tests)
```bash
npm run test:watch
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for critical paths
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Full user journeys and edge cases
- **Visual Regression**: All major pages and components

## E2E Tests Details

### 1. Complete Journey Test (`complete-journey.spec.ts`)
Tests the full user flow from landing to interaction:
- Landing page load
- Navigation to project pages
- 3D canvas rendering
- Authentication flow
- Dashboard access

### 2. Mobile Gyroscope Test (`mobile-gyroscope.spec.ts`)
Tests mobile-specific features:
- Device orientation permissions
- Gyroscope event handling
- Mobile caustics rendering
- Touch interactions

### 3. WebGL Fallback Test (`fallback-webgl.spec.ts`)
Tests low-end device support:
- WebGPU unavailable scenario
- WebGL fallback rendering
- Graceful degradation
- Error handling

### 4. Visual Regression Test (`visual-regression.spec.ts`)
Baseline screenshots for:
- Landing page
- All project pages
- Dashboard
- Responsive breakpoints (desktop, tablet, mobile)
- Dark mode

## Unit Tests Details

### Hook Tests

#### `useDevicePerformance.test.ts`
- Desktop detection (high quality)
- Mobile detection (medium quality)
- Low-end device detection
- Pixel ratio limits
- Particle count settings

#### `useInteractionTracking.test.ts`
- Interaction tracking with userId
- No tracking without userId
- Page visit duration tracking
- Metadata inclusion
- Cleanup function

#### `use3DInteraction.test.ts`
- Click handling on 3D objects
- Touch event handling
- Mouse cursor updates
- Tooltip clearing
- Zoom animation

### Component Tests

#### `ErrorBoundary.test.tsx`
- Normal rendering
- Error catching
- Fallback UI display

#### `GoldButton.test.tsx`
- Text rendering
- Click handling
- Icon variants
- Disabled state
- Size variants

## Integration Tests Details

### API Routes (`routes.test.ts`)
Tests all API endpoints:
- `GET /api/auth/user` - User authentication
- `POST /api/feedback` - Feedback submission
- `GET /api/feedback/:userId` - Feedback retrieval
- `POST /api/interactions` - Interaction tracking
- `GET /api/interactions/:userId` - Interaction retrieval
- `POST /api/reports/generate` - Report generation
- `GET /api/reports/latest/:userId` - Latest report
- `GET /api/reports/:userId` - All reports

## Configuration

### Vitest Config (`vitest.config.ts`)
- Environment: jsdom
- Coverage provider: v8
- Coverage thresholds: 80%
- Path aliases: `@/` → `client/src/`

### Playwright Config (`playwright.config.ts`)
- Base URL: http://localhost:5000
- Projects: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Retries: 2 in CI, 0 locally
- Screenshots: on failure only
- Traces: on first retry

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

1. **Lint** - Code quality checks
2. **Typecheck** - TypeScript validation
3. **Unit Tests** - With coverage reporting to Codecov
4. **E2E Tests** - Full Playwright suite
5. **Build** - Production build verification
6. **Deploy** - Automatic deployment on main branch
7. **Lighthouse** - Performance auditing post-deploy

### Preview Deployments (`.github/workflows/preview.yml`)
- Automatic preview deployments for PRs
- PR comments with preview URL

## Performance Monitoring

### Mobile Performance Targets
- Lighthouse score: >90
- LCP (Largest Contentful Paint): <2.5s on 4G
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1
- FPS: 30fps on iPhone 12, 60fps on desktop

### Performance Utilities (`client/src/lib/performanceOptimizations.ts`)
- GPU tier detection
- Adaptive quality settings
- Texture optimization
- Service worker caching
- FPS monitoring
- Memory management

## Accessibility Testing

### Keyboard Navigation (`client/src/lib/accessibility.ts`)
- Tab navigation through 3D objects
- Enter/Space activation
- Arrow key camera control
- Escape to clear selection
- Screen reader announcements

### WCAG 2.1 AA Compliance
- Contrast ratio checking
- Focus trap for modals
- Skip to main content link
- ARIA live regions
- Reduced motion support

## SEO Optimization

### Structured Data (`client/src/components/StructuredData.tsx`)
- Organization schema
- Project/Investment schema
- Article schema
- Breadcrumb schema
- FAQ schema
- Website search action

## Admin Dashboard

### Analytics Components (`client/src/components/admin/`)
- `UserActivityChart.tsx` - 30-day activity visualization
- `FeedbackBrowser.tsx` - Searchable feedback table
- `InteractionHeatmap.tsx` - Visual interaction intensity map

### Admin Features (`client/src/pages/Admin.tsx`)
- Real-time analytics
- User management
- Feedback review
- Bulk report generation
- Interaction analysis

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources after tests
3. **Mocking**: Mock external dependencies (API calls, timers)
4. **Assertions**: Use meaningful, specific assertions
5. **Data-testid**: Use data-testid for reliable selectors
6. **Coverage**: Aim for critical paths, not 100% coverage

## Debugging

### Failed Tests
```bash
# Run specific test file
npm run test:unit tests/unit/hooks/useDevicePerformance.test.ts

# Run specific E2E test
npm run test:e2e tests/e2e/complete-journey.spec.ts

# Debug mode
npm run test:e2e:debug
```

### Visual Regression Failures
1. Check screenshot diff in `playwright-report/`
2. Review changes in browser UI mode: `npm run test:e2e:ui`
3. Update baseline if intentional: Delete old screenshots and re-run

### Coverage Gaps
```bash
# Generate HTML coverage report
npm run test:unit -- --coverage
# Open coverage/index.html in browser
```

## Common Issues

### Issue: Canvas not rendering in tests
**Solution**: Mock WebGL context in `tests/setup.ts`

### Issue: Async timeout errors
**Solution**: Increase timeout in test or use `waitFor`

### Issue: Flaky E2E tests
**Solution**: Add proper `waitForLoadState` and explicit waits

### Issue: Import path errors
**Solution**: Check Vitest config path aliases match tsconfig

## Contributing

When adding new features:
1. Write tests BEFORE implementation (TDD)
2. Ensure all tests pass locally
3. Add integration tests for new API endpoints
4. Update visual regression baselines if UI changed
5. Document test coverage in this README

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
