// k6 smoke/load test against the demo shop API.
// The thresholds below are the quality gate: if any is crossed, k6 exits non-zero and CI fails.
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';

export const options = {
  scenarios: {
    shoppers: {
      executor: 'constant-vus',
      vus: 10,
      duration: '20s',
    },
  },
  thresholds: {
    // Reliability: fewer than 1% failed requests, and every functional check must pass.
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    // Latency: budgets with headroom for shared CI runners.
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    'http_req_duration{endpoint:login}': ['p(95)<400'],
  },
};

const json = { 'Content-Type': 'application/json' };

export function setup() {
  if (!__ENV.APP_USER || !__ENV.APP_PASSWORD) {
    throw new Error('APP_USER and APP_PASSWORD must be set (see README).');
  }
}

export default function () {
  let token;

  group('login', () => {
    const res = http.post(
      `${BASE_URL}/api/login`,
      JSON.stringify({ username: __ENV.APP_USER, password: __ENV.APP_PASSWORD }),
      { headers: json, tags: { endpoint: 'login' } },
    );
    check(res, { 'login: 200': (r) => r.status === 200 });
    token = res.json('token');
  });

  const auth = { headers: { ...json, Authorization: `Bearer ${token}` } };

  group('browse and buy', () => {
    const products = http.get(`${BASE_URL}/api/products`, auth);
    check(products, {
      'products: 200': (r) => r.status === 200,
      'products: not empty': (r) => r.json().length > 0,
    });

    const add = http.post(`${BASE_URL}/api/cart`, JSON.stringify({ productId: 1, qty: 2 }), auth);
    check(add, { 'add to cart: 2xx': (r) => r.status >= 200 && r.status < 300 });

    const cart = http.get(`${BASE_URL}/api/cart`, auth);
    check(cart, { 'cart: 200': (r) => r.status === 200 });

    const order = http.post(`${BASE_URL}/api/checkout`, null, auth);
    check(order, { 'checkout: 200': (r) => r.status === 200 });
  });

  sleep(0.5);
}
