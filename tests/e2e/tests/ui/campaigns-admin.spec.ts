import { test, expect } from '../../fixtures/test';
import { Page } from '@playwright/test';
import { gotoAppRoute } from '../../helpers/modules';
import { expectOk } from '../../helpers/rest';
import { PRODUCTS } from '../../data/products';
import {
  CAMPAIGNS,
  CampaignTracker,
  campaignDate,
  campaignName,
  campaignsAvailable,
  createCampaign,
  getCampaign,
  updateCampaign,
} from '../../helpers/campaigns';

// The Campaigns admin (`#/campaigns`, `#/campaigns/<id>`, ADR-016). With Pro
// the list, the New campaign dialog and the campaign page edit real
// campaigns; Free shows a preview with sample data and nothing to change.
// Every campaign a test makes is deleted after it, also on failure.

/** The campaign id in the page's `#/campaigns/<id>` route. */
function idFromUrl(page: Page): number {
  const match = /#\/campaigns\/(\d+)/.exec(page.url());
  expect(match, `campaign id in ${page.url()}`).toBeTruthy();
  return Number(match![1]);
}

/** `YYYY-MM-DD HH:MM` → the value a datetime-local input takes. */
function inputDate(date: string): string {
  return date.replace(' ', 'T');
}

test.describe('Admin · Campaigns', () => {
  let tracker: CampaignTracker;

  test.beforeEach(async ({ api }) => {
    tracker = new CampaignTracker(api);
  });

  test.afterEach(async () => {
    await tracker.cleanup();
  });

  test.describe('lite', () => {
    test('shows a sample-data preview with nothing to create @ui', async ({ api, page }) => {
      test.skip(await campaignsAvailable(api), 'Pro is active');

      await gotoAppRoute(page, 'campaigns');
      await expect(page.getByRole('heading', { name: 'Campaigns', level: 1 })).toBeVisible();
      await expect(page.getByText('Campaigns is a StoreGrowth Pro feature. This is a preview with sample data.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'New campaign' })).toBeDisabled();
    });
  });

  test.describe('pro', () => {
    test.beforeEach(async ({ api }) => {
      test.skip(!(await campaignsAvailable(api)), 'Campaigns need Pro');
    });

    test('the list shows campaigns by status tab and search @ui', async ({ api, page }) => {
      const draft = await createCampaign(api, tracker, { name: campaignName('E2E List Draft') });
      const scheduled = await createCampaign(api, tracker, { name: campaignName('E2E List Scheduled') });
      await updateCampaign(api, scheduled.id, {
        starts_at: campaignDate(5),
        ends_at: campaignDate(9),
        settings: { campaign_price: { percent: 10, products: [PRODUCTS.a.id] } },
      });
      await expectOk(await api.post(`${CAMPAIGNS}/${scheduled.id}/publish`), 'publish');

      await gotoAppRoute(page, 'campaigns');
      const table = page.getByRole('table');
      const draftRow = table.getByRole('row', { name: new RegExp(draft.name) });
      const scheduledRow = table.getByRole('row', { name: new RegExp(scheduled.name) });
      await expect(draftRow).toBeVisible();
      await expect(draftRow).toContainText('Draft');
      await expect(scheduledRow).toContainText('Scheduled');

      await page.getByRole('tab', { name: /^Scheduled/ }).click();
      await expect(scheduledRow).toBeVisible();
      await expect(draftRow).toHaveCount(0);

      await page.getByRole('tab', { name: /^All/ }).click();
      await page.getByRole('textbox', { name: 'Search campaigns' }).fill(draft.name);
      await expect(draftRow).toBeVisible();
      await expect(scheduledRow).toHaveCount(0);
    });

    test('New campaign creates a draft and opens it @ui', async ({ api, page }) => {
      const name = campaignName('E2E UI Created');

      await gotoAppRoute(page, 'campaigns');
      await page.getByRole('button', { name: 'New campaign' }).click();
      const dialog = page.getByRole('dialog', { name: 'New campaign' });
      await dialog.getByRole('textbox', { name: 'Campaign name' }).fill(name);

      const created = page.waitForResponse(
        (r) => r.url().includes('sales-booster/v1/campaigns') && r.request().method() === 'POST',
      );
      // The last template is Blank.
      await dialog.getByRole('button', { name: 'Use template' }).last().click();
      tracker.track((await (await created).json()).id);

      await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
      const id = idFromUrl(page);
      expect((await getCampaign(api, id)).status).toBe('draft');
      await expect(page.getByRole('button', { name: 'Publish' })).toBeDisabled();
      await expect(page.getByText('Set a start date before publishing.')).toBeVisible();
    });

    test('the New campaign dialog stays inside a short screen and scrolls its templates @ui', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 480 });
      await gotoAppRoute(page, 'campaigns');
      await page.getByRole('button', { name: 'New campaign' }).click();
      const dialog = page.getByRole('dialog', { name: 'New campaign' });
      await expect(dialog.getByRole('button', { name: 'Use template' }).first()).toBeVisible();

      const box = await dialog.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(480);

      // The template list scrolls inside the dialog and its last one is reachable.
      const scrolls = await dialog.evaluate((el) =>
        Array.from(el.querySelectorAll<HTMLElement>('*')).some(
          (e) => getComputedStyle(e).overflowY === 'auto' && e.scrollHeight > e.clientHeight,
        ),
      );
      expect(scrolls).toBe(true);
      const blank = dialog.getByRole('button', { name: 'Use template' }).last();
      await blank.scrollIntoViewIfNeeded();
      await expect(blank).toBeInViewport();
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).toBeHidden();
    });

    test('the campaign page saves name, dates and price, then publishes @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker);
      const name = campaignName('E2E UI Edited');
      const starts = campaignDate(4);
      const ends = campaignDate(8);

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByRole('textbox', { name: 'Name' }).fill(name);
      await page.getByLabel('Start').fill(inputDate(starts));
      await page.getByLabel('End').fill(inputDate(ends));
      await page.getByRole('spinbutton', { name: 'Percent off' }).fill('15');

      const saved = page.waitForResponse(
        (r) => r.url().includes(`campaigns/${campaign.id}`) && r.request().method() === 'POST',
      );
      await page.getByRole('button', { name: 'Save' }).click();
      expect((await saved).ok()).toBeTruthy();
      await expect(page.getByText('Saved.')).toBeVisible();

      const stored = await getCampaign(api, campaign.id);
      expect(stored.name).toBe(name);
      expect(stored.starts_at).toBe(`${starts}:00`);
      expect(stored.ends_at?.slice(0, 16)).toBe(ends);
      expect(stored.settings.campaign_price?.percent).toBe(15);

      // Still nothing it applies to: the price needs products.
      await page.reload();
      await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
      await expect(page.getByRole('spinbutton', { name: 'Percent off' })).toHaveValue('15');

      await updateCampaign(api, campaign.id, { settings: { campaign_price: { percent: 15, products: [PRODUCTS.a.id] } } });
      await page.reload();
      const publish = page.getByRole('button', { name: 'Publish' });
      await expect(publish).toBeEnabled();
      await publish.click();
      await expect(page.getByText('Scheduled', { exact: true }).first()).toBeVisible();
      expect((await getCampaign(api, campaign.id)).status).toBe('scheduled');
    });

    // Known bug: the page sends an edited end as `HH:MM:00`, but the REST
    // save runs an end through its last minute only for `HH:MM` (REST gives
    // `HH:MM:59`), so an end set on the page stops a minute early. Flip to a
    // normal test when the page sends `HH:MM` (or the server treats `:00`
    // the same).
    test('an end set on the page runs through its last minute @ui', async ({ api, page }) => {
      test.fail();

      const campaign = await createCampaign(api, tracker);
      const ends = campaignDate(8);
      await updateCampaign(api, campaign.id, { starts_at: campaignDate(4) });

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByLabel('End').fill(inputDate(ends));
      const saved = page.waitForResponse(
        (r) => r.url().includes(`campaigns/${campaign.id}`) && r.request().method() === 'POST',
      );
      await page.getByRole('button', { name: 'Save' }).click();
      expect((await saved).ok()).toBeTruthy();

      expect((await getCampaign(api, campaign.id)).ends_at).toBe(`${ends}:59`);
    });

    test('Delete asks first, then removes the campaign @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: campaignName('E2E UI Delete') });

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByRole('button', { name: 'Delete' }).click();
      const confirm = page.getByRole('alertdialog');
      await expect(confirm).toContainText(`Delete ${campaign.name}?`);
      await confirm.getByRole('button', { name: 'Cancel' }).click();
      expect((await api.get(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(200);

      await page.getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByRole('heading', { name: 'Campaigns', level: 1 })).toBeVisible();
      expect((await api.get(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(404);
      tracker.forget(campaign.id);
    });

    test.describe('the Products dialog', () => {
      const made: number[] = [];

      test.afterEach(async ({ api }) => {
        if (made.length) {
          await expectOk(
            await api.post('/wp-json/wc/v3/products/batch', { data: { delete: made.splice(0) }, params: { force: true } }),
            'delete products',
          );
        }
      });

      // Known bug: the Products dialog (readiness "Review products" / "See
      // products") has no height limit, so a long list runs off a short
      // screen and the top names can't be reached. Flip to a normal test when
      // it gets a fixed height with an inner scroll like the New campaign
      // dialog.
      test('stays inside the screen and scrolls a long list @ui', async ({ api, page }) => {
        test.fail();

        const res = await api.post('/wp-json/wc/v3/products/batch', {
          data: {
            create: Array.from({ length: 40 }, (_, i) => ({
              name: `E2E Campaign Product ${String(i).padStart(2, '0')}`,
              regular_price: '10',
              status: 'publish',
              meta_data: [{ key: '_spsg_countdown_timer_discount_amount', value: '10' }],
            })),
          },
        });
        await expectOk(res, 'create products');
        made.push(...(await res.json()).create.map((p: { id: number }) => p.id));

        const campaign = await createCampaign(api, tracker);
        const saved = await updateCampaign(api, campaign.id, {
          settings: { campaign_price: { percent: 10, products: made } },
        });
        expect(saved.checks.map((c) => c.code)).toContain('own_countdown');

        await page.setViewportSize({ width: 1280, height: 640 });
        await gotoAppRoute(page, `campaigns/${campaign.id}`);
        await page.getByRole('button', { name: 'Review products' }).click();
        const dialog = page.getByRole('dialog', { name: 'Products' });
        await expect(dialog).toContainText('E2E Campaign Product 00');

        const box = await dialog.boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(640);
      });
    });
  });
});
