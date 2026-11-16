import { test, expect } from '../../fixtures/test';
import { Page } from '@playwright/test';
import { gotoAppRoute, gotoDashboard } from '../../helpers/modules';
import { expectOk } from '../../helpers/rest';
import { PRODUCTS } from '../../data/products';
import {
  CAMPAIGNS,
  CampaignTracker,
  campaignDate,
  campaignName,
  campaignRoutesExist,
  campaignsAvailable,
  createCampaign,
  getCampaign,
  updateCampaign,
} from '../../helpers/campaigns';

// The Campaigns admin (`#/campaigns`, `#/campaigns/<id>`), StoreGrowth Pro's
// (ADR-017), redesigned in Pro #321: a draft is six numbered steps with a
// "Ready to publish?" rail and an explicit Save draft; a published campaign
// leads with its status strip and results, and keeps setup as a summary.
// StoreGrowth alone has no Campaigns page or menu item; Pro without a licence
// shows a preview with sample data. Every campaign a test makes is deleted
// after it, also on failure.

/** The campaign id in the page's `#/campaigns/<id>` route. */
function idFromUrl(page: Page): number {
  const match = /#\/campaigns\/(\d+)/.exec(page.url());
  expect(match, `campaign id in ${page.url()}`).toBeTruthy();
  return Number(match![1]);
}

/** `YYYY-MM-DD HH:MM` → the day a date input takes. */
function day(date: string): string {
  return date.slice(0, 10);
}

