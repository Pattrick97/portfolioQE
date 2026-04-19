import { expect, test } from "../../fixtures/api-fixtures";
import { expectApiCode, getApiBody } from "../../helpers/api.helper";

test.describe("API search and user details", () => {
  test("searchProduct returns matching catalog payload for query @smoke", async ({ api }) => {
    const response = await api.post("searchProduct", {
      form: {
        search_product: "top",
      },
    });

    const body = await getApiBody<{ responseCode: number; products: unknown[] }>(response);
    expectApiCode(body, 200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("searchProduct rejects GET with 405", async ({ api }) => {
    const response = await api.get("searchProduct");
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });

  test("searchProduct returns 400 when search_product parameter is missing", async ({ api }) => {
    const response = await api.post("searchProduct", {
      form: {},
    });
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 400);
    expect(body.message).toContain("search_product parameter is missing");
  });

  test("getUserDetailByEmail returns 404 for nonexistent account", async ({ api }) => {
    const response = await api.get(
      "getUserDetailByEmail?email=this_user_should_not_exist_12345@example.com",
    );
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 404);
    expect(body.message).toContain("Account not found");
  });

  test("getUserDetailByEmail returns 400 when email parameter is missing", async ({ api }) => {
    const response = await api.get("getUserDetailByEmail");
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 400);
    expect(body.message).toContain("email parameter is missing");
  });
});
