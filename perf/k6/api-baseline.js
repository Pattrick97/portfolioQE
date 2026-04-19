import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://automationexercise.com/api";

export const options = {
  vus: Number(__ENV.VUS || 8),
  duration: __ENV.DURATION || "45s",
  thresholds: {
    http_req_failed: ["rate<0.02"],
    "http_req_duration{endpoint:productsList}": ["p(95)<1500"],
    "http_req_duration{endpoint:searchProduct}": ["p(95)<1800"],
    "http_req_duration{endpoint:verifyLogin}": ["p(95)<1800"],
  },
};

export default function () {
  const products = http.get(`${BASE_URL}/productsList`, {
    tags: { endpoint: "productsList" },
  });

  check(products, {
    "productsList status 200": (r) => r.status === 200,
    "productsList has responseCode": (r) => r.body.includes("responseCode"),
  });

  const searchBody = "search_product=tshirt";
  const search = http.post(`${BASE_URL}/searchProduct`, searchBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { endpoint: "searchProduct" },
  });

  check(search, {
    "searchProduct status 200": (r) => r.status === 200,
    "searchProduct has products": (r) => r.body.includes("products"),
  });

  const authBody = "email=nonexistent_user@example.com&password=WrongPassword123!";
  const verifyLogin = http.post(`${BASE_URL}/verifyLogin`, authBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { endpoint: "verifyLogin" },
  });

  check(verifyLogin, {
    "verifyLogin transport ok": (r) => r.status === 200,
    "verifyLogin returns 404 responseCode": (r) => r.body.includes('"responseCode": 404'),
  });
}
