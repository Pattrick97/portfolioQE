# Project Map

## Test Flow

```text
tests/*.spec.ts
  -> fixtures/       shared browser/API setup and registered test account
  -> pages/          UI selectors and page-level actions
  -> helpers/        reusable workflows and API assertions
  -> data/           generated inputs and stable assertion values
  -> models/         TypeScript shapes for test data and API payloads
```

API specs live in `tests/api/`. Performance scenarios live separately in `perf/k6/`.

## Where to Make a Change

- Add a scenario and its expected behavior in the matching spec under `tests/`.
- Add or update a UI selector/action in the matching Page Object under `pages/`.
- Put a multi-step workflow in `helpers/` when it is reused or would otherwise obscure a test.
- Put generated inputs and stable expected values in the matching `data/` module.
- Put shared API payload shapes in `models/`; keep response assertions close to the API tests or in `helpers/api.helper.ts` when reused.
- Add browser-wide or worker-wide setup to `fixtures/`, not to individual specs.

## Useful Commands

```bash
npm run test:smoke
npm run test:api
npm run test:regression -- --project=chromium
npm run lint
npm run format:check
```

The full browser matrix and CI triggers are configured in `.github/workflows/playwright.yml`.