/** Wait for the draft's Save draft request. */
function saveRequest(page: Page, id: number) {
  return page.waitForResponse(
    (r) => new RegExp(`campaigns/${id}(\\?|$)`).test(r.url()) && r.request().method() === 'POST',
  );
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
    test('StoreGrowth alone has no Campaigns page or menu item @ui', async ({ api, page }) => {
      test.skip(await campaignRoutesExist(api), 'StoreGrowth Pro is active');

      await gotoDashboard(page);
      await expect(page.locator('#adminmenu a[href*="#/campaigns"]')).toHaveCount(0);

      // No such route: the app falls back to another page.
      await gotoAppRoute(page, '/campaigns');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Campaigns', level: 1 })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'New campaign' })).toHaveCount(0);
    });
  });

  test.describe('Pro without a licence', () => {
    test('shows a sample-data preview with nothing to create @ui', async ({ api, page }) => {
      test.skip(!(await campaignRoutesExist(api)), 'Campaigns are StoreGrowth Pro’s');
      test.skip(await campaignsAvailable(api), 'Pro is licensed');

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
      await expect(page.getByRole('columnheader', { name: 'Store displays' })).toBeVisible();
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

    test('New campaign opens the template picker; Blank opens an empty draft @ui', async ({ api, page }) => {
      await gotoAppRoute(page, 'campaigns');
      await page.getByRole('button', { name: 'New campaign' }).click();
      const dialog = page.getByRole('dialog', { name: 'New campaign' });

      const created = page.waitForResponse(
        (r) => r.url().includes('sales-booster/v1/campaigns') && r.request().method() === 'POST',
      );
      // The last template is Blank.
      await dialog.getByRole('button', { name: 'Use template' }).last().click();
      tracker.track((await (await created).json()).id);

      await expect(page.getByRole('heading', { name: 'New campaign', level: 1 })).toBeVisible();
      const stored = await getCampaign(api, idFromUrl(page));
      expect(stored).toMatchObject({ status: 'draft', name: '', starts_at: null, never_saved: true });

      await expect(page.getByText('Not saved yet')).toBeVisible();
      await expect(page.getByText('0 of 2 done')).toBeVisible();
      await expect(page.getByText('Starting from scratch?')).toBeVisible();
      for (let step = 1; step <= 6; step++) {
        await expect(page.getByRole('img', { name: `Step ${step}`, exact: true })).toBeVisible();
      }
      await expect(page.getByRole('button', { name: 'Publish', exact: true }).first()).toBeDisabled();
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

    test('the checklist jumps to its step and ticks as the steps are done @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: '' });

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByRole('button', { name: /Set a start date/ }).click();
      await expect(page.getByLabel('Start date')).toBeFocused();

      await page.getByLabel('Campaign name').fill(campaignName('E2E UI Steps'));
      await page.getByLabel('Start date').fill(day(campaignDate(4)));
      await expect(page.getByText('1 of 2 done')).toBeVisible();
      await expect(page.getByRole('img', { name: 'Step 1, done' })).toBeVisible();

      await page.getByRole('switch', { name: 'Product badge' }).click();
      await expect(page.getByText('2 of 2 done')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Ready to publish', exact: true })).toBeVisible();
      await expect(page.getByRole('img', { name: 'Step 5, done' })).toBeVisible();
      // Step 3 is optional and stays a number when skipped.
      await expect(page.getByRole('img', { name: 'Step 3', exact: true })).toBeVisible();
    });

    test('a draft saves on Save draft and publishes @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: '' });
      const name = campaignName('E2E UI Edited');
      const starts = campaignDate(4);
      const ends = campaignDate(8);

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await expect(page.getByText('Not saved yet')).toBeVisible();
      await page.getByLabel('Campaign name').fill(name);
      await page.getByLabel('Start date').fill(day(starts));
      await page.getByLabel('End date').fill(day(ends));
      await page.getByRole('switch', { name: 'Product badge' }).click();

      // Nothing is saved until Save draft.
      expect((await getCampaign(api, campaign.id)).starts_at).toBeNull();

      const saved = saveRequest(page, campaign.id);
      await page.getByRole('button', { name: 'Save draft' }).click();
      expect((await saved).ok()).toBeTruthy();
      await expect(page.getByText('Saved just now')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Campaign link' })).toBeVisible();

      const stored = await getCampaign(api, campaign.id);
      expect(stored.name).toBe(name);
      expect(stored.starts_at).toBe(`${day(starts)} 00:00:00`);
      expect(stored.ends_at).toBe(`${day(ends)} 23:59:59`);
      expect(stored.settings.surfaces?.badge?.enabled).toBe(true);

      await page.getByRole('button', { name: 'Publish', exact: true }).first().click();
      await expect(page.getByText(/^Starts in \d+ days, on /)).toBeVisible();
      await expect(page.getByText('Editable until it starts')).toBeVisible();
      expect((await getCampaign(api, campaign.id)).status).toBe('scheduled');

      // Unpublish returns to the draft layout.
      await page.getByRole('button', { name: 'Unpublish' }).click();
      await expect(page.getByText(/^Ready to publish/).first()).toBeVisible();
      expect((await getCampaign(api, campaign.id)).status).toBe('draft');
    });

    test('an end set on the page runs through its last minute @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker);
      const ends = campaignDate(8);
      await updateCampaign(api, campaign.id, { starts_at: campaignDate(4) });

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByLabel('End date').fill(day(ends));
      await page.getByLabel('End time').fill('10:30');
      const saved = saveRequest(page, campaign.id);
      await page.getByRole('button', { name: 'Save draft' }).click();
      expect((await saved).ok()).toBeTruthy();

      expect((await getCampaign(api, campaign.id)).ends_at).toBe(`${day(ends)} 10:30:59`);
    });

    test('unsaved edits ask before leaving; leaving puts back the last save @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: campaignName('E2E UI Leave') });
      const saved = (await getCampaign(api, campaign.id)).name;

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByLabel('Campaign name').fill(`${saved} edited`);
      await expect(page.getByText('Unsaved changes')).toBeVisible();

      await page.getByRole('button', { name: 'Campaigns', exact: true }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Leave without saving?' });
      await dialog.getByRole('button', { name: 'Keep editing' }).click();
      await expect(page.getByLabel('Campaign name')).toHaveValue(`${saved} edited`);

      await page.getByRole('button', { name: 'Campaigns', exact: true }).click();
      await page.getByRole('button', { name: 'Leave without saving' }).click();
      await expect(page.getByRole('heading', { name: 'Campaigns', level: 1 })).toBeVisible();
      expect((await getCampaign(api, campaign.id)).name).toBe(saved);
    });

    test('Delete asks first, then removes the campaign @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: campaignName('E2E UI Delete') });

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await page.getByRole('button', { name: 'More actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      const confirm = page.getByRole('alertdialog');
      await expect(confirm).toContainText(`Delete ${campaign.name}?`);
      await confirm.getByRole('button', { name: 'Cancel' }).click();
      expect((await api.get(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(200);

      await page.getByRole('button', { name: 'More actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete campaign' }).click();
      await expect(page.getByRole('heading', { name: 'Campaigns', level: 1 })).toBeVisible();
      expect((await api.get(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(404);
      tracker.forget(campaign.id);
    });

    test('a running campaign pauses, resumes and ends after a confirm @ui', async ({ api, page }) => {
      const campaign = await createCampaign(api, tracker, { name: campaignName('E2E UI Running') });
      await updateCampaign(api, campaign.id, {
        starts_at: campaignDate(-1),
        ends_at: campaignDate(3),
        settings: { surfaces: { badge: { enabled: true, copy: '' } } },
      });
      await expectOk(await api.post(`${CAMPAIGNS}/${campaign.id}/publish`), 'publish');

      await gotoAppRoute(page, `campaigns/${campaign.id}`);
      await expect(page.getByText(/^Day \d+ of \d+ · ends /)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Results so far' })).toBeVisible();
      await expect(page.getByText('Changes apply right away')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Live on your store now' })).toBeVisible();

      await page.getByRole('button', { name: 'Pause' }).first().click();
      await expect(page.getByText(/^Paused since /)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Results up to the pause' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Off while paused' })).toBeVisible();

      await page.getByRole('button', { name: 'Resume' }).first().click();
      await expect(page.getByText(/^Day \d+ of \d+ · ends /)).toBeVisible();

      await page.getByRole('button', { name: 'End now' }).first().click();
      const confirm = page.getByRole('alertdialog');
      await expect(confirm).toContainText('It finishes for good and the results freeze.');
      await confirm.getByRole('button', { name: 'Cancel' }).click();
      expect((await getCampaign(api, campaign.id)).status).toBe('running');

      await page.getByRole('button', { name: 'End now' }).first().click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'End now' }).click();
      await expect(page.getByRole('heading', { name: 'Final results' })).toBeVisible();
      await expect(page.getByText('Read-only. Run again to reuse it.')).toBeVisible();
      expect((await getCampaign(api, campaign.id)).status).toBe('ended');
    });

    test.describe('own Countdown', () => {
      const made: number[] = [];

      test.afterEach(async ({ api }) => {
        if (made.length) {
          await expectOk(
            await api.post('/wp-json/wc/v3/products/batch', { data: { delete: made.splice(0) }, params: { force: true } }),
            'delete products',
          );
        }
      });

      test('a product with its own Countdown shows under Worth a look and in the price step @ui', async ({ api, page }) => {
        const res = await api.post('/wp-json/wc/v3/products/batch', {
          data: {
            create: [
              {
                name: 'E2E Countdown Product',
                regular_price: '10',
                status: 'publish',
                meta_data: [{ key: '_spsg_countdown_timer_discount_amount', value: '10' }],
              },
            ],
          },
        });
        await expectOk(res, 'create products');
        made.push(...(await res.json()).create.map((p: { id: number }) => p.id));

        const campaign = await createCampaign(api, tracker);
        const saved = await updateCampaign(api, campaign.id, {
          settings: { campaign_price: { percent: 15, products: made } },
        });
        expect(saved.checks.map((c) => c.code)).toContain('own_countdown');

        await gotoAppRoute(page, `campaigns/${campaign.id}`);
        await expect(page.getByText('1 product already has its own Countdown discount.', { exact: false })).toBeVisible();
        await expect(page.getByText("E2E Countdown Product's own 10% Countdown pauses while this runs, then comes back.")).toBeVisible();
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(page.getByRole('img', { name: 'Step 3, done' })).toBeInViewport();
      });
    });
  });
});
