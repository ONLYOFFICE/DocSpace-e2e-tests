import { expect } from '@playwright/test';
import { test } from '@/src/fixtures/index';


test.describe('API testing', () => {
  test.beforeAll(async ({ apiSdk }) => {
   await apiSdk.auth.ownerAuth();
   await apiSdk.profiles.addMemberUser();
   await apiSdk.auth.userAuth();
    
  });

  /*toDo - дополнить создание пользователей и их авторизацию в beforeAll
            и уже писать тесты из под разных типов пользователей.

            + прикрутить фэйкер, для автогенерации имен и email и паролей
             и реализовать их запись тоже в файл для авторизации.
  */

  test('Create User', async ({ apiSdk }) => {
    const response = await apiSdk.profiles.addMemberUser();
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(200);
    expect(body.isCollaborator).toBe(true);
    expect(body.isOwner).toBe(false);
    expect(body.isVisitor).toBe(false);
    expect(body.isAdmin).toBe(false);
    expect(body.isRoomAdmin).toBe(false);
    expect(body.isLDAP).toBe(false);
  });
 
  
});
