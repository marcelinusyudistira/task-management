import { setAuth, getToken, getUser, clearAuth, isAuthenticated } from '@/lib/auth';

describe('auth helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('setAuth stores token and user', () => {
    const user = { id: 1, name: 'Test', email: 'test@test.com', role: 'admin' as const };
    setAuth('my-token', user);

    expect(localStorage.getItem('token')).toBe('my-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(user);
  });

  it('getToken returns stored token', () => {
    localStorage.setItem('token', 'abc123');
    expect(getToken()).toBe('abc123');
  });

  it('getUser returns parsed user', () => {
    const user = { id: 1, name: 'Test', email: 'test@test.com', role: 'member' as const };
    localStorage.setItem('user', JSON.stringify(user));
    expect(getUser()).toEqual(user);
  });

  it('clearAuth removes token and user', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', '{}');
    clearAuth();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('isAuthenticated returns true when token exists', () => {
    localStorage.setItem('token', 'abc');
    expect(isAuthenticated()).toBe(true);
  });

  it('isAuthenticated returns false when no token', () => {
    expect(isAuthenticated()).toBe(false);
  });
});
