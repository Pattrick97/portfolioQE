import { APIResponse, expect } from "@playwright/test";
import type { ApiBody, ApiProduct } from "../models/Api.Model.js";

export async function getApiBody<T extends ApiBody>(response: APIResponse): Promise<T> {
  expect(response.status()).toBe(200);
  return (await response.json()) as T;
}

export function expectApiCode(body: ApiBody, expectedCode: number): void {
  expect(body.responseCode).toBe(expectedCode);
}

export function expectProductContract(product: ApiProduct): void {
  expect(product).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    price: expect.any(String),
    brand: expect.any(String),
    category: {
      category: expect.any(String),
      usertype: { usertype: expect.any(String) },
    },
  });
}
