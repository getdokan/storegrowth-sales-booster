import { test, expect } from '../../fixtures/test';
import { adminApp, gotoAppRoute } from '../../helpers/modules';
import { isModuleActive, setModuleStatus } from '../../helpers/rest';
import {
  createSmartCoupon,
  deleteSmartCoupon,
  offerLimit,
  proActive,
  setSmartCouponActive,
} from '../../helpers/cart-rewards';

// The Free limit notice and its "Choose offers" picker (ADR-013, #304), on the
// Smart Coupons list: over the limit, the newest coupon is paused and the
// merchant picks which stay on. Pro shows no notice.

const NS = '/wp-json/sales-booster/v1';
const COUPONS = 'smart-coupons';
const NOTICE = 'You have more offers than the Free plan allows. Choose which stay on.';

test.describe('Admin · Free offer limits', { tag: ['@ui', '@admin'] }, () => {
  let wasActive = false;
  const made: number[] = [];
  let older = 0;
  let newer = 0;

  test.beforeEach(async ({ api }) => {
    wasActive = await isModuleActive(api, COUPONS);
    await setModuleStatus(api, COUPONS, true);
    // An older coupon switched back on after a newer one: two active.
    older = await createSmartCoupon(api, 'e2e-ui-limit-older');
    made.push(older);
    await setSmartCouponActive(api, older, false);
    newer = await createSmartCoupon(api, 'e2e-ui-limit-newer');
    made.push(newer);
    await setSmartCouponActive(api, older, true);
  });

  test.afterEach(async ({ api }) => {
    for (const id of made.splice(0)) await deleteSmartCoupon(api, id);
    await api.post(`${NS}/offer-limits/smart_coupon`, { data: { keep: [] } });
    await setModuleStatus(api, COUPONS, wasActive);
  });

  test('Free: the list says it is over the limit and the picker keeps the choice', async ({ page, api }) => {
    test.skip(await proActive(api), 'Free-only limit');
    await gotoAppRoute(page, '/smart-coupons');
    const app = adminApp(page);

    await expect(app.getByText(NOTICE)).toBeVisible();
    await expect(app.getByText('Paused: over Free limit')).toBeVisible();

    await app.getByRole('button', { name: 'Choose offers' }).click();
    const dialog = page.getByRole('dialog', { name: 'Choose which stay on' });
    await expect(dialog).toBeVisible();

    // The kept coupon is ticked; at the limit the other one can't be ticked too.
    const keepOlder = dialog.getByRole('checkbox', { name: 'E2E-UI-LIMIT-OLDER' });
    const keepNewer = dialog.getByRole('checkbox', { name: 'E2E-UI-LIMIT-NEWER' });
    await expect(keepOlder).toBeChecked();
    await expect(keepNewer).toBeDisabled();

    await keepOlder.click();
    await keepNewer.click();
    const saved = page.waitForResponse(
      (res) => res.url().includes('offer-limits/smart_coupon') && res.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Save' }).click();
    expect((await saved).ok()).toBeTruthy();
    await expect(dialog).toBeHidden();

    const limit = await offerLimit(api, 'smart_coupon');
    expect(limit.offers.find((o) => o.id === newer)?.paused).toBe(false);
    expect(limit.offers.find((o) => o.id === older)?.paused).toBe(true);
  });

  test('Pro: no limit notice', async ({ page, api }) => {
    test.skip(!(await proActive(api)), 'StoreGrowth Pro required');
    await gotoAppRoute(page, '/smart-coupons');
    const app = adminApp(page);
    await expect(app.getByRole('row', { name: /E2E-UI-LIMIT-NEWER/ })).toBeVisible();
    await expect(app.getByText(NOTICE)).toHaveCount(0);
  });
});
