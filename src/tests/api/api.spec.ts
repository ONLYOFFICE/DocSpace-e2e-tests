import { expect } from '@playwright/test';
import { test } from '@/src/fixtures/index';


test.describe('API testing', () => {
  test.beforeAll(async ({ apiSdk }) => {
   await apiSdk.auth.ownerAuth();
   await apiSdk.profiles.addMemberUser();
   await apiSdk.auth.userAuth();
   await apiSdk.profiles.addMemberRoomAdmin();
   await apiSdk.auth.roomAdminAuth();
   await apiSdk.profiles.addMemberDocSpaceAdmin();
   await apiSdk.auth.docSpaceAdminAuth();
  });

  /*toDo - Прикрутить теперь SDK и написать тесты из под разных типов пользователей.

  */

  test('Create User', async ({ apiSdk }) => {
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
 
  
});
