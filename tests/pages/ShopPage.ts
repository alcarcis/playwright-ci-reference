import { expect, type Page } from '@playwright/test';

export class ShopPage {
  constructor(private readonly page: Page) {}

  async expectVisible() {
    await expect(this.page.getByRole('heading', { name: 'Products' })).toBeVisible();
  }

  async add(productName: string) {
    await this.page.getByRole('button', { name: `Add ${productName} to cart` }).click();
  }

  async expectCartItem(text: string) {
    await expect(this.page.locator('#cart-items')).toContainText(text);
  }

  async expectTotal(total: string) {
    await expect(this.page.locator('#cart-total')).toHaveText(total);
  }

  async checkout() {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }

  async expectOrderConfirmed(total: string) {
    await expect(this.page.getByRole('status')).toContainText(`confirmed — total ${total}`);
  }

  async expectCartEmpty() {
    await expect(this.page.getByText('Your cart is empty.')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  }

  async signOut() {
    await this.page.getByRole('button', { name: 'Sign out' }).click();
  }
}
