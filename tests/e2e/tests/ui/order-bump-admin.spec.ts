import { test, expect } from '../../fixtures/test';
import { adminApp, gotoAppRoute } from '../../helpers/modules';
import { createOrderBump, deleteAllOrderBumps, listOrderBumps, OrderBump } from '../../helpers/records';
import { hasPro, setModuleStatus } from '../../helpers/rest';
import { openTab, setColor, setNumber, setRadio, setSelect, setText, settingsField } from '../../helpers/settings-ui';
import {
  appHash,
  confirmDelete,
  deleteDialog,
  gotoRecordList,
  listSearch,
  pickProduct,
  recordRow,
  rowAction,
  saveRecord,
} from '../../helpers/record-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// The Order Bump admin (docs/redesign/modules/upsell-order-bump.md 11d–11f):
// the list at `#/upsell-order-bump` (RecordList), the editor at
// `…/create-bump` and `…/<id>` (Basic Information + Design, Percentage /
// Fixed / Free, Offer Days, the checkout-frame preview) and 2.2.0's hash
// routes. Checkout rendering: storefront-order-bump.spec.ts; REST rules:
// order-bump-rules.api.spec.ts. Every test starts and ends with no bumps.

const OB = MODULES.upsellOrderBump.id;
const LIST = 'Order Bumps';
const ROUTE = 'order-bumps';

/** Target A, offer B (49.00). */
function bumpAB(api: Parameters<typeof createOrderBump>[0], extra: Record<string, unknown> = {}) {
  return createOrderBump(api, { target_products: [PRODUCTS.a.id], offer_product_id: PRODUCTS.b.id, ...extra });
}

async function onlyBump(api: Parameters<typeof listOrderBumps>[0]): Promise<OrderBump> {
  const bumps = await listOrderBumps(api);
  expect(bumps).toHaveLength(1);
  return bumps[0];
}

