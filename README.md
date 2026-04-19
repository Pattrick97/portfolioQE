# portfolioQE

End-to-end UI + API automation portfolio project built with Playwright and TypeScript against https://automationexercise.com.

## Goals

- Showcase practical Quality Engineering skills in real browser tests.
- Cover core e-commerce user journeys:
  - signup and login
  - cart and checkout
  - contact form
- Keep tests readable, data-driven, and CI-friendly.

## QE Approach

This suite is designed as a practical QE portfolio, not only as a list of happy-path checks.

- **Risk-based coverage first**: core business paths (signup/login/cart/checkout/contact) are covered first, then hardened with negative scenarios (missing fields, wrong methods, nonexistent users, empty cart/payment guards).
- **Isolation over hidden coupling**: shared account setup moved to worker fixture (`registeredUser`), while state-sensitive suites keep per-test reset (`beforeEach` with `loginAs()` + `clearCart()`).
- **Deterministic assertions**: assertions focus on user-visible outcomes and API contract signals (`responseCode`, message, URL/state), avoiding fragile implementation details.
- **Data strategy by intent**: dynamic data (faker) prevents collisions; static constants keep assertions stable and readable.
- **Stability engineering**: known external flakiness sources (cookie overlays, `#google_vignette`) are handled centrally via fixtures/helpers rather than ad-hoc waits.
- **Fast feedback loops**: API smoke + UI smoke on every push, full regression on schedule/manual trigger, so defects are detected early without blocking development velocity.

## API Testing Strategy

Current API tests are primarily **consumer-side contract checks** with negative protocol/validation coverage.

What they validate:

- endpoint availability and basic response contract (`responseCode`, key payload fields, message semantics)
- allowed/disallowed HTTP methods (e.g., `405` behavior)
- input validation behavior for missing/invalid parameters (`400` paths)
- expected business outcomes for known invalid identities (`404` paths)

What they are **not** (currently):

- provider-published schema/version contract testing (e.g., Pact/OpenAPI schema conformance gates)
- performance/load testing
- security testing (authz, injection, fuzzing)

So in practice: this suite sits between classic API functional tests and lightweight contract verification from the consumer perspective.

## Tech Stack

- Playwright (`@playwright/test`)
- TypeScript
- Faker (`@faker-js/faker`) for dynamic test data
- ESLint for static code analysis
- Prettier for formatting consistency
- GitHub Actions for CI

## Project Structure

```text
data/                  # Test data — dynamic generators (faker) and deterministic constants
fixtures/              # Shared Playwright fixtures (consent handler + registered test user)
helpers/               # Workflow helpers (auth, cart, checkout flow, API assertions, vignette recovery)
models/                # TypeScript interfaces for test data shapes
pages/                 # Page Object Model classes (atomic selectors + actions)
tests/                 # Playwright specs
tests/api/             # API contract specs (catalog, auth, search/user details)
docs/                  # Local project notes (not tracked in git)
.github/workflows/     # CI pipelines (api smoke + smoke + regression)
.github/               # PR checklist template
playwright.config.ts   # Playwright configuration
```

## Implemented Coverage

### Signup

- successful signup
- signup with existing email
- required fields validation check
- register -> logout -> login flow
- signup start blocked when name is empty
- signup start blocked when invalid email format

### Login

- successful login
- logout session check
- invalid password
- empty credentials
- empty password
- empty email
- nonexistent email

### Cart and Checkout

- guest checkout guard (redirect/login modal)
- category + brand filtering and add to cart
- remove product from cart
- proceed to checkout
- complete checkout and place order (payment)
- empty payment fields blocked
- empty cart blocks checkout actions
- direct payment URL with empty cart does not place order
- partial payment data (card number only) does not place order

### Contact Us

- submit form with file attachment
- submit form without file
- invalid email scenario (no success message)
- navigation via navbar

### Auth guards

- unauthenticated user does not see account management links

### API catalog

