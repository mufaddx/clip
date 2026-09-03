import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * AES-256-GCM helpers for instagram_tokens at rest — see
 * docs/architecture/SECURITY_ARCHITECTURE.md "Token storage". Decrypted
 * only inside this module, in memory, for the duration of a Graph API call.
 */
export function encryptToken(plaintext: string, base64Key: string): string {
  const key = Buffer.from(base64Key, "base64");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptToken(encoded: string, base64Key: string): string {
  const key = Buffer.from(base64Key, "base64");
  const raw = Buffer.from(encoded, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
