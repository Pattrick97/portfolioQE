import { faker } from "@faker-js/faker";
import { SignupData } from "../models/SignUp.Model";

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

    country: "United States", // dropdown ma ograniczone opcje

    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),

    mobileNumber: faker.phone.number({ style: "national" }),
  };
}

export { SignupData };
