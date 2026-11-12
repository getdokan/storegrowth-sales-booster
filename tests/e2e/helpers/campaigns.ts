import { APIRequestContext, expect } from '@playwright/test';
import { expectOk } from './rest';

// REST helpers for Campaigns (`sales-booster/v1/campaigns`, ADR-016). Reading
// needs `manage_woocommerce`; every write needs an active Pro licence
// (`has_pro()`), else 403 `spsg_campaigns_need_pro`.
//
// A published campaign that is running turns on the referee for every cart on
// the site, so a spec must delete the campaigns it made, also when it fails:
// create through `createCampaign()` with a `CampaignTracker` and call
// `tracker.cleanup()` in afterEach. It deletes only the ids it made.

export const CAMPAIGNS = '/wp-json/sales-booster/v1/campaigns';

/** A readiness line of a campaign. */
export type CampaignCheck = {
  kind: 'blocking' | 'warning' | 'info';
  code: string;
  message: string;
  fix: string;
  data: Record<string, unknown>;
};

/** An offer row on a campaign's rail. */
export type CampaignOfferRow = {
  row: number;
  kind: 'bogo' | 'order_bump' | 'smart_coupon';
  offer_id: number | null;
  name: string;
  attached: boolean;
  customised: boolean;
  coupon_id: number;
};

/** A campaign as `GET campaigns/{id}` returns it (the fields specs read). */
export type Campaign = {
  id: number;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'ended';
  starts_at: string | null;
  ends_at: string | null;
  paused_at: string | null;
  slug: string;
  settings: Record<string, any>;
  offers: CampaignOfferRow[];
  scope: { all: boolean; products: number[]; categories: number[]; derived: boolean };
  checks: CampaignCheck[];
  can_publish: boolean;
  read_only: boolean;
  [key: string]: unknown;
};

/** A row of `GET campaigns`. */
export type CampaignListRow = {
  id: number;
  name: string;
  status: string;
  offers: number;
  licence_stopped: boolean;
  [key: string]: unknown;
};

let seq = 0;
/** A unique campaign name, so repeated runs never collide. */
export function campaignName(prefix = 'E2E Campaign'): string {
  seq += 1;
  return `${prefix} ${Date.now()}-${seq}`;
}

/**
 * A campaign date (`YYYY-MM-DD HH:MM`, site-local) `days` from now. The
 * margins the specs use (a day or more) cover any site timezone.
 */
export function campaignDate(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

/**
 * Whether the Campaigns routes exist: they are StoreGrowth Pro's, registered
 * whenever the Pro plugin is active (licensed or not).
 */
export async function campaignRoutesExist(api: APIRequestContext): Promise<boolean> {
  const res = await api.get(CAMPAIGNS);
  if (res.status() === 404) {
    expect((await res.json()).code).toBe('rest_no_route');
    return false;
  }
  return true;
}

/**
 * Whether campaigns can be written. Campaigns are StoreGrowth Pro's: without
 * the Pro plugin the route doesn't exist (404 `rest_no_route`); with Pro but
 * no licence the write routes answer 403 `spsg_campaigns_need_pro`. Probes
 * with an invalid campaign id so nothing is written either way.
 */
export async function campaignsAvailable(api: APIRequestContext): Promise<boolean> {
  const res = await api.post(`${CAMPAIGNS}/0/publish`);
  const body = await res.json().catch(() => ({}));

  if (res.status() === 403) {
    expect(body.code).toBe('spsg_campaigns_need_pro');
    return false;
  }

  expect(res.status()).toBe(404);
  // With Pro licensed the request reaches the handler: campaign 0 doesn't exist.
  return body.code !== 'rest_no_route';
}

/** Remembers the campaigns a spec made and deletes only those. */
export class CampaignTracker {
  private ids = new Set<number>();

  constructor(private api: APIRequestContext) {}

  track(id: number): void {
    this.ids.add(id);
  }

  forget(id: number): void {
    this.ids.delete(id);
  }

  /** Delete every tracked campaign; a 404 (already gone) is fine. */
  async cleanup(): Promise<void> {
    for (const id of this.ids) {
      const res = await this.api.delete(`${CAMPAIGNS}/${id}`);
      expect([200, 404], `delete campaign ${id}`).toContain(res.status());
    }
    this.ids.clear();
  }
}

/** Create a draft campaign (blank, or from a template). */
export async function createCampaign(
  api: APIRequestContext,
  tracker: CampaignTracker,
  data: { name?: string; template?: string } = {},
): Promise<Campaign> {
  const res = await api.post(CAMPAIGNS, { data: { name: campaignName(), ...data } });
  await expectOk(res, 'create campaign');
  const campaign: Campaign = await res.json();
  tracker.track(campaign.id);
  return campaign;
}

/** One campaign. */
export async function getCampaign(api: APIRequestContext, id: number): Promise<Campaign> {
  const res = await api.get(`${CAMPAIGNS}/${id}`);
  await expectOk(res, `read campaign ${id}`);
  return res.json();
}

/** Save a campaign's name, dates or settings. */
export async function updateCampaign(
  api: APIRequestContext,
  id: number,
  data: Record<string, unknown>,
): Promise<Campaign> {
  const res = await api.post(`${CAMPAIGNS}/${id}`, { data });
  await expectOk(res, `update campaign ${id}`);
  return res.json();
}

/** publish | unpublish | pause | resume | end | clone. */
export async function campaignAction(
  api: APIRequestContext,
  id: number,
  action: 'publish' | 'unpublish' | 'pause' | 'resume' | 'end' | 'clone',
): Promise<Campaign> {
  const res = await api.post(`${CAMPAIGNS}/${id}/${action}`);
  await expectOk(res, `${action} campaign ${id}`);
  return res.json();
}

/** Every campaign row of the list. */
export async function listCampaigns(api: APIRequestContext): Promise<CampaignListRow[]> {
  const res = await api.get(CAMPAIGNS);
  await expectOk(res, 'list campaigns');
  return (await res.json()).items;
}

/**
 * A running campaign: from yesterday for a week, with a campaign price of
 * `percent` off `products`. Published, so it applies on the storefront.
 */
export async function createRunningPriceCampaign(
  api: APIRequestContext,
  tracker: CampaignTracker,
  products: number[],
  percent: number,
): Promise<Campaign> {
  const campaign = await createCampaign(api, tracker);
  await updateCampaign(api, campaign.id, {
    starts_at: campaignDate(-1),
    ends_at: campaignDate(7),
    settings: { campaign_price: { percent, products } },
  });
  const published = await campaignAction(api, campaign.id, 'publish');
  expect(published.status).toBe('running');
  return published;
}
