import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ShopPage } from './pages/ShopPage';

export const credentials = () => {
  const { APP_USER, APP_PASSWORD } = process.env;
  if (!APP_USER || !APP_PASSWORD) throw new Error('APP_USER / APP_PASSWORD are not set');
  return { username: APP_USER, password: APP_PASSWORD };
};

type Fixtures = {
  loginPage: LoginPage;
  shopPage: ShopPage;
  /** Shop page already signed in: tests start from the state they care about. */
  signedInShop: ShopPage;
  /** API client with a valid session token. */
  authedApi: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  signedInShop: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(credentials());
    const shop = new ShopPage(page);
    await shop.expectVisible();
    await use(shop);
  },
  authedApi: async ({ playwright, baseURL }, use) => {
    const anonymous = await playwright.request.newContext({ baseURL });
    const login = await anonymous.post('/api/login', { data: credentials() });
    expect(login.ok()).toBeTruthy();
    const { token } = (await login.json()) as { token: string };
    await anonymous.dispose();
    const api = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { authorization: `Bearer ${token}` },
    });
    await use(api);
    await api.dispose();
  },
});

export { expect };
