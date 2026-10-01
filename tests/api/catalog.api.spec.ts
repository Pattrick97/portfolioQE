import { expect, test } from "../../fixtures/api-fixtures";
import { expectApiCode, expectProductContract, getApiBody } from "../../helpers/api.helper";
import type {
  ApiMessageResponse,
  BrandsListResponse,
  ProductsListResponse,
} from "../../models/Api.Model.js";

test.describe("API catalog", () => {
  test("products list returns 200 with non-empty product array @smoke", async ({ api }) => {
    const response = await api.get("productsList");
    const body = await getApiBody<ProductsListResponse>(response);
    expectApiCode(body, 200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
    expectProductContract(body.products[0]);
  });

  test("brands list returns 200 with non-empty brand array @smoke", async ({ api }) => {
    const response = await api.get("brandsList");
    const body = await getApiBody<BrandsListResponse>(response);
    expectApiCode(body, 200);
    expect(Array.isArray(body.brands)).toBeTruthy();
    expect(body.brands.length).toBeGreaterThan(0);
    expect(body.brands[0]).toMatchObject({ id: expect.any(Number), brand: expect.any(String) });
  });

  test("products list rejects unsupported POST method", async ({ api }) => {
    const response = await api.post("productsList");
    const body = await getApiBody<ApiMessageResponse>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });

  test("products list rejects unsupported PUT method", async ({ api }) => {
    const response = await api.put("productsList");
    const body = await getApiBody<ApiMessageResponse>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });
});
