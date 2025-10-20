# E2E Testing Documentation

## Test Architecture

```
Formula: TestArchitecture = PageObjects{TimerPage + StatsPage + PWAPage + NotificationPage} × TestSuites{timer + stats + pwa + notification} × Browsers{chromium + firefox + webkit}
```

## Directory Structure

```
tests/
├── e2e/                    # E2E test suites
│   ├── timer.spec.ts       # Timer flow tests
│   ├── stats.spec.ts       # Statistics flow tests
│   ├── pwa.spec.ts         # PWA functionality tests
│   └── notification.spec.ts # Notification flow tests
├── pages/                  # Page Object Models
│   ├── TimerPage.ts        # Timer page interactions
│   ├── StatsPage.ts        # Statistics page interactions
│   ├── PWAPage.ts          # PWA functionality helpers
│   └── NotificationPage.ts # Notification helpers
├── fixtures/               # Test fixtures and setup
└── utils/                  # Test utilities
```

## Test Coverage

### 1. Timer Flow (timer.spec.ts)

- ✓ Timer starts correctly
- ✓ Countdown display visible
- ✓ Session counter visible
- ✓ Pause and resume functionality
- ✓ Reset functionality

### 2. Statistics Flow (stats.spec.ts)

- ✓ Navigate to statistics page
- ✓ Display total sessions count
- ✓ Display total exercises count
- ✓ Data persists after page reload
- ✓ Data persists across browser sessions

### 3. PWA Flow (pwa.spec.ts)

- ✓ Service Worker registration
- ✓ Manifest.json exists
- ✓ PWA meta tags present
- ✓ App icons configured
- ✓ Static assets cached
- ✓ Offline detection

### 4. Notification Flow (notification.spec.ts)

- ✓ Notification API supported
- ✓ Permission can be granted
- ✓ Notification settings UI
- ✓ Break notification modal

## Running Tests

### Local Development

```bash
# Run all tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run specific test file
pnpm exec playwright test tests/e2e/timer.spec.ts

# Run tests in specific browser
pnpm exec playwright test --project=chromium

# Debug tests
pnpm exec playwright test --debug
```

### CI/CD

Tests run automatically on:

- Pull requests to main/dev branches
- Push to main/dev branches

```bash
# CI command (with retries)
CI=true pnpm test:e2e
```

## Configuration

Test configuration in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 0 locally, 2 on CI
- **Timeout**: 30s per action
- **Base URL**: http://localhost:4173 (preview server)
- **Reports**: HTML, List, JSON

## Test Strategy

### Page Object Model (POM)

All tests use Page Object Model pattern for:

- Maintainability: UI changes only require updating page objects
- Reusability: Page objects shared across multiple tests
- Readability: Tests describe user journeys, not implementation

### Test Data Management

- Uses in-memory IndexedDB (isolated per test)
- Automatic cleanup after tests
- No external dependencies

### Flaky Test Mitigation

- Explicit waits with timeouts
- Retry strategy on CI (2 retries)
- Screenshot/video on failure
- Stable selectors (roles, test IDs)

## Troubleshooting

### Test Failures

1. **Service Worker Issues**
   - Clear browser cache: `pnpm exec playwright clean`
   - Check service worker registration in DevTools

2. **Timeout Errors**
   - Increase timeout in test: `{ timeout: 60000 }`
   - Check network conditions
   - Verify preview server is running

3. **Flaky Tests**
   - Run multiple times: `pnpm exec playwright test --repeat-each=3`
   - Check for race conditions
   - Add explicit waits

### Debugging

```bash
# Run with headed browser
pnpm exec playwright test --headed

# Run in debug mode (Playwright Inspector)
pnpm exec playwright test --debug

# Show browser DevTools
pnpm exec playwright test --headed --devtools

# Generate trace
pnpm exec playwright test --trace on
```

## CI Integration

GitHub Actions workflow (`.github/workflows/playwright.yml`):

```yaml
- Install dependencies
- Install Playwright browsers
- Build production app
- Run Playwright tests
- Upload test reports & screenshots
```

## Best Practices

1. **Use Page Objects** for all UI interactions
2. **Use test IDs** (`data-testid`) for stable selectors
3. **Explicit waits** instead of arbitrary timeouts
4. **Isolated tests** - each test should be independent
5. **Descriptive names** - test names should describe user behavior
6. **Minimal mocking** - test real user flows when possible
7. **CI-ready** - tests should pass consistently on CI

## Future Enhancements

- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Performance testing (Lighthouse CI)
- [ ] Accessibility testing (axe-core)
- [ ] API mocking for faster tests
- [ ] Test data factories
- [ ] Custom test fixtures
