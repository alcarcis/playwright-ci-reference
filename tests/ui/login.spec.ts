import { test, expect, credentials } from '../fixtures';

test.describe('login', () => {
  test('valid credentials open the shop', async ({ loginPage, shopPage }) => {
    await loginPage.goto();
    await loginPage.signIn(credentials());
    await shopPage.expectVisible();
  });

  test('wrong password shows an error and stays on the login form', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.signIn({ username: credentials().username, password: 'definitely-wrong' });
    await loginPage.expectError('Invalid username or password');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeHidden();
  });

  test('signing out returns to the login form', async ({ signedInShop, page }) => {
    await signedInShop.signOut();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
