import { test, expect } from '../../fixtures/test';
import { moduleAjax, setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { MODULES } from '../../data/modules';

/**
 * Free Shipping Rules (progressive-discount-banner) — a free-shipping progress
 * bar. It is a "promotion" (guest/customer only) injected in wp_footer.
 *
 * NOTE (see ISSUES.md #5): the bar markup is server-rendered but removed at
 * runtime by the module's JS unless a free-shipping threshold is in play, so the
 * `.spsg-pd-banner-bar-wrapper` isn't reliably present in the live DOM. The
 * reliable storefront signal is the body class `show_discount_banner`. Full
 * visual coverage needs a configured WooCommerce free-shipping method (a good
 * follow-up). Owns the `progressive-discount-banner` module.
 */
const BODY_FLAG = /show_discount_banner/;

async function saveBanner(page: any, data: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_pd_banner_save_settings', {
    form_data: JSON.stringify({ shipping_bar_data: data }),
  });
}

test.describe('Storefront · Free Shipping Rules', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.freeShipping.id, true);
  });

  test.afterEach(async ({ page }) => {
    await setModuleActive(page, MODULES.freeShipping.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.freeShipping.name, false);
    await setModuleState(page, MODULES.freeShipping.name, true);
    await expect(moduleToggle(page, MODULES.freeShipping.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('marks the storefront as showing the discount banner for a guest', async ({ guestPage }) => {
    await guestPage.goto('/shop/');
    await expect(guestPage.locator('body')).toHaveClass(BODY_FLAG);
  });

  test('settings save → get round-trips the banner config', async ({ page }) => {
    const save = await saveBanner(page, { default_banner_text: 'Free shipping over $50!' });
    expect(save.status).toBe(200);

    const get = await moduleAjax(page, 'spsg_pd_banner_get_settings');
    expect(get.status).toBe(200);
    expect(get.body?.data?.default_banner_text).toBe('Free shipping over $50!');

    await saveBanner(page, {}); // reset
  });

  // ---- Negative --------------------------------------------------------------

  test('no discount-banner flag when the module is inactive', async ({ page, guestPage }) => {
    await setModuleActive(page, MODULES.freeShipping.id, false);

    await guestPage.goto('/shop/');
    await expect(guestPage.locator('body')).not.toHaveClass(BODY_FLAG);
  });
});
