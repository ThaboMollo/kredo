import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY = 'kredokredokredokredokredokredokr'; // 32 characters / bytes for dev fallback

function getKey(): Buffer {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    return Buffer.alloc(32, envKey, 'utf8');
  }
  if (isProduction) {
    throw new Error('ENCRYPTION_KEY must be configured for production deployments.');
  }
  return Buffer.from(DEFAULT_KEY, 'utf8');
}

export function encrypt(text: string, deterministic = false): string {
  if (!text) return text;
  const key = getKey();
  
  // Deriving IV: Random bytes for standard encryption, or HMAC-derived for deterministic lookups
  const iv = deterministic 
    ? crypto.createHmac('sha256', key).update(text).digest().subarray(0, 12)
    : crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return cipherText;
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    return cipherText;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
