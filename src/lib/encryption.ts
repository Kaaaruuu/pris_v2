import crypto from 'crypto';

// RA 10173: Class A/B data MUST be encrypted.
// Using AES-256-GCM. 
// Note: In production, the key MUST be managed via Supabase Vault or AWS KMS.
// For this prototype, we utilize a server-side env variable.
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'a-very-secret-32-character-key-1', 'utf-8');

export function encrypt(text: string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine IV + Tag + EncryptedData for storage
  return Buffer.concat([iv, tag, encrypted]);
}

export function decrypt(buffer: Buffer): string {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encryptedText = buffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encryptedText, undefined, 'utf8') + decipher.final('utf8');
}
