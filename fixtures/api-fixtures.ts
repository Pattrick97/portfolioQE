import { expect, request, test as base } from "@playwright/test";

export { expect };

type ApiFixtures = {
  api: Awaited<ReturnType<typeof request.newContext>>;
};

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const api = await request.newContext({
      baseURL: "https://automationexercise.com/api/",
      extraHTTPHeaders: {
        Accept: "application/json",
      },
    });

    await use(api);
    await api.dispose();
  },
});
