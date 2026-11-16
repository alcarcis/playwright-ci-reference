import { test, expect, credentials } from '../fixtures';

test.describe('auth', () => {
  test('health endpoint is public', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('login returns a token for valid credentials', async ({ request }) => {
    const res = await request.post('/api/login', { data: credentials() });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ token: expect.any(String) });
  });

  test('login rejects wrong credentials', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: credentials().username, password: 'nope' },
    });
    expect(res.status()).toBe(401);
  });

  test('protected endpoints require a token', async ({ request }) => {
    expect((await request.get('/api/products')).status()).toBe(401);
    expect((await request.get('/api/cart')).status()).toBe(401);
  });
});
