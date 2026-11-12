import { test, expect } from '../../fixtures/test';
import { adminApp, gotoAppRoute } from '../../helpers/modules';
import { confirmDelete, gotoRecordList, recordRow, rowAction, saveRecord } from '../../helpers/record-ui';
import { isModuleActive, setModuleStatus } from '../../helpers/rest';
import { SMART_COUPONS, SMART_COUPONS_MODULE, getCoupon, proActive, trackCoupons, uniqueCode } from '../../helpers/smart-coupons';

// The Smart Coupons admin (`#/smart-coupons`, `#/smart-coupons/new`,
// `#/smart-coupons/<id>`): the list with its status switch and row actions,
// and the editor, where the merchant sets their own discount code. Setup and
// checks go through REST (helpers/smart-coupons.ts); the API rules are in
// tests/api/smart-coupons.api.spec.ts.

const LIST = '/smart-coupons';
const HEADING = 'Smart Coupons';

test.describe('Admin · Smart Coupons', { tag: '@ui' }, () => {
  const made = trackCoupons();
  let wasActive = false;

  test.beforeAll(async ({ api }) => {
    wasActive = await isModuleActive(api, SMART_COUPONS_MODULE);
  });

  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, SMART_COUPONS_MODULE, true);
  });

  test.afterEach(async ({ api }) => {
    await made.cleanup(api);
  });

  test.afterAll(async ({ api }) => {
    await setModuleStatus(api, SMART_COUPONS_MODULE, wasActive);
  });

  test('the list shows a coupon with its type, method and code', async ({ page, api }) => {
    const coupon = await made.create(api, { title: `E2E List ${uniqueCode('t')}` });

    await gotoRecordList(page, LIST, HEADING);
    const row = recordRow(page, coupon.title);

    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'Percentage', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: `Discount code ${coupon.code.toUpperCase()}` })).toBeVisible();
    await expect(row.getByRole('switch', { name: `Coupon status: ${coupon.title}` })).toBeChecked();
  });

  test('a new coupon is saved with the code the merchant types', async ({ page, api }) => {
    const code = uniqueCode('typed');
    const title = `E2E Typed ${code}`;

    await gotoAppRoute(page, `${LIST}/new`);
    const app = adminApp(page);
    await app.getByRole('group', { name: 'Method' }).getByRole('button', { name: 'Discount code' }).click();
    await app.getByRole('textbox', { name: 'Discount code' }).fill(code);
    await app.getByRole('textbox', { name: 'Title' }).fill(title);
    await app.getByRole('spinbutton', { name: 'Percent off' }).fill('15');

    const res = await saveRecord(page, 'smart-coupons');
    const saved = await res.json();
    made.adopt(saved.id);

    expect(res.status()).toBe(201);
    await expect(page.getByText('Coupon created.')).toBeVisible();
    expect(await getCoupon(api, saved.id)).toMatchObject({ code, title, method: 'code', amount: 15, status: 'active' });
  });

  test('editing a coupon changes its code', async ({ page, api }) => {
    const coupon = await made.create(api);
    const code = uniqueCode('edited');

    await gotoAppRoute(page, `${LIST}/${coupon.id}`);
    const field = adminApp(page).getByRole('textbox', { name: 'Discount code' });
    await expect(field).toHaveValue(coupon.code);
    await field.fill(code);

    await saveRecord(page, 'smart-coupons');
    await expect(page.getByText('Coupon saved.')).toBeVisible();
    expect((await getCoupon(api, coupon.id)).code).toBe(code);
  });

  test('the status switch turns a coupon off and on', async ({ page, api }) => {
    // The shared RecordList sends `status: 'yes' | 'no'`, as for BOGO and
    // order bumps; the route takes those as well as `active | inactive`.
    const coupon = await made.create(api);

    await gotoRecordList(page, LIST, HEADING);
    const toggle = recordRow(page, coupon.title).getByRole('switch', { name: `Coupon status: ${coupon.title}` });

    for (const status of ['inactive', 'active']) {
      const saved = page.waitForResponse((r) => r.url().includes(`${SMART_COUPONS.replace('/wp-json', '')}/${coupon.id}/status`));
      await toggle.click();
      const r = await saved;
      expect(r.ok(), `${r.request().method()} ${r.url()} → ${r.status()} ${await r.text()}`).toBeTruthy();
      await expect(toggle).toBeChecked({ checked: status === 'active' });
      expect((await getCoupon(api, coupon.id)).status).toBe(status);
    }
  });

  test('delete from the row actions', async ({ page, api }) => {
    const coupon = await made.create(api);

    await gotoRecordList(page, LIST, HEADING);
    await rowAction(page, coupon.title, 'Delete');
    await confirmDelete(page);

    await expect(recordRow(page, coupon.title)).toHaveCount(0);
    expect((await api.get(`${SMART_COUPONS}/${coupon.id}`)).status()).toBe(404);
  });

  test('the list has a Revenue column', async ({ page, api }) => {
    await made.create(api);

    await gotoRecordList(page, LIST, HEADING);
    await expect(adminApp(page).getByRole('columnheader', { name: 'Revenue' })).toBeVisible();
  });

  test('Free: code coupons never block New coupon', async ({ page, api }) => {
    test.skip(await proActive(api), 'Free-plan limit: has_pro() is true on this stack');
    await made.create(api);
    await made.create(api);

    await gotoRecordList(page, LIST, HEADING);
    await expect(adminApp(page).getByRole('button', { name: 'New coupon' })).toBeEnabled();
  });

  test('Free: switching on a second automatic coupon asks to swap, and swapping turns the first off', async ({ page, api }) => {
    test.skip(await proActive(api), 'Free-plan limit: has_pro() is true on this stack');
    const first = await made.create(api, { method: 'automatic', title: `E2E Auto first ${uniqueCode('a')}` });
    const second = await made.create(api, { method: 'automatic', title: `E2E Auto second ${uniqueCode('b')}`, status: 'inactive' });

    await gotoRecordList(page, LIST, HEADING);
    const toggle = recordRow(page, second.title).getByRole('switch', { name: `Coupon status: ${second.title}` });
    await toggle.click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Free includes one active automatic coupon')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();

    // Cancel leaves both as they were.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    expect((await getCoupon(api, second.id)).status).toBe('inactive');

    await toggle.click();
    await page.getByRole('alertdialog').getByRole('button', { name: `Turn off “${first.title}”` }).click();

    await expect.poll(async () => (await getCoupon(api, second.id)).status).toBe('active');
    expect((await getCoupon(api, first.id)).status).toBe('inactive');
  });

  test('Free: Link and Specific roles are open, Specific customers is Pro', async ({ page, api }) => {
    test.skip(await proActive(api), 'Free-plan limit: has_pro() is true on this stack');

    await gotoAppRoute(page, `${LIST}/new`);
    const app = adminApp(page);
    await app.getByRole('group', { name: 'Method' }).getByRole('button', { name: 'Link' }).click();
    await expect(app.getByRole('textbox', { name: 'Discount code' })).toBeVisible();

    await app.getByRole('combobox', { name: 'Customers' }).click();
    await expect(page.getByRole('option', { name: 'Specific roles', exact: true })).toBeEnabled();
    await expect(page.getByRole('option', { name: 'Specific customers (Pro)' })).toHaveAttribute('aria-disabled', 'true');
  });
});
