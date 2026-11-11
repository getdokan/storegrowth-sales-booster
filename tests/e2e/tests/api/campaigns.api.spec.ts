import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';
import {
  CAMPAIGNS,
  CampaignTracker,
  campaignAction,
  campaignDate,
  campaignsAvailable,
  createCampaign,
  listCampaigns,
  updateCampaign,
} from '../../helpers/campaigns';
import { createBogoOffer, deleteBogoOffer } from '../../helpers/records';
import { PRODUCTS } from '../../data/products';

// Campaigns REST (`sales-booster/v1/campaigns`, ADR-016). Reading is open to
// shop managers; every write needs an active Pro licence. Each test deletes
// the campaigns (and offers) it made, also on failure: a leftover running
// campaign would change every later cart.

test.describe('API · Campaigns', () => {
  let tracker: CampaignTracker;
  const bogoIds: number[] = [];

  test.beforeEach(async ({ api }) => {
    tracker = new CampaignTracker(api);
  });

  test.afterEach(async ({ api }) => {
    await tracker.cleanup();
    while (bogoIds.length) {
      await deleteBogoOffer(api, bogoIds.pop() as number);
    }
  });

  test('anonymous callers are refused on every route', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    for (const [method, path] of [
      ['get', CAMPAIGNS],
      ['get', `${CAMPAIGNS}/templates`],
      ['get', `${CAMPAIGNS}/1`],
      ['post', CAMPAIGNS],
      ['post', `${CAMPAIGNS}/1/publish`],
      ['delete', `${CAMPAIGNS}/1`],
    ] as const) {
      const res = await anon[method](path);
      expect([401, 403], `anon ${method} ${path}`).toContain(res.status());
    }

    await anon.dispose();
  });

  test('the list and the templates can be read', async ({ api }) => {
    const list = await api.get(CAMPAIGNS);
    expect(list.status()).toBe(200);
    const body = await list.json();
    expect(Array.isArray(body.items)).toBeTruthy();
    expect(body.counts).toEqual(expect.objectContaining({ all: body.items.length }));

    const templates = await (await api.get(`${CAMPAIGNS}/templates`)).json();
    expect(Object.keys(templates)).toEqual(expect.arrayContaining(['flash-sale', 'black-friday', 'blank']));
    expect(templates['flash-sale'].percent).toBe(20);
  });

  test.describe('lite', () => {
    test('writes are refused without Pro (403 spsg_campaigns_need_pro)', async ({ api }) => {
      test.skip(await campaignsAvailable(api), 'Pro is active');

      const created = await api.post(CAMPAIGNS, { data: { name: 'Lite' } });
      expect(created.status()).toBe(403);
      expect((await created.json()).code).toBe('spsg_campaigns_need_pro');

      for (const path of [`${CAMPAIGNS}/1`, `${CAMPAIGNS}/1/publish`, `${CAMPAIGNS}/1/offers`]) {
        const res = await api.post(path, { data: {} });
        expect(res.status(), path).toBe(403);
      }
      expect((await api.delete(`${CAMPAIGNS}/1`)).status()).toBe(403);
    });
  });

  test.describe('pro', () => {
    test.beforeEach(async ({ api }) => {
      test.skip(!(await campaignsAvailable(api)), 'Campaigns need Pro');
    });

    test('a blank campaign is created as a draft that cannot publish yet', async ({ api }) => {
      const campaign = await createCampaign(api, tracker, { name: 'E2E draft campaign' });

      expect(campaign).toEqual(
        expect.objectContaining({ name: 'E2E draft campaign', status: 'draft', starts_at: null, read_only: false }),
      );
      expect(campaign.can_publish).toBe(false);
      expect(campaign.checks.map((c) => c.code)).toEqual(expect.arrayContaining(['no_start', 'nothing_attached']));

      const refused = await api.post(`${CAMPAIGNS}/${campaign.id}/publish`);
      expect(refused.status()).toBe(400);
      expect((await refused.json()).code).toBe('spsg_campaign_not_ready');

      const rows = await listCampaigns(api);
      expect(rows.find((r) => r.id === campaign.id)).toEqual(expect.objectContaining({ status: 'draft' }));
    });

    test('a template fills the draft', async ({ api }) => {
      const campaign = await createCampaign(api, tracker, { template: 'flash-sale' });
      expect(campaign.settings.campaign_price?.percent).toBe(20);
      expect(campaign.settings.exclude_on_sale).toBe(true);
      expect(Object.keys(campaign.settings.surfaces ?? {})).toEqual(
        expect.arrayContaining(['countdown', 'floating_bar']),
      );

      const unknown = await api.post(CAMPAIGNS, { data: { name: 'x', template: 'no-such-template' } });
      expect(unknown.status()).toBe(400);
      expect((await unknown.json()).code).toBe('spsg_campaign_template');
    });

    test('name, dates and settings save and are typed', async ({ api }) => {
      const campaign = await createCampaign(api, tracker);
      const saved = await updateCampaign(api, campaign.id, {
        name: '  Renamed <b>campaign</b> ',
        starts_at: '2030-01-01 09:00',
        ends_at: '2030-01-10 18:30',
        settings: {
          campaign_price: { percent: 150, products: [PRODUCTS.a.id, '0', 'x'] },
          products: [PRODUCTS.b.id],
          exclude_on_sale: 'true',
          unknown_key: 'dropped',
        },
      });

      expect(saved.name).toBe('Renamed campaign');
      expect(saved.starts_at).toBe('2030-01-01 09:00:00');
      // An end runs through its last minute.
      expect(saved.ends_at).toBe('2030-01-10 18:30:59');
      expect(saved.settings.campaign_price).toEqual({ percent: 100, products: [PRODUCTS.a.id], categories: [] });
      expect(saved.settings.products).toEqual([PRODUCTS.b.id]);
      expect(saved.settings.exclude_on_sale).toBe(true);
      expect(saved.settings).not.toHaveProperty('unknown_key');

      // A later save merges into the stored settings.
      const merged = await updateCampaign(api, campaign.id, { settings: { exclude_on_sale: false } });
      expect(merged.settings.products).toEqual([PRODUCTS.b.id]);
      expect(merged.settings.exclude_on_sale).toBe(false);
    });

    test('publish, pause, resume, end, unpublish and clone move the status', async ({ api }) => {
      const campaign = await createCampaign(api, tracker);
      await updateCampaign(api, campaign.id, {
        starts_at: campaignDate(5),
        ends_at: campaignDate(10),
        settings: { campaign_price: { percent: 10, products: [PRODUCTS.a.id] } },
      });

      const scheduled = await campaignAction(api, campaign.id, 'publish');
      expect(scheduled.status).toBe('scheduled');

      const draft = await campaignAction(api, campaign.id, 'unpublish');
      expect(draft.status).toBe('draft');

      await updateCampaign(api, campaign.id, { starts_at: campaignDate(-1) });
      expect((await campaignAction(api, campaign.id, 'publish')).status).toBe('running');

      const paused = await campaignAction(api, campaign.id, 'pause');
      expect(paused.status).toBe('paused');
      expect(paused.paused_at).toBeTruthy();

      const resumed = await campaignAction(api, campaign.id, 'resume');
      expect(resumed.status).toBe('running');
      expect(resumed.paused_at).toBeNull();

      const ended = await campaignAction(api, campaign.id, 'end');
      expect(ended.status).toBe('ended');

      const clone = await campaignAction(api, campaign.id, 'clone');
      tracker.track(clone.id);
      expect(clone.id).not.toBe(campaign.id);
      expect(clone.status).toBe('draft');
      expect(clone.settings.campaign_price).toEqual(expect.objectContaining({ percent: 10 }));
    });

    test('an end before the start blocks publishing', async ({ api }) => {
      const campaign = await createCampaign(api, tracker);
      const saved = await updateCampaign(api, campaign.id, {
        starts_at: campaignDate(5),
        ends_at: campaignDate(2),
        settings: { campaign_price: { percent: 10, products: [PRODUCTS.a.id] } },
      });
      expect(saved.checks.map((c) => c.code)).toContain('end_before_start');
      expect(saved.can_publish).toBe(false);
      expect((await api.post(`${CAMPAIGNS}/${campaign.id}/publish`)).status()).toBe(400);
    });

    test('an offer attaches, lists and comes off; the same offer cannot run in two overlapping campaigns', async ({
      api,
    }) => {
      const bogo = await createBogoOffer(api, {
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
      });
      bogoIds.push(bogo.id);

      const first = await createCampaign(api, tracker);
      await updateCampaign(api, first.id, { starts_at: campaignDate(3), ends_at: campaignDate(9) });

      const attachable = await (await api.get(`${CAMPAIGNS}/${first.id}/attachable`)).json();
      expect(attachable.bogo.map((o: { id: number }) => o.id)).toContain(bogo.id);

      const attached = await api.post(`${CAMPAIGNS}/${first.id}/offers`, { data: { kind: 'bogo', offer_id: bogo.id } });
      await expect(attached).toBeOK();
      const withOffer = await attached.json();
      expect(withOffer.offers).toEqual([
        expect.objectContaining({ kind: 'bogo', offer_id: bogo.id, attached: true, name: bogo.name }),
      ]);
      expect((await listCampaigns(api)).find((r) => r.id === first.id)?.offers).toBe(1);

      const badKind = await api.post(`${CAMPAIGNS}/${first.id}/offers`, { data: { kind: 'nope', offer_id: 1 } });
      expect(badKind.status()).toBe(400);
      expect((await badKind.json()).code).toBe('spsg_campaign_invalid_kind');

      // A second campaign over the same days can see the offer but not take it.
      const second = await createCampaign(api, tracker);
      await updateCampaign(api, second.id, { starts_at: campaignDate(5), ends_at: campaignDate(12) });
      const offered = (await (await api.get(`${CAMPAIGNS}/${second.id}/attachable`)).json()).bogo.find(
        (o: { id: number }) => o.id === bogo.id,
      );
      expect(offered).toEqual(expect.objectContaining({ disabled: true }));
      expect(offered.in).toContain(first.name);
      const clash = await api.post(`${CAMPAIGNS}/${second.id}/offers`, { data: { kind: 'bogo', offer_id: bogo.id } });
      expect(clash.status()).toBe(409);
      expect((await clash.json()).code).toBe('spsg_campaign_overlap');

      // Nothing campaign-only to delete with it.
      const preview = await (await api.get(`${CAMPAIGNS}/${first.id}/delete-preview`)).json();
      expect(preview.campaign_only).toEqual([]);

      const row = withOffer.offers[0].row;
      const removed = await api.delete(`${CAMPAIGNS}/${first.id}/offers/${row}`);
      await expect(removed).toBeOK();
      expect((await removed.json()).offers).toEqual([]);

      // A row of another campaign is not this one's.
      expect((await api.delete(`${CAMPAIGNS}/${second.id}/offers/${row}`)).status()).toBe(404);
    });

    test('a deleted campaign is gone and its attached offer stays', async ({ api }) => {
      const bogo = await createBogoOffer(api, {
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
      });
      bogoIds.push(bogo.id);

      const campaign = await createCampaign(api, tracker);
      await api.post(`${CAMPAIGNS}/${campaign.id}/offers`, { data: { kind: 'bogo', offer_id: bogo.id } });

      const deleted = await api.delete(`${CAMPAIGNS}/${campaign.id}`);
      await expect(deleted).toBeOK();
      expect(await deleted.json()).toEqual({ deleted: true });
      tracker.forget(campaign.id);

      expect((await api.get(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(404);
      expect((await api.delete(`${CAMPAIGNS}/${campaign.id}`)).status()).toBe(404);
      expect((await api.get(`/wp-json/sales-booster/v1/bogo/offers/${bogo.id}`)).status()).toBe(200);
    });

    test('unknown ids answer 404', async ({ api }) => {
      for (const res of [
        await api.get(`${CAMPAIGNS}/999999`),
        await api.post(`${CAMPAIGNS}/999999`, { data: { name: 'x' } }),
        await api.post(`${CAMPAIGNS}/999999/pause`),
        await api.get(`${CAMPAIGNS}/999999/attachable`),
      ]) {
        expect(res.status()).toBe(404);
      }
    });
  });
});
