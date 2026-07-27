import { describe, expect, it } from 'vitest';
import {
  hashToken,
  msFromExpiresIn,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../jwt';

describe('jwt helpers', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ sub: 'user_1', organizationId: 'org_1', role: 'ADMIN' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user_1');
    expect(payload.organizationId).toBe('org_1');
    expect(payload.role).toBe('ADMIN');
  });

  it('signs and verifies a refresh token round-trip', () => {
    const token = signRefreshToken({ sub: 'user_1' });
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe('user_1');
  });

  it('rejects a tampered access token', () => {
    const token = signAccessToken({ sub: 'user_1', organizationId: 'org_1', role: 'EMPLOYEE' });
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });

  it('hashes tokens deterministically', () => {
    expect(hashToken('same-value')).toBe(hashToken('same-value'));
    expect(hashToken('a')).not.toBe(hashToken('b'));
  });

  it('parses expiresIn strings into milliseconds', () => {
    expect(msFromExpiresIn('15m')).toBe(15 * 60_000);
    expect(msFromExpiresIn('7d')).toBe(7 * 86_400_000);
    expect(msFromExpiresIn('1h')).toBe(3_600_000);
  });
});
