import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const DEFAULT_ITERATIONS = 120000;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${DEFAULT_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [iterationsText, salt, originalHash] = storedHash.split(':');
  const iterations = Number(iterationsText);

  if (!iterations || !salt || !originalHash) {
    return false;
  }

  const derivedHash = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  return timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derivedHash, 'hex'));
}
