import { expect, test } from "../../fixtures/api-fixtures";

test.describe("API catalog", () => {
  test("products list returns 200 with non-empty product array @smoke", async ({ api }) => {
    const response = await api.get("productsList");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("brands list returns 200 with non-empty brand array @smoke", async ({ api }) => {
    const response = await api.get("brandsList");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBeTruthy();
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test("products list rejects unsupported POST method", async ({ api }) => {
    const response = await api.post("productsList");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });
});
