import { faker } from "@faker-js/faker";


export type FakeUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export class FAKER {

generateUser(): FakeUser {
    const stamp = Date.now();
      return {
        password: faker.internet.password({ length: 12 }),
        email: `user_${stamp}_${faker.internet.userName()}@test.com`,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
    }

  generateEmailWithLength(totalLength: number): string {
// RFC safe:
// local <= 64
const localLength = 50;
// -1 for "@", -4 for ".com"
const domainLength = totalLength - localLength - 5;
if (domainLength <= 0) {
throw new Error("Total length too small for email generation");
}
const local = faker.string.alpha(localLength);
const domain = faker.string.alpha(domainLength);
return `${local}@${domain}.com`;
}

generateString(length: number): string {
  return faker.string.alpha(length);
}

}