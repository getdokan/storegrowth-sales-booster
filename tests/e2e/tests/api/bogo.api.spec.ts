import { test, expect } from '../../fixtures/test';
import type { APIRequestContext } from '@playwright/test';

// The duplicate guard rejects a second *active* offer on the same products, so
// each test uses distinct products and deletes what it creates.
const BASE = '/wp-json/sales-booster/v1/bogo/offers';

function offerPayload(overrides: Record<string, unknown> = {}) {
  return {
    name_of_order_bogo: 'E2E BOGO Offer',
    offer_type: 'percentage',
    box_border_style: 'solid',
    box_border_color: '#000000',
    box_top_margin: '10',
    box_bottom_margin: '10',
    discount_background_color: '#ff0000',
    discount_text_color: '#ffffff',
    discount_font_size: '14',
    product_description_text_color: '#333333',
    product_description_font_size: '12',
    ...overrides,
  };
}

async function deleteOffer(api: APIRequestContext, id: number | string) {
  await api.delete(`${BASE}/${id}`);
}

test.describe('API · BOGO offers', () => {
  test('lists offers as an array', async ({ api }) => {
    const res = await api.get(BASE);
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('rejects a create that is missing required fields', async ({ api }) => {
    const res = await api.post(BASE, { data: { name_of_order_bogo: 'incomplete' } });
    expect(res.status()).toBe(400);
  });

  test('full lifecycle: create → read → update → toggle status → delete', async ({ api }) => {
    let id: number | undefined;
    try {
      const created = await api.post(BASE, {
        data: offerPayload({ name_of_order_bogo: 'E2E Lifecycle', offered_products: [10] }),
      });
      expect(created.status()).toBe(201);
      const offer = await created.json();
      id = offer.id;
      expect(offer.name).toBe('E2E Lifecycle');
      expect(offer.status).toBe('active');

      const read = await api.get(`${BASE}/${id}`);
      expect(read.status()).toBe(200);
      expect((await read.json()).id).toBe(id);

      const updated = await api.put(`${BASE}/${id}`, {
        data: offerPayload({ name_of_order_bogo: 'E2E Lifecycle Renamed', offered_products: [10] }),
      });
      expect(updated.status()).toBe(200);
      expect((await updated.json()).name).toBe('E2E Lifecycle Renamed');

      const status = await api.put(`${BASE}/${id}/status`, { data: { status: 'no' } });
      expect(status.status()).toBe(200);
      expect((await status.json()).status).toBe('no');
    } finally {
      if (id) await deleteOffer(api, id);
    }
  });

  test('reading a non-existent offer 404s', async ({ api }) => {
    const res = await api.get(`${BASE}/99999999`);
    expect(res.status()).toBe(404);
  });
});
