import { test, expect } from '../../fixtures/test';
import { spsgAdminAjax } from '../../helpers/ajax';
import { MODULES } from '../../data/modules';

const findModule = (catalog: any[], id: string) => catalog.find((m) => m.id === id);

test.describe('Admin · module ajax', () => {
  test('get_all_modules returns the full catalog', async ({ page }) => {
    const { status, body } = await spsgAdminAjax(page, 'get_all_modules');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBeTruthy();

    const ids = body.map((m: any) => m.id);
    for (const mod of Object.values(MODULES)) {
      expect(ids, `catalog should include ${mod.id}`).toContain(mod.id);
    }
    for (const m of body) {
      expect(m).toMatchObject({ id: expect.any(String), name: expect.any(String) });
      expect(typeof m.status).toBe('boolean');
    }
  });

  test('update_module_status deactivates then reactivates a module', async ({ page }) => {
    // Owns Sales Notification; toggle off → on and leave active.
    const id = MODULES.salesPop.id;

    const off = await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'false' });
    expect(off.status).toBe(200);
    let cat = (await spsgAdminAjax(page, 'get_all_modules')).body;
    expect(findModule(cat, id)?.status).toBe(false);

    const on = await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'true' });
    expect(on.status).toBe(200);
    cat = (await spsgAdminAjax(page, 'get_all_modules')).body;
    expect(findModule(cat, id)?.status).toBe(true);
  });

  test('rejects ajax without a valid nonce', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=spsg-modules');
    const res = await page.request.post('/wp-admin/admin-ajax.php', {
      form: {
        action: 'spsg_admin_ajax',
        method: 'get_all_modules',
        _ajax_nonce: 'not-a-real-nonce',
      },
    });
    expect(res.status()).toBe(403);
  });
});
