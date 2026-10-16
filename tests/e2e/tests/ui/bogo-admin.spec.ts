import { test, expect } from '../../fixtures/test';
import { adminApp, gotoAppRoute } from '../../helpers/modules';
import { createBogoOffer, deleteAllBogoOffers, listBogoOffers } from '../../helpers/records';
import { hasPro, setModuleStatus } from '../../helpers/rest';
import { openTab, setNumber, setSelect, setText, settingsField } from '../../helpers/settings-ui';
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

// The BOGO admin (docs/redesign/modules/bogo.md 10c–10e): the offer list at
// `#/bogo` (RecordList: search, status switch, Edit/Delete, bulk delete, empty
// state, lite's cap), the editor at `#/bogo/create-bogo` and `#/bogo/<id>`
// (three tabs, client checks, preview) and the category messages screen,
// read-only on lite. Storefront rendering: storefront-bogo.spec.ts; REST rules:
// bogo-rules.api.spec.ts. Every test starts and ends with no offers.
//
// Not covered: the Dokan vendor dashboard (integrations/src/dokan/bogo) needs
// Dokan, which the stack doesn't install.

const BOGO = MODULES.bogo.id;
const LIST = 'BOGO Offers';
const ROUTE = 'bogo/offers';

/** Buy A, get B (a valid lite offer). */
function offerAB(api: Parameters<typeof createBogoOffer>[0], extra: Record<string, unknown> = {}) {
  return createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id, ...extra });
}

/** Buy C, get B. */
function offerCB(api: Parameters<typeof createBogoOffer>[0], extra: Record<string, unknown> = {}) {
  return createBogoOffer(api, { offered_products: [PRODUCTS.c.id], get_different_product_field: PRODUCTS.b.id, ...extra });
}

