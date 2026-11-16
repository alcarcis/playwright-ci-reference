// Tiny demo shop used as system under test. Zero dependencies, fully hermetic.
// Credentials come from the environment: they are never stored in the repository.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { APP_USER, APP_PASSWORD } = process.env;
if (!APP_USER || !APP_PASSWORD) {
  console.error('APP_USER and APP_PASSWORD must be set (see README).');
  process.exit(1);
}
const PORT = Number(process.env.PORT ?? 3100);
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

const PRODUCTS = [
  { id: 1, name: 'Mechanical keyboard', price: 89.9 },
  { id: 2, name: 'USB-C hub', price: 34.5 },
  { id: 3, name: 'Laptop stand', price: 51.25 },
  { id: 4, name: 'Webcam 1080p', price: 62.0 },
];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

/** token -> { cart: Map<productId, qty> } */
const sessions = new Map();

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readJson = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null;
  }
};

const sessionFrom = (req) => {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  return sessions.get(token);
};

const cartView = (session) => {
  const items = [...session.cart].map(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return { ...product, qty, subtotal: Math.round(product.price * qty * 100) / 100 };
  });
  const total = Math.round(items.reduce((sum, i) => sum + i.subtotal * 100, 0)) / 100;
  return { items, total };
};

const api = async (req, res, pathname) => {
  if (pathname === '/api/health') return send(res, 200, { status: 'ok' });

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await readJson(req);
    if (!body) return send(res, 400, { error: 'invalid JSON' });
    if (body.username !== APP_USER || body.password !== APP_PASSWORD) {
      return send(res, 401, { error: 'invalid credentials' });
    }
    const token = randomUUID();
    sessions.set(token, { cart: new Map() });
    return send(res, 200, { token });
  }

  const session = sessionFrom(req);
  if (!session) return send(res, 401, { error: 'unauthorized' });

  if (pathname === '/api/products' && req.method === 'GET') return send(res, 200, PRODUCTS);

  if (pathname === '/api/cart' && req.method === 'GET') return send(res, 200, cartView(session));

  if (pathname === '/api/cart' && req.method === 'POST') {
    const body = await readJson(req);
    const qty = body?.qty ?? 1;
    if (!body || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      return send(res, 422, { error: 'qty must be an integer between 1 and 10' });
    }
    if (!PRODUCTS.some((p) => p.id === body.productId)) {
      return send(res, 404, { error: 'unknown product' });
    }
    session.cart.set(body.productId, (session.cart.get(body.productId) ?? 0) + qty);
    return send(res, 201, cartView(session));
  }

  if (pathname === '/api/cart' && req.method === 'DELETE') {
    session.cart.clear();
    return send(res, 200, cartView(session));
  }

  if (pathname === '/api/checkout' && req.method === 'POST') {
    if (session.cart.size === 0) return send(res, 409, { error: 'cart is empty' });
    const order = { orderId: randomUUID().slice(0, 8), ...cartView(session) };
    session.cart.clear();
    return send(res, 200, order);
  }

  return send(res, 404, { error: 'not found' });
};

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (pathname.startsWith('/api/')) return await api(req, res, pathname);
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    const full = path.join(PUBLIC_DIR, path.normalize(file));
    if (!full.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'forbidden' });
    const data = await readFile(full);
    res.writeHead(200, { 'content-type': MIME[path.extname(full)] ?? 'text/plain' });
    res.end(data);
  } catch {
    send(res, 404, { error: 'not found' });
  }
});

server.listen(PORT, () => console.log(`demo shop listening on http://localhost:${PORT}`));
