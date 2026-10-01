import { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings, openTab, resetSettings, saveSettings, setField } from '../../helpers/settings-ui';
import { computedStyle, gotoProduct, gotoShop } from '../../helpers/storefront';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Quick View (docs/redesign/modules/quick-view.md). Setup through REST; the
// button / modal styles are an inline <style> (read computed styles).
// The modal HTML comes from a cacheable GET (`admin-ajax.php?product_id=`):
// tests that change the modal's content open it in a FRESH context
// (`guestPage`) so the browser cache can't serve the old markup.
const id = MODULES.quickView.id;
const BTN = '.spsgqcv-btn';
const POPUP = '.spsgqcv-popup';

let pro: boolean | undefined;
async function isPro(api: APIRequestContext): Promise<boolean> {
  pro ??= await hasPro(api);
  return pro;
}

async function openModal(page: Page, productId: number): Promise<void> {
  await gotoShop(page);
  await page.locator(`.spsgqcv-btn-${productId}`).click();
  await expect(page.locator(POPUP)).toBeVisible();
}

test.describe('Storefront · Quick View', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.describe('Render behaviour', () => {
    test('adds a Quick View button to every product in the shop loop', async ({ page }) => {
      await gotoShop(page);
      await expect(page.locator(BTN).first()).toBeVisible();
      expect(await page.locator(BTN).count()).toBe(await page.locator('ul.products li.product').count());
    });

    test('clicking a Quick View button opens the product modal', async ({ page }) => {
      await openModal(page, PRODUCTS.a.id);
      await expect(page.locator(`${POPUP} .product_title`)).toContainText(PRODUCTS.a.name);
      await expect(page.locator(`${POPUP} .single_add_to_cart_button`)).toBeVisible();
    });

    test('no Quick View button in the main single-product summary', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(`.summary ${BTN}`)).toHaveCount(0);
    });

    test('no Quick View button when the module is inactive', async ({ page, api }) => {
      await setModuleStatus(api, id, false);
      await gotoShop(page);
      await expect(page.locator(BTN)).toHaveCount(0);
    });
  });

  test.describe('General', () => {
    test('Quick View Button label is the button text', async ({ page, api }) => {
      await saveModuleSettings(api, id, { button_label: 'Peek Inside' });
      await gotoShop(page);
      await expect(page.locator(BTN).first()).toHaveText('Peek Inside');
    });

    test('Button Position "Before Add to Cart" puts the button first', async ({ page, api }) => {
      const order = async () =>
        page.locator('ul.products li.product').first().evaluate((li) => {
          const qv = li.querySelector('.spsgqcv-btn')!;
          const atc = li.querySelector('.add_to_cart_button, .product_type_simple:not(.spsgqcv-btn)')!;
          return qv.compareDocumentPosition(atc) & Node.DOCUMENT_POSITION_FOLLOWING ? 'before' : 'after';
        });

      await gotoShop(page);
      expect(await order()).toBe('after');

      await saveModuleSettings(api, id, { button_position: 'before_add_to_cart' });
      await gotoShop(page);
      expect(await order()).toBe('before');
    });

    const contentToggles = [
      { key: 'show_title', selector: '.product_title' },
      { key: 'show_price', selector: '.price' },
      { key: 'show_add_to_cart', selector: '.single_add_to_cart_button' },
      { key: 'show_meta', selector: '.product_meta' },
    ];

    test('all content sections show by default', async ({ guestPage }) => {
      await openModal(guestPage, PRODUCTS.a.id);
      for (const t of contentToggles) {
        await expect(guestPage.locator(`${POPUP} ${t.selector}`).first()).toBeVisible();
      }
    });

    for (const t of contentToggles) {
      test(`"${t.key}" off removes ${t.selector} from the modal`, async ({ api, guestPage }) => {
        await saveModuleSettings(api, id, { [t.key]: false });
        await openModal(guestPage, PRODUCTS.a.id);
        await expect(guestPage.locator(`${POPUP} ${t.selector}`)).toHaveCount(0);
      });
    }

    test('"Show Title" off from the settings page removes the modal title', async ({ page, api, guestPage }) => {
      const { schema } = await getModuleSettings(api, id);
      await gotoSettings(page, id, 'general');
      await setField(page, schema.show_title, false);
      await saveSettings(page, id);

      await openModal(guestPage, PRODUCTS.a.id);
      await expect(guestPage.locator(`${POPUP} .product_title`)).toHaveCount(0);
    });
  });

  test.describe('Design', () => {
    const cases: [string, Record<string, unknown>, string, string][] = [
      ['Button Color is applied to the Quick View button', { button_color: '#ff0000' }, 'background-color', 'rgb(255, 0, 0)'],
      ['Button Text Color is applied to the Quick View button', { button_text_color: '#00bb00' }, 'color', 'rgb(0, 187, 0)'],
      ['Button Border Radius is applied to the Quick View button', { button_border_radius: 18 }, 'border-top-left-radius', '18px'],
    ];
    for (const [title, values, prop, expected] of cases) {
      test(title, async ({ page, api }) => {
        await saveModuleSettings(api, id, values);
        await gotoShop(page);
        expect(await computedStyle(page, BTN, prop)).toBe(expected);
      });
    }

    test('Modal Background Color is applied to the opened modal', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { modal_background_color: '#fafad2' });
      await openModal(guestPage, PRODUCTS.a.id);
      expect(await computedStyle(guestPage, `${POPUP} .product .summary`, 'background-color')).toBe('rgb(250, 250, 210)');
    });

    test('the settings page Reset reverts the design to defaults', async ({ page, api }) => {
      const { schema } = await getModuleSettings(api, id);
      await saveModuleSettings(api, id, { button_color: '#ff0000' });

      await gotoSettings(page, id);
      await openTab(page, 'Design');
      await resetSettings(page, id);
      expect((await getModuleSettings(api, id)).values.button_color).toBe(schema.button_color.default);

      await gotoShop(page);
      expect(await computedStyle(page, BTN, 'background-color')).not.toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Pro', { tag: '@pro' }, () => {
    test('lite ignores the pro keys and pro-only positions', async ({ api }) => {
      test.skip(await isPro(api), 'lite-only behaviour');
      const saved = await saveModuleSettings(api, id, {
        enable_qucik_view_icon: true,
        show_view_details_button: true,
        navigation_background: '#123456',
        button_position: 'top_right_of_the_image',
      });
      expect(saved.values).toMatchObject({
        enable_qucik_view_icon: false,
        show_view_details_button: false,
        navigation_background: '#000000',
        button_position: 'after_add_to_cart',
      });
    });
  });

  // Last: the UI toggle churns shared state.
  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.quickView.name, false);
      await setModuleState(page, MODULES.quickView.name, true);
      await expect(moduleToggle(page, MODULES.quickView.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