test.describe('Admin · BOGO', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, BOGO, true);
    await deleteAllBogoOffers(api);
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, BOGO, true);
    await deleteAllBogoOffers(api);
  });

  test.describe('list', () => {
    test('no offers: the empty state with Add New', async ({ page }) => {
      await gotoRecordList(page, '/bogo', LIST);
      const app = adminApp(page);
      await expect(app.getByText('No BOGO offers yet')).toBeVisible();
      await expect(app.getByRole('button', { name: 'Add New' })).toHaveCount(2);
      await app.getByRole('button', { name: 'Add New' }).last().click();
      await expect.poll(() => appHash(page)).toBe('/bogo/create-bogo');
    });

    test('a row shows the target, the offer prices and the type', async ({ page, api }) => {
      await offerAB(api, { name_of_order_bogo: 'E2E Row Offer' });
      await gotoRecordList(page, '/bogo', LIST);
      const row = recordRow(page, 'E2E Row Offer');
      await expect(row.getByRole('cell').nth(2)).toHaveText(PRODUCTS.a.name);
      await expect(row.getByRole('cell').nth(3)).toContainText(PRODUCTS.b.name);
      await expect(row.getByRole('cell').nth(3)).toContainText('$49.00');
      await expect(row.getByRole('cell').nth(3)).toContainText('$0.00');
      await expect(row.getByRole('cell').nth(4)).toHaveText('Global');
    });

    test('the status switch turns an offer off and on, and it sticks', async ({ page, api }) => {
      const offer = await offerAB(api, { name_of_order_bogo: 'E2E Switch Offer' });
      await gotoRecordList(page, '/bogo', LIST);
      const toggle = adminApp(page).getByRole('switch', { name: 'Offer status: E2E Switch Offer' });
      await expect(toggle).toBeChecked();

      const off = page.waitForResponse((r) => r.url().includes(`${ROUTE}/${offer.id}/status`));
      await toggle.click();
      expect((await off).ok()).toBeTruthy();
      await expect(toggle).not.toBeChecked();
      expect((await listBogoOffers(api))[0].status).toBe('inactive');

      await page.reload();
      await expect(adminApp(page).getByRole('switch', { name: 'Offer status: E2E Switch Offer' })).not.toBeChecked();

      const on = page.waitForResponse((r) => r.url().includes(`${ROUTE}/${offer.id}/status`));
      await adminApp(page).getByRole('switch', { name: 'Offer status: E2E Switch Offer' }).click();
      expect((await on).ok()).toBeTruthy();
      expect((await listBogoOffers(api))[0].status).toBe('active');
    });

    test('search filters by name; no match shows the no-results state', async ({ page, api }) => {
      await offerAB(api, { name_of_order_bogo: 'E2E Apple Deal' });
      await offerCB(api, { name_of_order_bogo: 'E2E Pear Deal' });
      await gotoRecordList(page, '/bogo', LIST);
      await expect(recordRow(page, 'E2E Pear Deal')).toBeVisible();

      await listSearch(page).fill('Apple');
      await expect(recordRow(page, 'E2E Pear Deal')).toHaveCount(0);
      await expect(recordRow(page, 'E2E Apple Deal')).toBeVisible();

      await listSearch(page).fill('no-such-offer-xyz');
      await expect(adminApp(page).getByText('No offers match your search')).toBeVisible();
    });

    test('Edit opens the editor; Delete asks, then deletes', async ({ page, api }) => {
      const offer = await offerAB(api, { name_of_order_bogo: 'E2E Row Actions' });
      await gotoRecordList(page, '/bogo', LIST);

      await rowAction(page, 'E2E Row Actions', 'Edit');
      await expect.poll(() => appHash(page)).toBe(`/bogo/${offer.id}`);
      await expect(settingsField(page, 'textbox', 'Name of BOGO')).toHaveValue('E2E Row Actions');

      await gotoRecordList(page, '/bogo', LIST);
      await rowAction(page, 'E2E Row Actions', 'Delete');
      await expect(deleteDialog(page)).toContainText('Delete offers?');
      await confirmDelete(page);
      await expect(adminApp(page).getByText('No BOGO offers yet')).toBeVisible();
      expect(await listBogoOffers(api)).toEqual([]);
    });

    test('bulk delete removes every ticked offer', async ({ page, api }) => {
      await offerAB(api, { name_of_order_bogo: 'E2E Bulk One' });
      await offerCB(api, { name_of_order_bogo: 'E2E Bulk Two' });
      await gotoRecordList(page, '/bogo', LIST);
      await expect(recordRow(page, 'E2E Bulk Two')).toBeVisible();

      await adminApp(page).getByRole('checkbox', { name: 'Select all' }).check();
      await adminApp(page).getByRole('button', { name: 'Delete', exact: true }).click();
      await confirmDelete(page);
      await expect(adminApp(page).getByText('No BOGO offers yet')).toBeVisible();
      expect(await listBogoOffers(api)).toEqual([]);
    });

    test("lite's cap: two offers disable Add New; the create page offers the upgrade", async ({ page, api }) => {
      test.skip(await hasPro(api), 'pro lifts the cap');
      await offerAB(api);
      await offerCB(api, { status: 'inactive' });
      await gotoRecordList(page, '/bogo', LIST);
      const app = adminApp(page);
      await expect(app.getByRole('button', { name: 'Add New' })).toBeDisabled();
      await expect(app.getByText('Pro', { exact: true }).first()).toBeVisible();

      await gotoAppRoute(page, '/bogo/create-bogo');
      await expect(app.getByText('reached the free version’s BOGO offer limit')).toBeVisible();
      await expect(app.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
      await expect(app.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
    });

    test('module off: the list asks to turn it on; the button does', async ({ page, api }) => {
      await setModuleStatus(api, BOGO, false);
      await gotoRecordList(page, '/bogo', LIST);
      const app = adminApp(page);
      await expect(app.getByText('BOGO is turned off.')).toBeVisible();
      await app.getByRole('button', { name: 'Turn on BOGO' }).click();
      await expect(app.getByText('No BOGO offers yet')).toBeVisible();
      expect((await (await api.get(`/wp-json/sales-booster/v1/modules/${BOGO}`)).json()).status).toBe(true);
    });

    test('"Turn on" lists the existing offers without a reload', async ({ page, api }) => {
      // ISSUES #10, as Order Bump's (order-bump-admin.spec.ts): the list waits
      // for the server to turn the module on before `GET …/bogo/offers`.
      await offerAB(api, { name_of_order_bogo: 'E2E Hidden Offer' });
      await setModuleStatus(api, BOGO, false);
      await gotoRecordList(page, '/bogo', LIST);
      await adminApp(page).getByRole('button', { name: 'Turn on BOGO' }).click();
      await expect(recordRow(page, 'E2E Hidden Offer')).toBeVisible({ timeout: 5000 });
    });

    test('old and invalid links land on the right page', async ({ page }) => {
      await gotoAppRoute(page, '/bogo/abc');
      await expect.poll(() => appHash(page)).toBe('/bogo');

      await gotoAppRoute(page, '/bogo?tab_name=messages');
      await expect.poll(() => appHash(page)).toBe('/bogo/messages');

      await gotoAppRoute(page, '/bogo/create-message/edit/15');
      await expect.poll(() => appHash(page)).toBe('/bogo/messages');

      await gotoAppRoute(page, '/bogo?tab_name=general');
      await expect.poll(() => appHash(page)).toBe('/settings?module=bogo');
    });
  });

  test.describe('editor', () => {
    test('creates an offer through the form, then opens it as itself', async ({ page, api }) => {
      await gotoAppRoute(page, '/bogo/create-bogo');
      await setText(page, 'Name of BOGO', 'E2E UI Created');
      await pickProduct(page, 'Select Target Product(s)', 'Product A', PRODUCTS.a.name);
      await pickProduct(page, 'Offer Product', 'Product B', PRODUCTS.b.name);
      await setSelect(page, 'Offer Price/Discount', 'Percentage Off');
      await setNumber(page, 'Discount', 30);

      const res = await saveRecord(page, ROUTE);
      expect(res.status()).toBe(201);
      const created = await res.json();
      await expect.poll(() => appHash(page)).toBe(`/bogo/${created.id}`);
      await expect(adminApp(page).getByText('Offer created.')).toBeVisible();

      const [stored] = await listBogoOffers(api);
      expect(stored).toMatchObject({ id: created.id, name: 'E2E UI Created', type: 'global', status: 'active', offer_type: 'discount' });
      expect(stored.offered_products.map(Number)).toEqual([PRODUCTS.a.id]);
      expect(Number(stored.get_different_product_field)).toBe(PRODUCTS.b.id);
      expect(Number(stored.discount_amount)).toBe(30);
    });

    test('edits on each tab save and survive a reload', async ({ page, api }) => {
      const offer = await offerAB(api, { name_of_order_bogo: 'E2E Edit Me' });

      // Basic Information.
      await gotoAppRoute(page, `/bogo/${offer.id}`);
      await expect(settingsField(page, 'textbox', 'Name of BOGO')).toHaveValue('E2E Edit Me');
      await setText(page, 'Name of BOGO', 'E2E Edited');
      await setText(page, 'Offer End Date', '2031-12-31');
      const basic = await saveRecord(page, `${ROUTE}/${offer.id}`);
      // An update of the offer itself (no create); only what changed is sent (a merge).
      expect(Object.keys(basic.request().postDataJSON()).sort()).toEqual(['name_of_order_bogo', 'offer_end']);

      // Design.
      await openTab(page, 'Design');
      await setSelect(page, 'Overview Border', 'Dashed');
      await setNumber(page, 'Top Margin', 7);
      await saveRecord(page, `${ROUTE}/${offer.id}`);

      // The tab is in the URL: a reload reopens Design.
      await page.reload();
      expect(appHash(page)).toBe(`/bogo/${offer.id}?tab=design`);
      await expect(adminApp(page).getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
      await expect(settingsField(page, 'combobox', 'Overview Border')).toContainText('Dashed');
      await expect(settingsField(page, 'spinbutton', 'Top Margin')).toHaveValue('7');
      await openTab(page, 'Basic Information');
      await expect(settingsField(page, 'textbox', 'Name of BOGO')).toHaveValue('E2E Edited');
      await expect(settingsField(page, 'textbox', 'Offer End Date')).toHaveValue('2031-12-31');

      // Content: the message is pro; on lite it is locked.
      await openTab(page, 'Content');
      const message = settingsField(page, 'textbox', 'Product Page Message');
      if (await hasPro(api)) {
        await expect(message).toBeEnabled();
      } else {
        await expect(message).toBeDisabled();
        await expect(message).toHaveValue('Free Gift');
      }

      const [stored] = await listBogoOffers(api);
      expect(stored.name).toBe('E2E Edited');
      expect(String(stored.offer_end)).toContain('2031-12-31');
      expect(stored.box_border_style).toBe('dashed');
      expect(Number(stored.box_top_margin)).toBe(7);
      // Not sent, so kept.
      expect(Number(stored.get_different_product_field)).toBe(PRODUCTS.b.id);
    });

    test('client checks stop a save and mark the fields', async ({ page, api }) => {
      await gotoAppRoute(page, '/bogo/create-bogo');
      const app = adminApp(page);
      let posted = false;
      page.on('request', (r) => {
        if (r.url().includes(ROUTE) && r.method() === 'POST') posted = true;
      });

      // Make the form dirty, but invalid.
      await setText(page, 'Name of BOGO', '   ');
      await app.getByRole('button', { name: 'Save', exact: true }).click();
      // Each message under its field (a toast repeats the first one).
      const fieldError = (text: string) => app.getByRole('tabpanel').getByRole('alert').filter({ hasText: text });
      await expect(fieldError('Enter a name for the offer.')).toBeVisible();
      await expect(fieldError('Select at least one target product.')).toBeVisible();
      await expect(fieldError('Select the offer product.')).toBeVisible();

      await setSelect(page, 'Offer Price/Discount', 'Percentage Off');
      await setNumber(page, 'Discount', 150);
      await setText(page, 'Offer Start Date', '2030-05-10');
      await setText(page, 'Offer End Date', '2030-05-01');
      await app.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(fieldError('Enter a discount from 1 to 100%.')).toBeVisible();
      await expect(fieldError('The end date is before the start date.')).toBeVisible();

      expect(posted, 'nothing was sent').toBe(false);
      expect(await listBogoOffers(api)).toEqual([]);
    });

    test('a server rule marks its field: the offer product among the targets', async ({ page, api }) => {
      await gotoAppRoute(page, '/bogo/create-bogo');
      await setText(page, 'Name of BOGO', 'E2E Same Product');
      await pickProduct(page, 'Select Target Product(s)', 'Product A', PRODUCTS.a.name);
      await pickProduct(page, 'Offer Product', 'Product A', PRODUCTS.a.name);
      const save = page.waitForResponse((r) => r.url().includes(ROUTE) && r.request().method() === 'POST');
      await adminApp(page).getByRole('button', { name: 'Save', exact: true }).click();
      expect((await save).status()).toBe(400);
      await expect(adminApp(page).getByRole('alert').or(adminApp(page).getByText(/target product/i)).first()).toBeVisible();
      expect(await listBogoOffers(api)).toEqual([]);
    });

    test('the preview follows the form', async ({ page }) => {
      await gotoAppRoute(page, '/bogo/create-bogo');
      const app = adminApp(page);
      await expect(app.getByRole('heading', { name: 'Preview' })).toBeVisible();
      await expect(app.getByText('Free Gift', { exact: true })).toBeVisible();

      await pickProduct(page, 'Offer Product', 'Product B', PRODUCTS.b.name);
      await expect(app.getByText(PRODUCTS.b.name).last()).toBeVisible();

      await setSelect(page, 'Offer Price/Discount', 'Percentage Off');
      await setNumber(page, 'Discount', 50);
      await expect(app.getByText('50% Off')).toBeVisible();
      await expect(app.getByText('$24.50').first()).toBeVisible();
    });

    test('module off: the editor goes back to the list', async ({ page, api }) => {
      const offer = await offerAB(api);
      await setModuleStatus(api, BOGO, false);
      await gotoAppRoute(page, `/bogo/${offer.id}`);
      await expect.poll(() => appHash(page)).toBe('/bogo');
      await expect(adminApp(page).getByRole('button', { name: 'Turn on BOGO' })).toBeVisible();
    });
  });

  test.describe('category messages', () => {
    test('lite lists them read-only under an upgrade strip', async ({ page, api }) => {
      test.skip(await hasPro(api), 'lite-only');
      await gotoAppRoute(page, '/bogo');
      await adminApp(page).getByRole('button', { name: 'Category Messages' }).click();
      await expect.poll(() => appHash(page)).toBe('/bogo/messages');
      const app = adminApp(page);
      await expect(app.getByRole('heading', { level: 1, name: 'Category Messages' })).toBeVisible();
      await expect(app.getByText('Category messages are a Pro feature.')).toBeVisible();
      await expect(app.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
      for (const add of await app.getByRole('button', { name: 'Add Message' }).all()) {
        await expect(add).toBeDisabled();
      }
      await app.getByRole('button', { name: 'BOGO List' }).click();
      await expect.poll(() => appHash(page)).toBe('/bogo');
    });
  });
});
