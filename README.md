# portfolioQE

End-to-end UI automation portfolio project built with Playwright and TypeScript against https://automationexercise.com.

## Goals

- Showcase practical Quality Engineering skills in real browser tests.
- Cover core e-commerce user journeys:
  - signup and login
  - cart and checkout
  - contact form
- Keep tests readable, data-driven, and CI-friendly.

## Tech Stack

- Playwright (`@playwright/test`)
- TypeScript
- Faker (`@faker-js/faker`) for dynamic test data
- GitHub Actions for CI

## Project Structure

```text
data/                  # Test data generators and constants
fixtures/              # Test fixtures (optional shared setup)
models/                # TypeScript interfaces/models for data
pages/                 # Page Object Model classes
tests/                 # Playwright specs
.github/workflows/     # CI pipelines
playwright.config.ts   # Playwright configuration
```

## Implemented Coverage

### Signup

- successful signup
- signup with existing email
- required fields validation check
- register -> logout -> login flow

### Login

- successful login
- logout session check
- invalid password
- empty credentials

### Cart and Checkout

- guest checkout guard (redirect/login modal)
- category + brand filtering and add to cart
- remove product from cart
- proceed to checkout
- complete checkout and place order

### Contact Us

- submit form with file attachment
- submit form without file
- invalid email scenario (no success message text)

## Data-Driven Approach

Test inputs and fixed expected values are moved to `data/`:

- `data/signUp.data.ts` - generated signup data
- `data/contactUs.data.ts` - generated contact data
- `data/productFilters.data.ts` - category/subcategory/brand filters
- `data/testConstants.data.ts` - shared constants (messages, checkout/payment values)

This reduces hardcoded literals inside specs and keeps maintenance simple.

## Getting Started

### 1) Install dependencies

```bash
npm ci
```

### 2) Install Playwright browsers

```bash
npx playwright install --with-deps
```

### 3) Run tests

Run all tests:

```bash
npx playwright test
```

Run single spec:

```bash
npx playwright test tests/cart.spec.ts
```

Run headed mode:

```bash
npx playwright test --headed
```

## Reports

HTML report is enabled in Playwright config.

```bash
npx playwright show-report
```

## Parallelism

Configured in `playwright.config.ts`:

- local: 4 workers
- CI: 2 workers

This balances speed and stability for the current suite.

## CI

GitHub Actions workflow is available at:

- `.github/workflows/playwright.yml`

Pipeline installs dependencies, browsers, runs tests, and uploads HTML report artifact.

## Notes and Trade-offs

- Tests include resilience for cookie-consent overlays.
- Some app behaviors are non-standard (for example validation differences or ad-related redirects), so assertions are adapted to observed behavior to keep tests stable.
- `Cart as logged user` tests run in serial mode to avoid shared-account state collisions.
