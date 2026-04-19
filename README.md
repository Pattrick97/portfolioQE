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
data/                  # Test data — dynamic generators (faker) and deterministic constants
fixtures/              # Shared Playwright fixture (consent handler, test + expect exports)
helpers/               # Workflow helpers (auth flows, cart cleanup, vignette recovery)
models/                # TypeScript interfaces for test data shapes
pages/                 # Page Object Model classes (atomic selectors + actions)
tests/                 # Playwright specs
docs/                  # Local project notes (not tracked in git)
.github/workflows/     # CI pipelines (smoke + regression)
.github/               # PR checklist template
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
- nonexistent email

### Cart and Checkout

- guest checkout guard (redirect/login modal)
- category + brand filtering and add to cart
- remove product from cart
- proceed to checkout
- complete checkout and place order (payment)
- empty payment fields blocked

### Contact Us

- submit form with file attachment
- submit form without file
- invalid email scenario (no success message)
- navigation via navbar

### Auth guards

- unauthenticated user does not see account management links

## Data-Driven Approach

Data files in `data/` are grouped by domain and split by type:

| File                   | Type             | Contents                                                          |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| `data/auth.data.ts`    | Dynamic + Static | `generateSignupData()`, `authMessages`                            |
| `data/cart.data.ts`    | Static           | `guestCartCategoryFilter`, `cartStaticData`, `cartMessages`       |
| `data/contact.data.ts` | Dynamic + Static | `generateContactUsData()`, `contactStaticData`, `contactMessages` |

- **Dynamic** (`generate*`) — faker-generated, unique per test run, used for inputs
- **Static** (`*Messages`, `*StaticData`) — deterministic constants used in assertions

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

Run all tests (all browsers):

```bash
npm test
```

Run smoke suite only (Chromium, ~5 min):

```bash
npm run test:smoke
```

Run single spec:

```bash
npx playwright test tests/cart.spec.ts
```

Run headed mode:

```bash
npx playwright test --headed
```

### 4) Lint and format

```bash
npm run lint          # check for ESLint violations
npm run lint:fix      # auto-fix where possible
npm run format        # format all files with Prettier
npm run format:check  # check formatting without writing
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

GitHub Actions workflow: `.github/workflows/playwright.yml`

Two pipelines:

| Pipeline       | Trigger                                      | Scope                                              |
| -------------- | -------------------------------------------- | -------------------------------------------------- |
| **Smoke**      | every push                                   | `@smoke` tests, Chromium only, < 15 min            |
| **Regression** | daily schedule (06:00 UTC) + manual dispatch | all tests, Chromium / Firefox / WebKit in parallel |

Trace and video artifacts are uploaded for failing browser jobs (14-day retention).
A Job Summary table appears on every run for manual trend monitoring.

PR checklist: `.github/PULL_REQUEST_TEMPLATE.md`

## Notes and Trade-offs

- Tests include resilience for cookie-consent overlays via a shared `addLocatorHandler` in the fixture.
- `recoverFromVignette()` helper handles google_vignette ad-hash redirects that occur intermittently in CI — it detects the hash and performs a fallback `goto()` to the expected URL.
- `Cart as logged user` tests run in `serial` mode to avoid shared-account state collisions.
- Per-suite `retries: 2` is set on suites susceptible to network flakiness; global retries remain 0.

## Debugging Playbook

### Reproducing a CI failure locally

1. Download the **test-results** artifact from the failed GitHub Actions run.
2. Open the trace:
   ```bash
   npx playwright show-trace test-results/<test-folder>/trace.zip
   ```
3. Open the video (`.webm`) in any browser to watch the failure frame by frame.
4. Reproduce with the same browser as the failing job:
   ```bash
   npx playwright test --project=webkit --headed
   ```

### Common flaky patterns and fixes

| Symptom                                          | Root cause                           | Fix                                                                            |
| ------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------ |
| `toBeVisible` timeout on navigation              | google_vignette hash appended to URL | Add `recoverFromVignette()` after the triggering click                         |
| Consent overlay blocks interaction               | `addLocatorHandler` not registered   | Use `signupPage.navigate()` (or POM `navigate()`) instead of raw `page.goto()` |
| `accountInfoHeader` not found after signup click | Navigation intercepted mid-flight    | Add `recoverFromVignette()` with `expectedUrlPart: "signup"`                   |
| Serial tests fail in wrong order                 | State leak from previous test        | Ensure `beforeEach` calls `clearCart()` and logs in fresh                      |
| Soft assertion hides real failures               | Misuse of `expect.soft()`            | Use hard assertions for primary outcomes; soft only for secondary UI checks    |

### Useful debug flags

```bash
# Step through test interactively
npx playwright test --debug

# Generate and open trace for a single test
npx playwright test --trace on tests/cart.spec.ts
npx playwright show-trace test-results/*/trace.zip

# List all tests without running them
npx playwright test --list

# Run only @smoke tests
npm run test:smoke
```
