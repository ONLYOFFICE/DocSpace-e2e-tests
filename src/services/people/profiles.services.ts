import { test, APIRequestContext } from "@playwright/test";
import { FAKER } from "@/src/utils/helpers/faker";

type UserType = "DocSpaceAdmin" | "RoomAdmin" | "User";

export class ProfilesApi {
  private request: APIRequestContext;
  private faker: FAKER;
  private authTokenOwner: string = "";
  private authTokenDocSpaceAdmin: string = "";
  private authTokenRoomAdmin: string = "";
  private authTokenUser: string = "";
  private portalDomain: string = "";
  private docSpaceAdminEmail: string = "";
  private docSpaceAdminPassword: string = "";
  private roomAdminEmail: string = "";
  private roomAdminPassword: string = "";
  private userEmail: string = "";
  private userPassword: string = "";

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.faker = new FAKER();
    this.authTokenOwner = authToken;
    this.authTokenDocSpaceAdmin = authTokenDocSpaceAdmin;

    this.portalDomain = portalDomain;
  }

  public getUserEmail(): string {
    return this.userEmail;
  }

  public getUserPassword(): string {
    return this.userPassword;
  }

  public setAuthTokenUser(token: string) {
    this.authTokenUser = token;
  }

  public getRoomAdminEmail(): string {
    return this.roomAdminEmail;
  }

  public getRoomAdminPassword(): string {
    return this.roomAdminPassword;
  }

  public setAuthTokenRoomAdmin(token: string) {
    this.authTokenRoomAdmin = token;
  }

  public getDocSpaceAdminEmail(): string {
    return this.docSpaceAdminEmail;
  }

  public getDocSpaceAdminPassword(): string {
    return this.docSpaceAdminPassword;
  }

  public setAuthTokenDocSpaceAdmin(token: string) {
    this.authTokenDocSpaceAdmin = token;
  }

  async ownerAddMember(type: UserType) {
    return test.step("Create User", async () => {
      const fakeUser = this.faker.generateUser();

      const userData = {
        ...fakeUser,
        type,
      };

      if (type === "DocSpaceAdmin") {
        this.docSpaceAdminEmail = userData.email;
        this.docSpaceAdminPassword = userData.password;
      } else if (type === "RoomAdmin") {
        this.roomAdminEmail = userData.email;
        this.roomAdminPassword = userData.password;
      } else {
        this.userEmail = userData.email;
        this.userPassword = userData.password;
      }

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return { response, userData };
    });
  }

  async addUserForLongFirstAndLastName(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Create User for long first and last name", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async addUserForLongEmail(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Create User for long email", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminAddsUsers(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("DocSpace admin adds DocSpace admin", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminAddsDocSpaceUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Room admin adds DocSpace User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userAddsUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("User adds User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminAddsUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Room admin add User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async addingAUserWithoutAuthorization() {
    return test.step("Adding a user without authorization", async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
      );
      return response;
    });
  }

  async ownerReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }

  async docSpaceAdminReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
        },
      );
      return response;
    });
  }

  async roomAdminReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
        },
      );
      return response;
    });
  }

  async userReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
        },
      );
      return response;
    });
  }

  async returnAllUsersListWithoutAuthorization() {
    return test.step("Return all users list without authorization", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
      );
      return response;
    });
  }

  async ownerInviteUser(data: { type: string; email: string }) {
    return test.step("Owner invite user", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminInviteUser(data: { type: string; email: string }) {
    return test.step("DocSpace admin invite user", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminInviteUser(data: { type: string; email: string }) {
    return test.step("Room admin invite user", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userInviteUser(data: { type: string; email: string }) {
    return test.step("User invite user", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async inviteUserForLongEmail(data: { type: string; email: string }) {
    return test.step("Invite User for long email", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async invitingAUserWithoutAuthorization() {
    return test.step("Inviting a user without authorization", async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
      );
      return response;
    });
  }

  async ownerResendActavationEmails(data: {
    userIds: string[];
    resendAll: boolean;
  }) {
    return test.step("Owner resend activation emails", async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminResendActavationEmails(data: {
    userIds: string[];
    resendAll: boolean;
  }) {
    return test.step("DocSpace admin resend activation emails", async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminResendActavationEmails(data: {
    userIds: string[];
    resendAll: boolean;
  }) {
    return test.step("Room admin resend activation emails", async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async UserResendActavationEmails(data: {
    userIds: string[];
    resendAll: boolean;
  }) {
    return test.step("User resend activation emails", async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async resendingActivationEmailByUnauthorizedUser() {
    return test.step("Resending activation email by unauthorized user", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
      );
      return response;
    });
  }

  async ownerDeleteUser(data: { userIds: string[] }) {
    return test.step("Owner delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminDeleteUser(data: { userIds: string[] }) {
    return test.step("DocSpace admin delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminDeleteUser(data: { userIds: string[] }) {
    return test.step("Room admin delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userDeleteUser(data: { userIds: string[] }) {
    return test.step("Room admin delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async deletingAUserWithoutAuthorization(data: { userIds: string[] }) {
    return test.step("Room admin delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async OwnerReturnUserDetailedInformation(userId: string) {
    return test.step("Owner returns the detailed information of the user", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }

  async DocSpaceAdminReturnUserDetailedInformation(userId: string) {
    return test.step("DocSpace admin returns the detailed information of the user", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
        },
      );
      return response;
    });
  }

  async RoomAdminReturnUserDetailedInformation(userId: string) {
    return test.step("Room admin returns the detailed information of the user", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
        },
      );
      return response;
    });
  }

  async returnUserDetailedInformationAboutAUsetWithoutAuthorization(
    userId: string,
  ) {
    return test.step("Returns the detailed information of the user", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
      );
      return response;
    });
  }

  async ownerUpdatesData(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("Owner update himself", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async updateUserDataWithoutAuthorization(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("Update a user without authorization", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminUpdateUserData(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("DocSpace admin update another user", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminUpdateUserData(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("Room admin update another user", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userUpdateUserData(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("User update another user", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async ownerReturnHimselfInformation() {
    return test.step("Owner return himself information", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }

  async docSpaceAdminReturnHimselfInformation() {
    return test.step("DocSpace admin return himself information", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
        },
      );
      return response;
    });
  }

  async roomAdminReturnHimselfInformation() {
    return test.step("Room admin return himself information", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
        },
      );
      return response;
    });
  }

  async userReturnHimselfInformation() {
    return test.step("User return himself information", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
        },
      );
      return response;
    });
  }

  async ownerReturnsUserInfoViaEmail(data: { email: string[] }) {
    return test.step("Owner returns user information via email", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/email?email=${data.email}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }

  async returnsUserInfoViaEmailWithoutAuthorization(data: { email: string[] }) {
    return test.step("Returns user information via email without authorization", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/email?email=${data.email}`,
      );
      return response;
    });
  }
}
