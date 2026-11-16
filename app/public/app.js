const $ = (id) => document.getElementById(id);
let token = null;

const call = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

const renderCart = ({ items, total }) => {
  $('cart-empty').hidden = items.length > 0;
  $('cart-items').replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.name} × ${item.qty} — ${item.subtotal.toFixed(2)}`;
      return li;
    }),
  );
  $('cart-total').textContent = total.toFixed(2);
  $('checkout').disabled = items.length === 0;
};

const loadShop = async () => {
  const products = await call('/api/products');
  $('products').replaceChildren(
    ...products.body.map((p) => {
      const li = document.createElement('li');
      li.dataset.testid = `product-${p.id}`;
      li.append(`${p.name} — ${p.price.toFixed(2)} `);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Add to cart';
      button.setAttribute('aria-label', `Add ${p.name} to cart`);
      button.addEventListener('click', async () => {
        const res = await call('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: p.id }),
        });
        $('order-confirmation').hidden = true;
        renderCart(res.body);
      });
      li.append(button);
      return li;
    }),
  );
  renderCart((await call('/api/cart')).body);
};

$('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const res = await call('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
  });
  if (!res.ok) {
    $('login-error').textContent = 'Invalid username or password';
    $('login-error').hidden = false;
    return;
  }
  token = res.body.token;
  $('login-error').hidden = true;
  $('login-view').hidden = true;
  $('shop-view').hidden = false;
  await loadShop();
});

$('checkout').addEventListener('click', async () => {
  const res = await call('/api/checkout', { method: 'POST' });
  if (res.ok) {
    $('order-confirmation').textContent =
      `Order ${res.body.orderId} confirmed — total ${res.body.total.toFixed(2)}`;
    $('order-confirmation').hidden = false;
    renderCart({ items: [], total: 0 });
  }
});

$('logout').addEventListener('click', () => {
  token = null;
  $('shop-view').hidden = true;
  $('login-view').hidden = false;
  $('order-confirmation').hidden = true;
});