- products list endpoint returns 200 with non-empty payload
- brands list endpoint returns 200 with non-empty payload
- unsupported method on products endpoint returns 405
- unsupported PUT method on products endpoint returns 405

### API auth

- verifyLogin returns 404 for unknown user
- verifyLogin returns 400 when required params are missing
- verifyLogin returns 400 when both credentials are missing
- verifyLogin rejects GET with 405

### API search and user details

- searchProduct returns matching catalog payload for query
- searchProduct rejects GET with 405
- searchProduct returns 400 when search parameter is missing
- getUserDetailByEmail returns 404 for nonexistent account
- getUserDetailByEmail returns 400 when email parameter is missing

## Data-Driven Approach

Data files in `data/` are grouped by domain and split by type:

| File                   | Type             | Contents                                                          |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| `data/auth.data.ts`    | Dynamic + Static | `generateSignupData()`, `authMessages`, `signupInvalidInputs`     |
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

Run all projects (UI + API):

```bash
npm test
```

Run smoke suite only (Chromium, ~5 min):

```bash
npm run test:smoke
```

Run API smoke suite:

```bash
npm run test:api:smoke
```

Run full API suite:

```bash
npm run test:api
```

Run single spec:

```bash
npx playwright test tests/cart.spec.ts
```

Run headed mode:

```bash
npx playwright test --headed
```

Example: use worker-scoped `registeredUser` fixture in a new spec:

```ts
import { expect, test } from "../fixtures/auth-fixtures";

test("user profile is visible after login", async ({ page, registeredUser }) => {
  await page.goto("/login");
  await page.locator('input[data-qa="login-email"]').fill(registeredUser.email);
  await page.locator('input[data-qa="login-password"]').fill(registeredUser.password);
  await page.locator('button[data-qa="login-button"]').click();

  await expect(page.getByText(`Logged in as ${registeredUser.firstName}`)).toBeVisible();
});
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

Three pipelines:

| Pipeline       | Trigger                                      | Scope                                              |
| -------------- | -------------------------------------------- | -------------------------------------------------- |
| **API Smoke**  | every push                                   | `@smoke` API tests (`project=api`)                 |
| **Smoke**      | every push                                   | `@smoke` tests, Chromium only, < 15 min            |
| **Regression** | daily schedule (06:00 UTC) + manual dispatch | all tests, Chromium / Firefox / WebKit in parallel |

Trace and video artifacts are uploaded for failing browser jobs (14-day retention).
A Job Summary table appears on every run for manual trend monitoring.

PR checklist: `.github/PULL_REQUEST_TEMPLATE.md`

## Notes and Trade-offs

- Tests include resilience for cookie-consent overlays via a shared `addLocatorHandler` in the fixture.
- Auth-heavy suites use worker-scoped `registeredUser` fixture (`fixtures/auth-fixtures.ts`) to create/delete accounts once per worker.
- `recoverFromVignette()` helper handles google_vignette ad-hash redirects that occur intermittently in CI — it detects the hash and performs a fallback `goto()` to the expected URL.
- `Cart as logged user` tests run in parallel with per-test isolation (`beforeEach`: `loginAs()` + `clearCart()`).
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

| Symptom                                          | Root cause                           | Fix                                                                                         |
| ------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `toBeVisible` timeout on navigation              | google_vignette hash appended to URL | Add `recoverFromVignette()` after the triggering click                                      |
| Consent overlay blocks interaction               | shared fixture not used              | Import `test` from `fixtures/test-fixtures.ts` (not directly from `@playwright/test`)       |
| `accountInfoHeader` not found after signup click | Navigation intercepted mid-flight    | Add `recoverFromVignette()` with fallback to the expected route (for signup flow: `/login`) |
| Cart tests interfere with each other             | State leak from previous test        | Ensure `beforeEach` calls `clearCart()` and logs in fresh                                   |
| Soft assertion hides real failures               | Misuse of `expect.soft()`            | Use hard assertions for primary outcomes; soft only for secondary UI checks                 |

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
