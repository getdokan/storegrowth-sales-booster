// Seeded by bin/provision-site.php. `id` is what a fresh stack gets (WordPress
// core install + WooCommerce pages, then these three in order); prefer the slug
// with `productIdBySlug(api, slug)` (helpers/rest.ts) where an id might differ
// (e.g. a site that wasn't built by bin/setup-docker.sh).
export const PRODUCTS = {
  a: { id: 11, slug: 'e2e-test-product-a', name: 'E2E Test Product A', price: '19.99', stock: 25 },
  b: { id: 12, slug: 'e2e-test-product-b', name: 'E2E Test Product B', price: '49.00', stock: 5 },
  c: { id: 13, slug: 'e2e-sale-product-c', name: 'E2E Sale Product C', price: '30.00', stock: 100 },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

/** The seeded products' category (WooCommerce's default). */
export const UNCATEGORIZED_CATEGORY_ID = 15;

export const STORE_PAGES = {
  shop: '/shop/',
  cart: '/cart/',
  checkout: '/checkout/',
} as const;

export const productPath = (slug: string): string => `/product/${slug}/`;
