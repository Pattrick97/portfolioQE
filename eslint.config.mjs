import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import playwrightPlugin from "eslint-plugin-playwright";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",

      // Playwright best practices
      "playwright/no-focused-test": "error", // forbids test.only in CI
      "playwright/no-skipped-test": "warn", // warn on test.skip
      "playwright/no-wait-for-timeout": "error", // forbids page.waitForTimeout
      "playwright/no-raw-locators": "off", // POM uses raw locators by design

      // General
      "no-console": "warn",
    },
  },
  // Disable formatting rules that conflict with Prettier
  prettierConfig,
];
