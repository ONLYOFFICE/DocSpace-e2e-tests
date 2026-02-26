import { Page, expect } from "@playwright/test";

/**
 * Page Object for the guest registration page.
 * Handles the flow when a non-existing user opens a room invite link
 * and needs to create a new DocSpace account:
 * 1. Fill first name, last name, and password
 * 2. Click "Sign up" to complete registration and join the room as a guest
 */
export class RoomGuestRegistration {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get firstNameInput() {
    return this.page.getByPlaceholder("First name");
  }

  get lastNameInput() {
    return this.page.getByPlaceholder("Last name");
  }

  get passwordInput() {
    return this.page.getByPlaceholder("Password");
  }

  get signUpButton() {
    return this.page.getByRole("button", { name: "Sign up" });
  }

  async fillFirstName(value: string) {
    await expect(this.firstNameInput).toBeVisible();
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value: string) {
    await expect(this.lastNameInput).toBeVisible();
    await this.lastNameInput.fill(value);
  }

  async fillPassword(value: string) {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(value);
  }

  async clickSignUp() {
    await expect(this.signUpButton).toBeVisible();
    await this.signUpButton.click();
  }

  async register(firstName: string, lastName: string, password: string) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillPassword(password);
    await this.clickSignUp();
  }
}

export default RoomGuestRegistration;
