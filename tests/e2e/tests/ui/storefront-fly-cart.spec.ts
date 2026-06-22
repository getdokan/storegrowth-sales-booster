import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoShop, gotoProduct, addToCart, emptyCart, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug } from '../../helpers/wc';
import { gotoModuleSettings, openTab, saveForm, setColor, setCheckbox, resetAndSave } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Fly Cart — full module spec. Design is driven END-TO-END through the real
 * admin Settings form (helpers/settings-ui), then validated on the storefront.
 *
 * Site-wide slide-out cart (wp_footer), shown to everyone (not promotion-gated).
 * Markers: `.wfc-cart-icon`, `.wfc-icon`, `.wfc-open-btn`, `.wfc-widget-sidebar`
 * (drawer; closed = has `wfc-slide`), `span.wfc-cart-countlocation`. Colors are
 * injected CSS → validated via computed styles. Baseline-active.
 */
const ROUTE = 'fly-cart';
const ICON = '.wfc-cart-icon';
const SIDEBAR = '.wfc-widget-sidebar';
const COUNT = 'span.wfc-cart-countlocation';

test.describe('Storefront · Fly Cart', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.flyCart.id, true);
    await emptyCart(page);
  });

  test.afterEach(async ({ page }) => {
    await emptyCart(page);
    // Ensure active, then reset design to defaults via the Reset button (no leak).
    await setModuleActive(page, MODULES.flyCart.id, true);
    await resetAndSave(page, ROUTE, 'Design');
  });

  // ===== Render behaviour ====================================================

  test.describe('Render behaviour', () => {
    test('shows the floating cart icon site-wide', async ({ page }) => {
      await gotoShop(page);
      await expect(page.locator(ICON).first()).toBeVisible();
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(ICON).first()).toBeVisible();
    });

    test('clicking the icon opens the cart drawer', async ({ page }) => {
      await gotoShop(page);
      const drawer = page.locator(SIDEBAR);
      await expect(drawer).toHaveClass(/wfc-slide/); // closed
      await page.locator('.wfc-open-btn').first().click();
      await expect(drawer).not.toHaveClass(/wfc-slide/); // open
      await expect(page.locator('.wfc-cart-heading')).toBeVisible();
    });

    test('count badge reflects the cart contents', async ({ page }) => {
      await gotoShop(page);
      await expect(page.locator(COUNT).first()).toHaveText('0');
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await addToCart(page, id);
      await gotoShop(page);
      await expect(page.locator(COUNT).first()).toHaveText('1');
    });

    test('no cart icon when the module is inactive', async ({ page }) => {
      await setModuleActive(page, MODULES.flyCart.id, false);
      await gotoShop(page);
      await expect(page.locator(ICON)).toHaveCount(0);
    });
  });

  // ===== Design (admin UI → storefront) ======================================

  test.describe('Design', () => {
    test('Cart Icon Color applies to the cart icon', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Cart Icon Color', '#ff0000');
      await saveForm(page);

      await gotoShop(page);
      expect(await computedStyle(page, `${ICON} .wfc-icon`, 'color')).toBe('rgb(255, 0, 0)');
    });

    test('Widget Background Color applies to the cart drawer', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Widget Background Color', '#112233');
      await saveForm(page);

      await gotoShop(page);
      expect(await computedStyle(page, SIDEBAR, 'background-color')).toBe('rgb(17, 34, 51)');
    });

  });

  // ===== Content toggle (admin UI → storefront drawer) =======================

  test.describe('Cart contents', () => {
    test('"Show product price" toggles the price in the drawer', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await addToCart(page, id);

      // Turn the price off via the real form.
      await gotoModuleSettings(page, ROUTE);
      await setCheckbox(page, 'Show product price', false);
      await saveForm(page);

      await gotoShop(page);
      await page.locator('.wfc-open-btn').first().click();
      await expect(page.locator(`${SIDEBAR} .wfc-product-price, ${SIDEBAR} .wfc-cart-product-price`)).toHaveCount(0);

      // Restore.
      await gotoModuleSettings(page, ROUTE);
      await setCheckbox(page, 'Show product price', true);
      await saveForm(page);
    });
  });

  // ===== Enable ==============================================================

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.flyCart.name, false);
      await setModuleState(page, MODULES.flyCart.name, true);
      await expect(moduleToggle(page, MODULES.flyCart.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
