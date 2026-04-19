## Test Quality Checklist

Before merging any PR that adds or modifies tests, confirm each item below.

### Stability

- [ ] Test passes 3 consecutive local runs without failure
- [ ] No `page.waitForTimeout()` — use Playwright auto-waiting or explicit locator assertions
- [ ] No raw `page.goto()` in place of a POM `navigate()` — ensures consent handler is registered
- [ ] `recoverFromVignette()` added after any click that triggers a full-page navigation in a flaky-prone suite

### Data

- [ ] Dynamic inputs use a `generate*()` faker function — never hardcoded fake emails or names
- [ ] Deterministic assertion values come from the appropriate `*Messages` / `*StaticData` constant
- [ ] No test shares state through a module-level variable unless wrapped in `beforeAll`/`afterAll`

### Assertions

- [ ] Every test has at least one hard assertion on the primary business outcome
- [ ] Negative tests assert _absence_ of success state (not just URL)
- [ ] `expect.soft()` used only for secondary / observability assertions, not for critical outcomes

### Selectors

- [ ] All `page.locator()` calls are inside a POM file — specs use only POM methods
- [ ] Selectors prefer `data-qa` attributes or accessible roles over CSS class names

### Cleanup

- [ ] Accounts created in `beforeAll` are deleted in `afterAll`
- [ ] Cart is cleared in `beforeEach` for logged-user cart tests
- [ ] No `test.only` left in the code (`lint` enforces this via `playwright/no-focused-test`)
