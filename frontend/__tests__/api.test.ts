import api from '@/lib/api';

describe('API client', () => {
  it('has correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8000/api');
  });

  it('has JSON content type', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('attaches token from localStorage to requests', () => {
    localStorage.setItem('token', 'test-token-123');

    // Simulate interceptor
    const config = { headers: {} as Record<string, string> };
    const interceptor = api.interceptors.request.handlers[0];
    const result = interceptor.fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer test-token-123');
  });
});
