import { faker } from "@faker-js/faker";

export interface ContactUsData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function generateContactUsData(): ContactUsData {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    subject: `Question about order ${faker.number.int({ min: 1000, max: 9999 })}`,
    message: faker.lorem.paragraph(),
  };
}
