import { faker } from "@faker-js/faker";

export interface ContactUsData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Dynamic data — unique per test run
export function generateContactUsData(): ContactUsData {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    subject: `Question about order ${faker.number.int({ min: 1000, max: 9999 })}`,
    message: faker.lorem.paragraph(),
  };
}

// Deterministic data — static inputs and assertion strings for contact domain
export const contactStaticData = {
  invalidEmail: "invalid-email-format",
  uploadFilePath: "README.md",
} as const;

export const contactMessages = {
  contactSuccess: "Success! Your details have been submitted successfully.",
} as const;
