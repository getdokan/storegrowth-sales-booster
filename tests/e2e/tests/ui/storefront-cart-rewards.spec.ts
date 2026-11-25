import { test, expect } from '../../fixtures/test';
import {
  BAR,
  BAR_CHIP,
  BAR_FILL,
  BAR_MESSAGE,
  CART_REWARDS,
  addItem,
  createClassicCartPage,
  createShippingZone,
  deletePage,
  deleteShippingZone,
  proActive,
  removeItem,
  resetCartRewards,
  setMilestones,
  storeCart,
} from '../../helpers/cart-rewards';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// Cart Rewards milestones (#302 / ADR-014, ADR-015): the bar on the block cart
// (Store API extension, `extensions.storegrowth.rewards`) and the classic cart
// (`woocommerce_before_cart_table`), and each reward: free shipping, a gift
// line and a discount fee. A guest/customer promotion, so storefront checks
// use the logged-out `guestPage`. Free allows one milestone; more need Pro.
//
// Prices: A 19.99, B 49.00, C 30.00 (the gift).

test.describe('Storefront · Cart Rewards milestones', { tag: '@ui' }, () => {
  test.afterEach(async ({ api }) => {
    await resetCartRewards(api);
  });

  test.describe('block cart bar', () => {
    test('shows what is left to the next milestone and its progress', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], {
        progressive_banner_text: 'Add {remaining} more for {reward}',
      });
      await addItem(guestPage, PRODUCTS.a.id);

      const { rewards } = await storeCart(guestPage);
      expect(rewards?.message).toBe('Add $30.01 more for free shipping');
      expect(rewards?.percent).toBe(39);

      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText('Add $30.01 more for free shipping');
      await expect(guestPage.locator(BAR_FILL)).toHaveAttribute('style', /width:\s*39%/);
      await expect(guestPage.locator(BAR_CHIP)).toHaveText('$50.00 · free shipping');
      await expect(guestPage.locator(BAR_CHIP)).not.toHaveClass(/is-reached/);
    });

    test('says the goal is reached once the cart passes every milestone', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], {
        goal_completion_text: 'Every reward is yours',
      });
      await addItem(guestPage, PRODUCTS.b.id);
      await addItem(guestPage, PRODUCTS.a.id);

      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText('Every reward is yours');
      await expect(guestPage.locator(BAR_FILL)).toHaveAttribute('style', /width:\s*100%/);
      await expect(guestPage.locator(BAR_CHIP)).toHaveClass(/is-reached/);
    });

    test('updates when the cart changes on the page', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], {
        progressive_banner_text: 'Add {remaining} more for {reward}',
      });
      await addItem(guestPage, PRODUCTS.a.id);
      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText('Add $30.01 more for free shipping');

      // Quantity 2 → 39.98, $10.02 to go, without a reload.
      await guestPage.getByRole('button', { name: /Increase quantity of E2E Test Product A/i }).click();
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText('Add $10.02 more for free shipping');
    });

    test('no bar with an empty cart or placement "Fly cart"', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }]);
      expect((await storeCart(guestPage)).rewards).toBeNull();

      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], { bar_placement: 'fly-cart' });
      await addItem(guestPage, PRODUCTS.a.id);
      await guestPage.goto(STORE_PAGES.cart);
      // The cart has drawn its line before the bar would.
      await expect(guestPage.getByText(PRODUCTS.a.name).first()).toBeVisible();
      await expect(guestPage.locator(BAR)).toHaveCount(0);
    });

    test('no bar when the module is off', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }]);
      await api.put(`/wp-json/sales-booster/v1/modules/${CART_REWARDS}`, { data: { status: false } });
      await addItem(guestPage, PRODUCTS.a.id);
      expect((await storeCart(guestPage)).rewards).toBeNull();
    });
  });

  test.describe('classic cart bar', () => {
    let classic: { id: number; path: string } | undefined;

    test.beforeEach(async ({ api }) => {
      classic = await createClassicCartPage(api);
    });

    test.afterEach(async ({ api }) => {
      if (classic) await deletePage(api, classic.id);
      classic = undefined;
    });

    test('renders above the cart table with the same progress', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], {
        progressive_banner_text: 'Add {remaining} more for {reward}',
      });
      await addItem(guestPage, PRODUCTS.a.id);

      await guestPage.goto(classic!.path);
      await expect(guestPage.locator('form.woocommerce-cart-form')).toBeVisible();
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText('Add $30.01 more for free shipping');
      await expect(guestPage.locator(BAR_FILL)).toHaveAttribute('style', /width:\s*39%/);
      await expect(guestPage.locator(BAR_CHIP)).toHaveText('$50.00 · free shipping');
    });

    test('placement "Fly cart" leaves the cart page without a bar', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }], { bar_placement: 'fly-cart' });
      await addItem(guestPage, PRODUCTS.a.id);

      await guestPage.goto(classic!.path);
      await expect(guestPage.locator('form.woocommerce-cart-form')).toBeVisible();
      await expect(guestPage.locator(BAR)).toHaveCount(0);
    });
  });

  test.describe('free shipping milestone', () => {
    let zone: number | undefined;

    test.beforeEach(async ({ api }) => {
      zone = await createShippingZone(api);
    });

    test.afterEach(async ({ api }) => {
      if (zone) await deleteShippingZone(api, zone);
      zone = undefined;
    });

    test('Free shipping is hidden below the threshold and chosen once reached', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }]);
      await addItem(guestPage, PRODUCTS.a.id);

      let cart = await storeCart(guestPage);
      expect(cart.rates.map((r) => r.method)).toEqual(['flat_rate']);

      const b = await addItem(guestPage, PRODUCTS.b.id);
      cart = await storeCart(guestPage);
      expect(cart.rates.map((r) => r.method).sort()).toEqual(['flat_rate', 'free_shipping']);
      expect(cart.rates.find((r) => r.selected)?.method).toBe('free_shipping');

      await removeItem(guestPage, b);
      cart = await storeCart(guestPage);
      expect(cart.rates.map((r) => r.method)).toEqual(['flat_rate']);
    });

    test('the block cart shows Free shipping chosen at the threshold', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 40, reward: 'free-shipping' }]);
      await addItem(guestPage, PRODUCTS.a.id);
      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator('.wc-block-components-totals-shipping')).toContainText('Flat rate');

      await addItem(guestPage, PRODUCTS.b.id); // 68.99 ≥ 40
      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator('.wc-block-components-totals-shipping')).toContainText(/Free shipping/i);
    });
  });

  test.describe('gift milestone', () => {
    test('adds the gift at $0 once reached and takes it out below', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 40, reward: 'gift', gift_product_id: PRODUCTS.c.id }]);
      await addItem(guestPage, PRODUCTS.a.id);
      expect((await storeCart(guestPage)).items.map((i) => i.name)).toEqual([PRODUCTS.a.name]);

      const b = await addItem(guestPage, PRODUCTS.b.id);
      let cart = await storeCart(guestPage);
      const gift = cart.items.find((i) => i.name === PRODUCTS.c.name);
      expect(gift, 'gift line').toMatchObject({ quantity: 1, total: '0', gift: true });

      await guestPage.goto(STORE_PAGES.cart);
      const giftRow = guestPage.locator('.wc-block-cart-items__row', { hasText: PRODUCTS.c.name });
      await expect(giftRow).toContainText('Free gift');

      await removeItem(guestPage, b);
      cart = await storeCart(guestPage);
      expect(cart.items.map((i) => i.name)).toEqual([PRODUCTS.a.name]);
    });

    test('the gift does not count towards the milestone', async ({ api, guestPage }) => {
      // B (49) reaches 40; the $0 gift must not push a second line over.
      await setMilestones(api, [{ threshold: 40, reward: 'gift', gift_product_id: PRODUCTS.c.id }]);
      await addItem(guestPage, PRODUCTS.b.id);
      const cart = await storeCart(guestPage);
      expect(cart.items.filter((i) => i.name === PRODUCTS.c.name)).toHaveLength(1);
      expect(cart.total).toBe('4900');
    });
  });

  test.describe('discount milestone', () => {
    test('a fixed amount comes off as a fee once reached', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 40, reward: 'discount-amount', discount_mode: 'fixed-amount', discount_value: 5 }]);
      await addItem(guestPage, PRODUCTS.a.id);
      expect((await storeCart(guestPage)).fees).toEqual([]);

      await addItem(guestPage, PRODUCTS.b.id);
      const cart = await storeCart(guestPage);
      expect(cart.fees).toEqual([{ name: 'Discount', total: '-500' }]);
      expect(cart.total).toBe('6399');
    });

    test('a percentage is of the subtotal', async ({ api, guestPage }) => {
      await setMilestones(api, [{ threshold: 40, reward: 'discount-amount', discount_mode: 'percentage', discount_value: 10 }]);
      await addItem(guestPage, PRODUCTS.b.id);
      const cart = await storeCart(guestPage);
      expect(cart.fees).toEqual([{ name: 'Discount', total: '-490' }]);
      expect(cart.total).toBe('4410');
    });
  });

  test.describe('more than one milestone', () => {
    test('Free refuses a second milestone', async ({ api }) => {
      test.skip(await proActive(api), 'Free-only limit');
      await setMilestones(api, [{ threshold: 50, reward: 'free-shipping' }]);
      const res = await api.post(`/wp-json/sales-booster/v1/settings/${CART_REWARDS}`, {
        data: {
          values: {
            milestones: [
              { threshold: 50, reward: 'free-shipping' },
              { threshold: 80, reward: 'discount-amount', discount_mode: 'fixed-amount', discount_value: 5 },
            ],
          },
        },
      });
      expect(res.status()).toBe(400);
      expect(JSON.stringify(await res.json())).toContain('Upgrade to Pro to add more milestones.');
    });

    test('Pro: the bar lists each milestone and aims at the next one', async ({ api, guestPage }) => {
      test.skip(!(await proActive(api)), 'StoreGrowth Pro required');
      await setMilestones(
        api,
        [
          { threshold: 90, reward: 'discount-amount', discount_mode: 'fixed-amount', discount_value: 5 },
          { threshold: 30, reward: 'free-shipping' },
          { threshold: 60, reward: 'gift', gift_product_id: PRODUCTS.c.id },
        ],
        { progressive_banner_text: 'Add {remaining} more for {reward}' },
      );
      await addItem(guestPage, PRODUCTS.b.id); // 49: free shipping reached, gift next.

      await guestPage.goto(STORE_PAGES.cart);
      await expect(guestPage.locator(BAR_CHIP)).toHaveText([
        '$30.00 · free shipping',
        `$60.00 · a free ${PRODUCTS.c.name}`,
        '$90.00 · $5.00 off',
      ]);
      await expect(guestPage.locator(BAR_CHIP).nth(0)).toHaveClass(/is-reached/);
      await expect(guestPage.locator(BAR_CHIP).nth(1)).not.toHaveClass(/is-reached/);
      await expect(guestPage.locator(BAR_MESSAGE)).toHaveText(`Add $11.00 more for a free ${PRODUCTS.c.name}`);
    });
  });
});
