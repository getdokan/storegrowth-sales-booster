import { test, expect } from '../../fixtures/test';
import { spsgAdminAjax } from '../../helpers/ajax';
import { isModuleActive, listModules, setModuleStatus } from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// The legacy `spsg_admin_ajax` actions (`get_all_modules`, `update_module_status`)
// stay for back-compat (ADR-004: pro 2.2.0 and old integrations still call them).
// They must agree with the REST modules API the new admin uses.

type CatalogEntry = { id: string; name: string; status: boolean };

const findModule = (catalog: CatalogEntry[], id: string) => catalog.find((m) => m.id === id);

test.describe('Admin · module ajax (legacy)', { tag: '@ui' }, () => {
  const id = MODULES.salesPop.id;

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
  });

  test('get_all_modules returns the full catalog, matching REST', async ({ page, api }) => {
    const { status, body } = await spsgAdminAjax(page, 'get_all_modules');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBeTruthy();

    const catalog = body as CatalogEntry[];
    for (const mod of Object.values(MODULES)) {
      expect(findModule(catalog, mod.id), `catalog should include ${mod.id}`).toBeTruthy();
    }
    for (const m of catalog) {
      expect(m).toMatchObject({ id: expect.any(String), name: expect.any(String) });
      expect(typeof m.status).toBe('boolean');
    }

    const rest = await listModules(api);
    for (const m of rest) {
      expect(findModule(catalog, m.id)?.status, `${m.id}: ajax status = REST status`).toBe(m.status);
    }
  });

  test('update_module_status deactivates then reactivates a module (seen by REST)', async ({ page, api }) => {
    const off = await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'false' });
    expect(off.status).toBe(200);
    expect(off.body?.success).toBe(true);
    expect(findModule((await spsgAdminAjax(page, 'get_all_modules')).body, id)?.status).toBe(false);
    expect(await isModuleActive(api, id)).toBe(false);

    const on = await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'true' });
    expect(on.status).toBe(200);
    expect(on.body?.success).toBe(true);
    expect(findModule((await spsgAdminAjax(page, 'get_all_modules')).body, id)?.status).toBe(true);
    expect(await isModuleActive(api, id)).toBe(true);
  });

  test('a method outside the allow-list is refused', async ({ page }) => {
    const res = await spsgAdminAjax(page, 'spsg_inisetup_flag_update');
    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  test('rejects ajax without a valid nonce', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=storegrowth#/modules');
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
