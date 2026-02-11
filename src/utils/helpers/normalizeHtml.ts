import he from "he";
import { expect } from "@playwright/test";

export class HtmlNormalizer {
  /**
   * Decode HTML entities safely
   */
  static decode(value: string | null | undefined): string {
    if (!value) return "";
    return he.decode(value);
  }

  /**
   * Encode HTML entities safely
   */
  static encode(value: string | null | undefined): string {
    if (!value) return "";
    return he.encode(value);
  }

  /**
   * Normalize string for comparison
   * - decodes HTML entities
   * - trims whitespace
   */
  static normalize(value: string | null | undefined): string {
    return this.decode(value).trim();
  }

  /**
   * Compare two values after normalization
   */
  static equals(
    actual: string | null | undefined,
    expected: string | null | undefined,
  ): boolean {
    return this.normalize(actual) === this.normalize(expected);
  }

  /**
   * Instance method to normalize string for comparison
   * - decodes HTML entities
   * - trims whitespace
   */
  normalize(value: string | null | undefined): string {
    return HtmlNormalizer.normalize(value);
  }

  /**
   * Throw Playwright-friendly assertion error
   */
  static expectToEqual(
    actual: string | null | undefined,
    expected: string | null | undefined,
  ): void {
    const normalizedActual = this.normalize(actual);
    const normalizedExpected = this.normalize(expected);

    expect(normalizedActual).toBe(normalizedExpected);
  }
}
