import { expect } from '@playwright/test';
import { test } from '@/src/fixtures/index';
import { faker } from '@faker-js/faker';


test.describe('API profile methods', () => {
  /*
  toDo - написать тесты из под разных типов пользователей:
  - User (collaborator)
  - Room Admin 
  - DocSpace Admin
  - Owner
  */

  test('Owner create User', async ({ apiSdk, api }) => {
    const response = await apiSdk.profiles.addMemberUser();
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.isCollaborator).toBe(true);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
  });

  test('Owner create Room Admin', async ({ apiSdk, api }) => {
    const response = await apiSdk.profiles.addMemberRoomAdmin();
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(true);
    expect(body.response.isLDAP).toBe(false);
  });

  test.only('Owner create DocSpace Admin', async ({ apiSdk, api }) => {
    const response = await apiSdk.profiles.addMemberDocSpaceAdmin();
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(true);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
  });

  
  test('Owner create User for long first and last name', async ({ apiSdk, api }) => {
    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.string.alpha({ length: 260 }),
      lastName: faker.string.alpha({ length: 260 }),
      type: 'User'
    };
    const response = await apiSdk.profiles.addUserForLongFirstAndLastName(userData);
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.response.errors.FirstName).toContain('The field FirstName must be a string with a maximum length of 255.');
    expect(body.response.errors.LastName).toContain('The field LastName must be a string with a maximum length of 255.');
  });

  test('Owner create User for long email', async ({ apiSdk, api }) => {
    const localPart = faker.string.alpha({ length: 260, casing: 'lower' });
    const domain = faker.internet.domainName();
    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: `${localPart}@${domain}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User"
    };
    const response = await apiSdk.profiles.addUserForLongEmail(userData);
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.response.errors.Email).toContain('The field Email must be a string with a maximum length of 255.');
  });


  test('DocSpace admin creates DocSpace admin', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
    await api.auth.authenticateDocSpaceAdmin();
    

     const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "DocSpaceAdmin"
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsDocSpaceAdmin(userData);
    const body = await response.json();
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain('Access denied');
  });

  test('DocSpace admin creates Room admin', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
    await api.auth.authenticateDocSpaceAdmin();
    

     const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "RoomAdmin"
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsRoomAdmin(userData);
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.isCollaborator).toBe(false);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(true);
    expect(body.response.isLDAP).toBe(false);
  });

  test('DocSpace admin creates user', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberDocSpaceAdmin();
    await api.auth.authenticateDocSpaceAdmin();
    

     const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User"
    };

    const response = await apiSdk.profiles.docSpaceAdminAddsUser(userData);
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.isCollaborator).toBe(true);
    expect(body.response.isOwner).toBe(false);
    expect(body.response.isVisitor).toBe(false);
    expect(body.response.isAdmin).toBe(false);
    expect(body.response.isRoomAdmin).toBe(false);
    expect(body.response.isLDAP).toBe(false);
  });

  test('Room admin creates Room admin', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberRoomAdmin();
    await api.auth.authenticateRoomAdmin();

     const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "RoomAdmin"
    };

    const response = await apiSdk.profiles.roomAdminAddsDocSpaceUser(userData);
    const body = await response.json();
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain('Access denied');
  });
// Test for room admin creates User don't work, room admin can't create user because access denied

/*  test('Room admin creates User', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberRoomAdmin();
    await api.auth.authenticateRoomAdmin();

     const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User"
    };

    const response = await apiSdk.profiles.roomAdminAddsUser(userData);
    const body = await response.json();
    console.log(body);
    // expect(response.status()).toBe(403);
    // expect(body.error.message).toContain('Access denied');
  });
*/
  test('User creates User', async ({ apiSdk, api }) => {
    await apiSdk.profiles.addMemberUser();
    await api.auth.authenticateUser();

    const userData = {
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      type: "User"
    };

    const response = await apiSdk.profiles.userAddsUser(userData);
    const body = await response.json();
    expect(response.status()).toBe(403);
    expect(body.error.message).toContain('Access denied');
  });

});


