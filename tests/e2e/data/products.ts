/**
 * Stable storefront test data.
 *
 * Products + store pages are seeded by bin/setup-docker.sh. Products are
 * referenced by slug (stable across re-provisioning) rather than numeric id.
 */
export const PRODUCTS = {
  a: { slug: 'e2e-test-product-a', name: 'E2E Test Product A', price: '19.99', stock: 25 },
  b: { slug: 'e2e-test-product-b', name: 'E2E Test Product B', price: '49.00', stock: 5 },
  c: { slug: 'e2e-sale-product-c', name: 'E2E Sale Product C', price: '30.00', stock: 100 },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

/** WooCommerce storefront page paths (pretty permalinks enabled in provisioning). */
export const STORE_PAGES = {
  shop: '/shop/',
  cart: '/cart/',
  checkout: '/checkout/',
} as const;

/** Path to a single product page by slug. */
export const productPath = (slug: string): string => `/product/${slug}/`;
