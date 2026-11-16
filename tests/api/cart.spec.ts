import { test, expect } from '../fixtures';

test.describe('cart contract', () => {
  test('lists products with id, name and price', async ({ authedApi }) => {
    const res = await authedApi.get('/api/products');
    expect(res.status()).toBe(200);
    const products = (await res.json()) as unknown[];
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(Number),
      });
    }
  });

  test('adds items and computes the total without float drift', async ({ authedApi }) => {
    await authedApi.post('/api/cart', { data: { productId: 3 } });
    const res = await authedApi.post('/api/cart', { data: { productId: 2, qty: 3 } });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({ total: 154.75 });
  });

  for (const qty of [0, 11, 1.5, '2']) {
    test(`rejects invalid quantity ${JSON.stringify(qty)}`, async ({ authedApi }) => {
      const res = await authedApi.post('/api/cart', { data: { productId: 1, qty } });
      expect(res.status()).toBe(422);
    });
  }

  test('rejects unknown products', async ({ authedApi }) => {
    const res = await authedApi.post('/api/cart', { data: { productId: 999 } });
    expect(res.status()).toBe(404);
  });

  test('checkout fails on an empty cart', async ({ authedApi }) => {
    const res = await authedApi.post('/api/checkout');
    expect(res.status()).toBe(409);
  });

  test('sessions are isolated: carts are not shared between tokens', async ({
    authedApi,
    playwright,
    baseURL,
  }) => {
    await authedApi.post('/api/cart', { data: { productId: 1 } });
    const other = await playwright.request.newContext({ baseURL });
    const { username, password } = {
      username: process.env.APP_USER,
      password: process.env.APP_PASSWORD,
    };
    const { token } = (await (
      await other.post('/api/login', { data: { username, password } })
    ).json()) as {
      token: string;
    };
    const cart = await other.get('/api/cart', { headers: { authorization: `Bearer ${token}` } });
    expect(await cart.json()).toEqual({ items: [], total: 0 });
    await other.dispose();
  });
});
