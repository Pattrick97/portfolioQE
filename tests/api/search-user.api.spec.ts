import { expect, test } from "../../fixtures/api-fixtures";

test.describe("API search and user details", () => {
  test("searchProduct returns matching catalog payload for query @smoke", async ({ api }) => {
    const response = await api.post("searchProduct", {
      form: {
        search_product: "top",
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("searchProduct rejects GET with 405", async ({ api }) => {
    const response = await api.get("searchProduct");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });

  test("getUserDetailByEmail returns 404 for nonexistent account", async ({ api }) => {
    const response = await api.get(
      "getUserDetailByEmail?email=this_user_should_not_exist_12345@example.com",
    );
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(404);
    expect(body.message).toContain("Account not found");
  });
});
