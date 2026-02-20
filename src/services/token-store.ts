export type Role = "owner" | "docSpaceAdmin" | "roomAdmin" | "user" | "guest";

export type Credentials = { email: string; password: string };

export class TokenStore {
  private tokens: Record<Role, string> = {
    owner: "",
    docSpaceAdmin: "",
    roomAdmin: "",
    user: "",
    guest: "",
  };

  private credentials: Partial<Record<Role, Credentials>> = {};

  portalDomain: string = "";

  getToken(role: Role): string {
    return this.tokens[role];
  }

  setToken(role: Role, token: string): void {
    this.tokens[role] = token;
  }

  getCredentials(role: Role): Credentials {
    const creds = this.credentials[role];
    if (!creds) {
      throw new Error(
        `No credentials stored for role "${role}". Was addMember() called for this role?`,
      );
    }
    return creds;
  }

  setCredentials(role: Role, email: string, password: string): void {
    this.credentials[role] = { email, password };
  }
}
