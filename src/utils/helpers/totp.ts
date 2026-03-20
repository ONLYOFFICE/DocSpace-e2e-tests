import * as OTPAuth from "otpauth";

export function generateTotpCode(secret: string): string {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  });

  return totp.generate();
}