test.describe('Admin · Upsell Order Bump', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, OB, true);
    await deleteAllOrderBumps(api);
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, OB, true);
    await deleteAllOrderBumps(api);
  });

  test.describe('list', () => {
    test('no bumps: the empty state with Add New', async ({ page }) => {
      await gotoRecordList(page, '/upsell-order-bump', LIST);
      const app = adminApp(page);
      await expect(app.getByText('No order bumps yet')).toBeVisible();
      await app.getByRole('button', { name: 'Add New' }).last().click();
      await expect.poll(() => appHash(page)).toBe('/upsell-order-bump/create-bump');
    });

    test('rows: target, offer prices, status switch, search, Edit and Delete', async ({ page, api }) => {
      const bump = await bumpAB(api, { name: 'E2E Alpha Bump', offer_type: 'discount', offer_amount: 10 });
      await createOrderBump(api, { name: 'E2E Beta Bump', target_products: [PRODUCTS.c.id], offer_product_id: PRODUCTS.b.id });
      await gotoRecordList(page, '/upsell-order-bump', LIST);

      const row = recordRow(page, 'E2E Alpha Bump');
      await expect(row.getByRole('cell').nth(2)).toContainText(PRODUCTS.a.name);
      await expect(row.getByRole('cell').nth(3)).toContainText(PRODUCTS.b.name);
      await expect(row.getByRole('cell').nth(3)).toContainText('$49.00');
      await expect(row.getByRole('cell').nth(3)).toContainText('$44.10');

      // Status.
      const toggle = adminApp(page).getByRole('switch', { name: 'Bump status: E2E Alpha Bump' });
      await expect(toggle).toBeChecked();
      const off = page.waitForResponse((r) => r.url().includes(`${ROUTE}/${bump.id}/status`));
      await toggle.click();
      expect((await off).ok()).toBeTruthy();
      await page.reload();
      await expect(adminApp(page).getByRole('switch', { name: 'Bump status: E2E Alpha Bump' })).not.toBeChecked();
      expect((await listOrderBumps(api)).find((b) => b.id === bump.id)?.status).toBe('inactive');

      // Search.
      await listSearch(page).fill('Alpha');
      await expect(recordRow(page, 'E2E Beta Bump')).toHaveCount(0);
      await expect(recordRow(page, 'E2E Alpha Bump')).toBeVisible();
      await listSearch(page).fill('no-such-bump-xyz');
      await expect(adminApp(page).getByText(/No order bumps match/)).toBeVisible();
      await listSearch(page).fill('');

      // Edit.
      await rowAction(page, 'E2E Alpha Bump', 'Edit');
      await expect.poll(() => appHash(page)).toBe(`/upsell-order-bump/${bump.id}`);
      await expect(settingsField(page, 'textbox', 'Name of Order Bump')).toHaveValue('E2E Alpha Bump');

      // Delete.
      await gotoRecordList(page, '/upsell-order-bump', LIST);
      await rowAction(page, 'E2E Alpha Bump', 'Delete');
      await expect(deleteDialog(page)).toContainText('Delete order bumps?');
      await confirmDelete(page);
      await expect(recordRow(page, 'E2E Alpha Bump')).toHaveCount(0);
      expect((await listOrderBumps(api)).map((b) => b.name)).toEqual(['E2E Beta Bump']);
    });

    test('bulk delete removes every ticked bump', async ({ page, api }) => {
      await bumpAB(api, { name: 'E2E Bulk One' });
      await bumpAB(api, { name: 'E2E Bulk Two' });
      await gotoRecordList(page, '/upsell-order-bump', LIST);
      await expect(recordRow(page, 'E2E Bulk Two')).toBeVisible();
      await adminApp(page).getByRole('checkbox', { name: 'Select all' }).check();
      await adminApp(page).getByRole('button', { name: 'Delete', exact: true }).click();
      await confirmDelete(page);
      await expect(adminApp(page).getByText('No order bumps yet')).toBeVisible();
      expect(await listOrderBumps(api)).toEqual([]);
    });

    test("lite's cap: two bumps disable Add New; the create page offers the upgrade", async ({ page, api }) => {
      test.skip(await hasPro(api), 'pro lifts the cap');
      await bumpAB(api);
      await bumpAB(api, { status: 'inactive' });
      await gotoRecordList(page, '/upsell-order-bump', LIST);
      await expect(adminApp(page).getByRole('button', { name: 'Add New' })).toBeDisabled();

      await gotoAppRoute(page, '/upsell-order-bump/create-bump');
      await expect(adminApp(page).getByText('reached the free version’s order bump limit')).toBeVisible();
      await expect(adminApp(page).getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
    });

    test('module off: the editor goes back to the list, which asks to turn it on', async ({ page, api }) => {
      const bump = await bumpAB(api);
      await setModuleStatus(api, OB, false);
      await gotoAppRoute(page, `/upsell-order-bump/${bump.id}`);
      await expect.poll(() => appHash(page)).toBe('/upsell-order-bump');
      const turnOn = adminApp(page).getByRole('button', { name: 'Turn on Upsell Order Bump' });
      await expect(turnOn).toBeVisible();
      const saved = page.waitForResponse((r) => r.url().includes(`/modules/${OB}`) && r.request().method() === 'POST');
      await turnOn.click();
      expect((await saved).ok()).toBeTruthy();
      expect((await (await api.get(`/wp-json/sales-booster/v1/modules/${OB}`)).json()).status).toBe(true);
      // After a reload the list is there (see the [BUG] test for without one).
      await page.reload();
      await expect(recordRow(page, bump.name)).toBeVisible();
    });

    test('[BUG] "Turn on" lists the existing bumps without a reload', async ({ page, api }) => {
      // `setModuleStatus()` (modules-context.tsx) marks the module on before the
      // server answers, so the list mounts and asks `GET …/order-bumps` while
      // the module (and its routes) are still off: 404, the toast "The order
      // bumps could not be loaded." and the empty state over existing bumps.
      // BOGO's list has the same race.
      test.fail(true, 'the list fetches before the module is on (optimistic status)');
      const bump = await bumpAB(api);
      await setModuleStatus(api, OB, false);
      await gotoRecordList(page, '/upsell-order-bump', LIST);
      await adminApp(page).getByRole('button', { name: 'Turn on Upsell Order Bump' }).click();
      await expect(recordRow(page, bump.name)).toBeVisible({ timeout: 5000 });
    });

    test("2.2.0's hash routes still land", async ({ page, api }) => {
      const bump = await bumpAB(api);

      await gotoAppRoute(page, `/upsell-order-bump/edit/${bump.id}`);
      await expect.poll(() => appHash(page)).toBe(`/upsell-order-bump/${bump.id}`);

      // 2.2.0's delete link deleted on opening; now it only opens the list.
      await gotoAppRoute(page, `/upsell-order-bump/delete/${bump.id}`);
      await expect.poll(() => appHash(page)).toBe('/upsell-order-bump');
      await expect(recordRow(page, bump.name)).toBeVisible();

      await gotoAppRoute(page, '/upsell-order-bump/abc');
      await expect.poll(() => appHash(page)).toBe('/upsell-order-bump');

      await gotoAppRoute(page, `/upsell-order-bump/${bump.id}?tab_name=design`);
      await expect.poll(() => appHash(page)).toBe(`/upsell-order-bump/${bump.id}?tab=design`);
      await expect(adminApp(page).getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('editor', () => {
    const offers = [
      { type: 'Percentage Off', stored: 'discount', amountLabel: 'Discount', amount: 15, preview: '$41.65' },
      { type: 'Fixed Price', stored: 'price', amountLabel: 'Price', amount: 5, preview: '$5.00' },
      { type: 'Free', stored: 'free', amountLabel: null, amount: 0, preview: '$0.00' },
    ] as const;

    for (const offer of offers) {
      test(`creates a ${offer.type} bump through the form`, async ({ page, api }) => {
        await gotoAppRoute(page, '/upsell-order-bump/create-bump');
        await setText(page, 'Name of Order Bump', `E2E ${offer.type}`);
        await pickProduct(page, 'Select Target Product(s)', 'Product A', PRODUCTS.a.name);
        await pickProduct(page, 'Offer Product', 'Product B', PRODUCTS.b.name);
        await setSelect(page, 'Offer Price/Discount', offer.type);
        if (offer.amountLabel) {
          await setNumber(page, offer.amountLabel, offer.amount);
        } else {
          // Free has no amount field.
          await expect(settingsField(page, 'spinbutton', 'Discount')).toHaveCount(0);
          await expect(settingsField(page, 'spinbutton', 'Price')).toHaveCount(0);
        }
        // The preview prices the offer as the checkout will.
        await expect(adminApp(page).getByText(offer.preview).first()).toBeVisible();

        const res = await saveRecord(page, ROUTE);
        expect(res.status()).toBe(201);
        const created = await res.json();
        await expect.poll(() => appHash(page)).toBe(`/upsell-order-bump/${created.id}`);

        const stored = await onlyBump(api);
        expect(stored).toMatchObject({
          name: `E2E ${offer.type}`,
          status: 'active',
          target_type: 'products',
          target_products: [PRODUCTS.a.id],
          offer_product_id: PRODUCTS.b.id,
          offer_type: offer.stored,
          offer_amount: offer.amount,
        });
      });
    }

    test('edits on both tabs save and survive a reload', async ({ page, api }) => {
      const bump = await bumpAB(api, { name: 'E2E Edit Bump' });

      await gotoAppRoute(page, `/upsell-order-bump/${bump.id}`);
      await expect(settingsField(page, 'textbox', 'Name of Order Bump')).toHaveValue('E2E Edit Bump');
      await setText(page, 'Name of Order Bump', 'E2E Edited Bump');
      await setRadio(page, 'Select Bump Type', 'Categories');
      await pickProduct(page, 'Select Target Categories', 'Uncat', 'Uncategorized');
      const basic = await saveRecord(page, `${ROUTE}/${bump.id}`);
      expect(Object.keys(basic.request().postDataJSON()).sort()).toEqual(['name', 'target_categories', 'target_type']);

      await openTab(page, 'Design');
      await setSelect(page, 'Overview Border', 'Dotted');
      await setColor(page, 'Border Color', '#123456');
      await setText(page, 'For Discount %', '% today only');
      await saveRecord(page, `${ROUTE}/${bump.id}`);

      await page.reload();
      await expect(adminApp(page).getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
      await expect(settingsField(page, 'combobox', 'Overview Border')).toContainText('Dotted');
      await expect(settingsField(page, 'textbox', 'For Discount %')).toHaveValue('% today only');
      await openTab(page, 'Basic Information');
      await expect(settingsField(page, 'textbox', 'Name of Order Bump')).toHaveValue('E2E Edited Bump');
      await expect(adminApp(page).getByRole('radio', { name: /^Categories/ })).toBeChecked();

      const stored = await onlyBump(api);
      expect(stored).toMatchObject({ name: 'E2E Edited Bump', target_type: 'categories', offer_discount_title: '% today only' });
      expect(stored.target_categories.length).toBe(1);
      expect(stored.design_settings).toMatchObject({ box_border_style: 'dotted', box_border_color: '#123456' });
      // Not sent, so kept.
      expect(stored.offer_product_id).toBe(PRODUCTS.b.id);
    });

    test('Offer Days: chosen days are stored and drawn again', async ({ page, api }) => {
      const bump = await bumpAB(api);
      await gotoAppRoute(page, `/upsell-order-bump/${bump.id}`);
      const app = adminApp(page);
      const advanced = app.getByRole('button', { name: /^Advanced/ });
      if ((await advanced.getAttribute('aria-expanded')) !== 'true') await advanced.click();
      // A multi-select: the picked days are chips in its toolbar.
      const days = app.getByRole('combobox', { name: 'Offer Days' });
      const chips = app.getByRole('toolbar').filter({ has: page.getByRole('combobox', { name: 'Offer Days' }) });
      await expect(chips).toContainText('Every day');

      // Clicking a picked option un-picks it.
      await days.click();
      for (const name of ['Every day', 'Monday', 'Friday']) {
        await page.getByRole('option', { name, exact: true }).click();
      }
      await page.keyboard.press('Escape');
      await saveRecord(page, `${ROUTE}/${bump.id}`);
      expect((await onlyBump(api)).design_settings).toMatchObject({ bump_schedule: ['monday', 'friday'] });

      await page.reload();
      if ((await advanced.getAttribute('aria-expanded')) !== 'true') await advanced.click();
      await expect(chips).toContainText('Monday');
      await expect(chips).toContainText('Friday');
      await expect(chips).not.toContainText('Every day');
    });

    test('client checks stop a save and mark the fields', async ({ page, api }) => {
      await gotoAppRoute(page, '/upsell-order-bump/create-bump');
      const app = adminApp(page);
      let posted = false;
      page.on('request', (r) => {
        if (r.url().includes(ROUTE) && r.method() === 'POST') posted = true;
      });
      const fieldError = (text: string) => app.getByRole('tabpanel').getByRole('alert').filter({ hasText: text });

      await setText(page, 'Name of Order Bump', '   ');
      await setNumber(page, 'Discount', 150);
      await app.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(fieldError('Enter a name for the order bump.')).toBeVisible();
      await expect(fieldError('Select at least one target product.')).toBeVisible();
      await expect(fieldError('Select the offer product.')).toBeVisible();
      await expect(fieldError('Enter a discount of more than 0 and at most 100%.')).toBeVisible();

      await setSelect(page, 'Offer Price/Discount', 'Fixed Price');
      await setNumber(page, 'Price', -1);
      await app.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(fieldError('Enter a price from 0 to 99,999,999.99.')).toBeVisible();

      await setRadio(page, 'Select Bump Type', 'Categories');
      await app.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(fieldError('Select at least one target category.')).toBeVisible();

      expect(posted, 'nothing was sent').toBe(false);
      expect(await listOrderBumps(api)).toEqual([]);
    });

    test('the checkout preview draws the bump from the form', async ({ page }) => {
      await gotoAppRoute(page, '/upsell-order-bump/create-bump');
      const app = adminApp(page);
      await expect(app.getByRole('heading', { name: 'Preview' })).toBeVisible();

      await pickProduct(page, 'Offer Product', 'Product B', PRODUCTS.b.name);
      await expect(app.getByText(PRODUCTS.b.name).last()).toBeVisible();
      await setNumber(page, 'Discount', 10);
      await expect(app.getByText('10% off only for you!')).toBeVisible();
      await expect(app.getByText('$44.10').first()).toBeVisible();

      await setSelect(page, 'Offer Price/Discount', 'Free');
      await expect(app.getByText('Free', { exact: true }).last()).toBeVisible();
      await expect(app.getByText('$0.00').first()).toBeVisible();
    });
  });
});
