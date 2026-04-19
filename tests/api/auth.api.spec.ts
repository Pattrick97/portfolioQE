import { expect, test } from "../../fixtures/api-fixtures";

test.describe("API auth", () => {
  test("verifyLogin returns 404 for unknown user @smoke", async ({ api }) => {
    const response = await api.post("verifyLogin", {
      form: {
        email: "nonexistent_user@example.com",
        password: "WrongPassword123!",
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(404);
    expect(body.message).toContain("User not found");
  });

  test("verifyLogin returns 400 when required params are missing", async ({ api }) => {
    const response = await api.post("verifyLogin", {
      form: {
        email: "",
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain("missing in POST request");
  });

  test("verifyLogin rejects GET method with 405", async ({ api }) => {
    const response = await api.get("verifyLogin");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });
});
