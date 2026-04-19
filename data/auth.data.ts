import { faker } from "@faker-js/faker";
import { SignupData } from "../models/SignUp.Model";

export type { SignupData };

// Dynamic data — unique per test run
export function generateSignupData(): SignupData {
  const gender = faker.helpers.arrayElement(["Mr", "Mrs"]) as "Mr" | "Mrs";

  return {
    // Account Info
    title: gender,
    email: faker.internet.email(),
    password: faker.internet.password(),

    day: faker.number.int({ min: 1, max: 28 }).toString(),
    month: faker.date.month(),
    year: faker.number.int({ min: 1970, max: 2000 }).toString(),

    newsletter: faker.datatype.boolean(),
    specialOffers: faker.datatype.boolean(),

    // Address Info
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),

    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),

    country: "United States", // dropdown has restricted options

    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),

    mobileNumber: faker.phone.number({ style: "national" }),
  };
}

// Deterministic data — assertion strings for auth domain
export const authMessages = {
  accountCreated: "Account Created!",
  accountDeleted: "Account Deleted!",
  invalidLogin: "Your email or password is incorrect!",
} as const;
