import { createHash, createHmac } from 'crypto';
import { hashApiKey } from './api-key-hash';

describe('hashApiKey', () => {
  it('uses plain SHA-256 when no pepper is set (preserves existing stored hashes)', () => {
    expect(hashApiKey('zap_secret')).toBe(createHash('sha256').update('zap_secret').digest('hex'));
    expect(hashApiKey('zap_secret', undefined)).toBe(createHash('sha256').update('zap_secret').digest('hex'));
  });

  it('uses HMAC-SHA256 with the pepper when set, distinct from the un-peppered hash', () => {
    const peppered = hashApiKey('zap_secret', 'server-pepper');
    expect(peppered).toBe(createHmac('sha256', 'server-pepper').update('zap_secret').digest('hex'));
    expect(peppered).not.toBe(hashApiKey('zap_secret'));
  });

  it('is deterministic for the same key + pepper', () => {
    expect(hashApiKey('k', 'p')).toBe(hashApiKey('k', 'p'));
  });
});
