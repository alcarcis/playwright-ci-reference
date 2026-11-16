import { test } from '../fixtures';

test.describe('cart and checkout', () => {
  test('starts empty and checkout is disabled', async ({ signedInShop }) => {
    await signedInShop.expectCartEmpty();
  });

  test('adding the same product twice accumulates quantity and total', async ({ signedInShop }) => {
    await signedInShop.add('USB-C hub');
    await signedInShop.add('USB-C hub');
    await signedInShop.expectCartItem('USB-C hub × 2');
    await signedInShop.expectTotal('69.00');
  });

  test('checkout confirms the order and empties the cart', async ({ signedInShop }) => {
    await signedInShop.add('Laptop stand');
    await signedInShop.add('Webcam 1080p');
    await signedInShop.expectTotal('113.25');
    await signedInShop.checkout();
    await signedInShop.expectOrderConfirmed('113.25');
    await signedInShop.expectCartEmpty();
  });
});
