import { APIResponse, expect } from "@playwright/test";

type ApiBody = {
  responseCode: number;
  message?: string;
  [key: string]: unknown;
};

export async function getApiBody<T extends ApiBody>(response: APIResponse): Promise<T> {
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as T;
}

export function expectApiCode(body: ApiBody, expectedCode: number): void {
  expect(body.responseCode).toBe(expectedCode);
}
