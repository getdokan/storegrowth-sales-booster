import { test, expect } from '../../fixtures/test';
import { PRODUCTS, STORE_PAGES } from '../../data/products';
import { MODULES } from '../../data/modules';
import { addToCartApi, getCartTotals, lineFor } from '../../helpers/cart';
import { gotoProduct } from '../../helpers/storefront';
import { isModuleActive, setModuleStatus } from '../../helpers/rest';
import {
  CampaignTracker,
  campaignAction,
  campaignDate,
  campaignsAvailable,
  createCampaign,
  createRunningPriceCampaign,
  updateCampaign,
} from '../../helpers/campaigns';

// A running campaign's price (ADR-016): `percent` off its products, applied
// through the Countdown Timer's price filters, so the product page shows the
// sale and every cart charges it. Draft and ended campaigns change nothing.
// Needs Pro (campaigns run only with `has_pro()`).

const A = PRODUCTS.a; // 19.99 → 25% off = 14.99
const B = PRODUCTS.b; // not in the campaign

test.describe('Storefront · Campaign price', () => {
  let tracker: CampaignTracker;
  let countdownWasActive: boolean;

  test.beforeEach(async ({ api }) => {
    test.skip(!(await campaignsAvailable(api)), 'Campaigns need Pro');
    tracker = new CampaignTracker(api);
    countdownWasActive = await isModuleActive(api, MODULES.countdownTimer.id);
    await setModuleStatus(api, MODULES.countdownTimer.id, true);
  });

  test.afterEach(async ({ api }) => {
    if (!tracker) {
      return;
    }
    await tracker.cleanup();
    await setModuleStatus(api, MODULES.countdownTimer.id, countdownWasActive);
  });

  test('a running campaign shows its price on the product page', async ({ api, guestPage }) => {
    await createRunningPriceCampaign(api, tracker, [A.id], 25);

    await gotoProduct(guestPage, A.slug);
    const price = guestPage.locator('.summary .price').first();
    await expect(price.locator('del')).toContainText('19.99');
    await expect(price.locator('ins')).toContainText('14.99');

    // A product outside the campaign keeps its price.
    await gotoProduct(guestPage, B.slug);
    await expect(guestPage.locator('.summary .price').first()).toHaveText(/49\.00/);
    await expect(guestPage.locator('.summary .price del')).toHaveCount(0);
  });

  test('the cart charges the campaign price (Store API, block cart, classic checkout)', async ({
    api,
    guestPage,
  }) => {
    await createRunningPriceCampaign(api, tracker, [A.id], 25);
    await guestPage.goto('/');
    await addToCartApi(guestPage, A.id, 1);
    await addToCartApi(guestPage, B.id, 1);

    const totals = await getCartTotals(guestPage);
    expect(lineFor(totals, A.name)?.lineSubtotal).toBe(1499);
    expect(lineFor(totals, B.name)?.lineSubtotal).toBe(4900);

    // The block cart (WooCommerce's default /cart/ page).
    await guestPage.goto(STORE_PAGES.cart);
    const row = guestPage.locator('.wc-block-cart-items__row', { hasText: A.name });
    await expect(row.locator('.wc-block-cart-item__total')).toContainText('14.99');

    // The classic checkout's order review.
    await guestPage.goto(STORE_PAGES.checkout);
    const review = guestPage.locator('.woocommerce-checkout-review-order-table');
    await expect(review.locator('tr.cart_item', { hasText: A.name })).toContainText('14.99');
    await expect(review.locator('.order-total')).toContainText('63.99');
  });

  test('a draft or ended campaign leaves prices alone', async ({ api, guestPage }) => {
    // Draft: dated and priced, never published.
    const draft = await createCampaign(api, tracker);
    await updateCampaign(api, draft.id, {
      starts_at: campaignDate(-1),
      ends_at: campaignDate(7),
      settings: { campaign_price: { percent: 25, products: [A.id] } },
    });

    await gotoProduct(guestPage, A.slug);
    await expect(guestPage.locator('.summary .price del')).toHaveCount(0);
    await expect(guestPage.locator('.summary .price').first()).toContainText('19.99');

    // Ended: it ran, then ended now.
    const ran = await createRunningPriceCampaign(api, tracker, [A.id], 25);
    await gotoProduct(guestPage, A.slug);
    await expect(guestPage.locator('.summary .price ins')).toContainText('14.99');

    expect((await campaignAction(api, ran.id, 'end')).status).toBe('ended');
    await gotoProduct(guestPage, A.slug);
    await expect(guestPage.locator('.summary .price del')).toHaveCount(0);

    await guestPage.goto('/');
    await addToCartApi(guestPage, A.id, 1);
    expect(lineFor(await getCartTotals(guestPage), A.name)?.lineSubtotal).toBe(1999);
  });

  test('a paused campaign stops its price until it resumes', async ({ api, guestPage }) => {
    const campaign = await createRunningPriceCampaign(api, tracker, [A.id], 25);

    expect((await campaignAction(api, campaign.id, 'pause')).status).toBe('paused');
    await gotoProduct(guestPage, A.slug);
    await expect(guestPage.locator('.summary .price del')).toHaveCount(0);

    expect((await campaignAction(api, campaign.id, 'resume')).status).toBe('running');
    await gotoProduct(guestPage, A.slug);
    await expect(guestPage.locator('.summary .price ins')).toContainText('14.99');
  });
});
