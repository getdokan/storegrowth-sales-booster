import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoShop, gotoProduct, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug } from '../../helpers/wc';
import {
  gotoModuleSettings, openTab, saveForm, setColor, setNumber, setContentCheckbox, resetForm, resetAndSave,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

const ROUTE = 'quick-view';
const BTN = '.spsgqcv-btn';
const POPUP = '.spsgqcv-popup';

// Modal HTML is fetched via a cacheable GET (`?product_id=`), so tests that change
// content settings must open it in a FRESH context (guestPage) to dodge a stale cache.
async function openModal(targetPage: any, id: number) {
  await gotoShop(targetPage);
  await targetPage.locator(`.spsgqcv-btn-${id}`).click();
  await expect(targetPage.locator(POPUP)).toBeVisible();
}

test.describe('Storefront · Quick View', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.quickView.id, true);
  });

  test.afterEach(async ({ page }) => {
    await setModuleActive(page, MODULES.quickView.id, true);
    await resetAndSave(page, ROUTE, 'Design');
  });

  test.describe('Render behaviour', () => {
    test('adds a Quick View button to every product in the shop loop', async ({ page }) => {
      await gotoShop(page);
      await expect(page.locator(BTN).first()).toBeVisible();
      const products = await page.locator('ul.products li.product').count();
      expect(await page.locator(BTN).count()).toBe(products);
    });

    test('clicking a Quick View button opens the product modal', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await openModal(page, id);
      await expect(page.locator(`${POPUP} .product_title`)).toContainText(PRODUCTS.a.name);
      await expect(page.locator(`${POPUP} .single_add_to_cart_button`)).toBeVisible();
    });

    test('no Quick View button in the main single-product summary', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.summary .spsgqcv-btn')).toHaveCount(0);
    });

    test('no Quick View button when the module is inactive', async ({ page }) => {
      await setModuleActive(page, MODULES.quickView.id, false);
      await gotoShop(page);
      await expect(page.locator(BTN)).toHaveCount(0);
    });
  });

  test.describe('General Setting', () => {
    const contentToggles = [
      { label: 'Show Title', selector: '.product_title' },
      { label: 'Show Price', selector: '.price' },
      { label: 'Show Add to Cart', selector: '.single_add_to_cart_button' },
      { label: 'Show Product Meta', selector: '.product_meta' },
    ];

    for (const t of contentToggles) {
      test(`"${t.label}" off removes ${t.selector} from the modal`, async ({ page, guestPage }) => {
        const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
        await gotoModuleSettings(page, ROUTE);
        await setContentCheckbox(page, t.label, false);
        await saveForm(page);

        await openModal(guestPage, id);
        await expect(guestPage.locator(`${POPUP} ${t.selector}`)).toHaveCount(0);
      });
    }

    test('all content sections show by default', async ({ page, guestPage }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await openModal(guestPage, id);
      for (const t of contentToggles) {
        await expect(guestPage.locator(`${POPUP} ${t.selector}`).first()).toBeVisible();
      }
    });
  });

  test.describe('Design', () => {
    test('Button Color is applied to the Quick View button', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Button Color', '#ff0000');
      await saveForm(page);
      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });

    test('Button Text Color is applied to the Quick View button', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Button Text Color', '#00bb00');
      await saveForm(page);
      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'color')).toBe('rgb(0, 187, 0)');
    });

    test('Button Border Radius is applied to the Quick View button', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Button Border Radius', 18);
      await saveForm(page);
      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'border-top-left-radius')).toBe('18px');
    });

    test('Modal Background Color is applied to the opened modal', async ({ page, guestPage }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Modal Background Color', '#fafad2');
      await saveForm(page);
      await openModal(guestPage, id);
      expect(await computedStyle(guestPage, `${POPUP} .product .summary`, 'background-color')).toBe('rgb(250, 250, 210)');
    });

    test('the Reset button reverts the design to defaults', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Button Color', '#ff0000');
      await saveForm(page);
      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'background-color')).toBe('rgb(255, 0, 0)');

      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await resetForm(page);
      await saveForm(page);
      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'background-color')).not.toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.quickView.name, false);
      await setModuleState(page, MODULES.quickView.name, true);
      await expect(moduleToggle(page, MODULES.quickView.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
