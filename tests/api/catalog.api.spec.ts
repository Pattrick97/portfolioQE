import { expect, test } from "../../fixtures/api-fixtures";
import { expectApiCode, getApiBody } from "../../helpers/api.helper";

test.describe("API catalog", () => {
  test("products list returns 200 with non-empty product array @smoke", async ({ api }) => {
    const response = await api.get("productsList");
    const body = await getApiBody<{ responseCode: number; products: unknown[] }>(response);
    expectApiCode(body, 200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("brands list returns 200 with non-empty brand array @smoke", async ({ api }) => {
    const response = await api.get("brandsList");
    const body = await getApiBody<{ responseCode: number; brands: unknown[] }>(response);
    expectApiCode(body, 200);
    expect(Array.isArray(body.brands)).toBeTruthy();
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test("products list rejects unsupported POST method", async ({ api }) => {
    const response = await api.post("productsList");
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });

  test("products list rejects unsupported PUT method", async ({ api }) => {
    const response = await api.put("productsList");
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });
});
