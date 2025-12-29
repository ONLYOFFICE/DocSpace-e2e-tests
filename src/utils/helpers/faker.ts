import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';

export class FAKER {
  private request: APIRequestContext;
  public user: { name: string; email: string; password: string; firstName: string; lastName: string; };
  public roomAdmin: { name: string; email: string; password: string; firstName: string; lastName: string; };
  public docspaceAdmin: { name: string; email: string; password: string; firstName: string; lastName: string; };

  constructor(request: APIRequestContext) {
    this.request = request;

    this.user = {
       name: faker.person.fullName(),
       password: faker.internet.password({ length: 12 }),
       email: faker.internet.email(),
       firstName: faker.person.firstName(),
       lastName: faker.person.lastName(),
    }

    this.roomAdmin = {
       name: faker.person.fullName(),
       password: faker.internet.password({ length: 12 }),
       email: faker.internet.email(),
       firstName: faker.person.firstName(),
       lastName: faker.person.lastName(),
    }

    this.docspaceAdmin = {
       name: faker.person.fullName(),
       password: faker.internet.password({ length: 12 }),
       email: faker.internet.email(),
       firstName: faker.person.firstName(),
       lastName: faker.person.lastName(),
    }
  }
}