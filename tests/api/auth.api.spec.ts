import { expect, test } from "../../fixtures/api-fixtures";
import { expectApiCode, getApiBody } from "../../helpers/api.helper";

test.describe("API auth", () => {
  test("verifyLogin returns 404 for unknown user @smoke", async ({ api }) => {
    const response = await api.post("verifyLogin", {
      form: {
        email: "nonexistent_user@example.com",
        password: "WrongPassword123!",
      },
    });

    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 404);
    expect(body.message).toContain("User not found");
  });

  test("verifyLogin returns 400 when required params are missing", async ({ api }) => {
    const response = await api.post("verifyLogin", {
      form: {
        email: "",
      },
    });

    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 400);
    expect(body.message).toContain("missing in POST request");
  });

  test("verifyLogin returns 400 when both email and password are missing", async ({ api }) => {
    const response = await api.post("verifyLogin", {
      form: {},
    });

    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 400);
    expect(body.message).toContain("missing in POST request");
  });

  test("verifyLogin rejects GET method with 405", async ({ api }) => {
    const response = await api.get("verifyLogin");
    const body = await getApiBody<{ responseCode: number; message: string }>(response);
    expectApiCode(body, 405);
    expect(body.message).toContain("not supported");
  });
});
