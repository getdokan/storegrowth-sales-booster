import { test, expect } from '../../fixtures/test';
import { setModuleActive, getIsPro, moduleAjax } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoShop, gotoProduct, addToCart, emptyCart, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug } from '../../helpers/wc';
import {
  gotoModuleSettings,
  openTab,
  saveForm,
  setColor,
  setContentCheckbox,
  setRadioInField,
  resetAndSave,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Fly Cart module spec. @pro tests skip without Pro; BOGO/coupon tests also need the seed fixtures below (coupon `e2e10` 10% off; "Buy C get C free" BOGO offer on product C).
const ROUTE = 'fly-cart';
const ICON = '.wfc-cart-icon';
const OPEN_BTN = '.wfc-open-btn';
const SIDEBAR = '.wfc-widget-sidebar';
const COUNT = 'span.wfc-cart-countlocation';
const CONTENT = `${SIDEBAR} .spsg-widget-shopping-cart-content`;
const ITEM_ROW = `${CONTENT} tr.woocommerce-cart-form__cart-item`;
const IMG = `${CONTENT} .spsg-fly-cart-thumbnail-cell img`;
const REMOVE = `${CONTENT} a.spsg-fly-cart-remove`;
const QTY = `${CONTENT} .product-quantity`;
const QTY_INPUT = `${CONTENT} input.qty`;
const PLUS = `${CONTENT} .product-quantity button.spsg-plus-icon`;
const MINUS = `${CONTENT} .product-quantity button.spsg-minus-icon`;
const SUBTOTAL = `${CONTENT} .product-subtotal`;
const COUPON = `${CONTENT} .spsg-coupon`;
const COUPON_INPUT = `${CONTENT} .coupon-input-text`;
const COUPON_APPLY = `${CONTENT} .spsg-apply-coupon`;
const COUPON_RESPONSE = `${CONTENT} .spsg-coupon-response`;
const BOGO_BADGE = `${CONTENT} .bogo-badge-image`;
const FREE_SHIP_NOTICE = `${CONTENT} .spsg-fly-cart-free-shipping-notice`;
const STOCK = `${CONTENT} .spsg-fly-cart-stock-status`;
// Seeded out-of-band; BOGO offer is on product C so its free item never leaks into the product-A tests.
const SEED_COUPON = 'e2e10';
const SEED_BOGO_PRODUCT = PRODUCTS.c;

async function addProductA(page: any) {
  const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
  await addToCart(page, id);
}

async function openDrawer(page: any) {
  await page.locator(OPEN_BTN).first().click();
  await expect(page.locator(ITEM_ROW).first()).toBeVisible();
}

test.describe('Storefront · Fly Cart', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.flyCart.id, true);
    await emptyCart(page);
  });

  test.afterEach(async ({ page }) => {
    await emptyCart(page);
    await setModuleActive(page, MODULES.flyCart.id, true);
    await resetAndSave(page, ROUTE, 'Design');
  });

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
      await expect(drawer).toHaveClass(/wfc-slide/);
      await page.locator('.wfc-open-btn').first().click();
      await expect(drawer).not.toHaveClass(/wfc-slide/);
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

  test.describe('Cart interactions', () => {
    test('adding a product shows it in the drawer with the right count', async ({ page }) => {
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(ITEM_ROW)).toHaveCount(1);
      await expect(page.locator(COUNT).first()).toHaveText('1');
      await expect(page.locator(SUBTOTAL)).toContainText('19.99');
    });

    test('the quantity stepper increases and decreases the item', async ({ page }) => {
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);

      await page.locator(PLUS).click();
      await expect(page.locator(QTY_INPUT)).toHaveValue('2');
      await expect(page.locator(SUBTOTAL)).toContainText('39.98');

      await page.locator(MINUS).click();
      await expect(page.locator(QTY_INPUT)).toHaveValue('1');
      await expect(page.locator(SUBTOTAL)).toContainText('19.99');
    });

    test('removing the item empties the drawer', async ({ page }) => {
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);

      await page.locator(REMOVE).click();
      await expect(page.locator(ITEM_ROW)).toHaveCount(0);
      await expect(page.locator(COUNT).first()).toHaveText('0');
    });

    test('the close button slides the drawer shut', async ({ page }) => {
      await gotoShop(page);
      const drawer = page.locator(SIDEBAR);
      await page.locator(OPEN_BTN).first().click();
      await expect(drawer).not.toHaveClass(/wfc-slide/);
      await page.locator('.spsg-cart-widget-close, .qc-close-nav').first().click();
      await expect(drawer).toHaveClass(/wfc-slide/);
    });

    test('clicking the overlay slides the drawer shut', async ({ page }) => {
      await gotoShop(page);
      const drawer = page.locator(SIDEBAR);
      await page.locator(OPEN_BTN).first().click();
      await expect(drawer).not.toHaveClass(/wfc-slide/);
      await page.locator('.wfc-overlay').click();
      await expect(drawer).toHaveClass(/wfc-slide/);
    });
  });

  test.describe('Design', { tag: '@admin' }, () => {
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

    // Lite position presets; Pro center positions are asserted in the Pro block.
    const LITE_POSITIONS = [
      { index: 0, cls: 'bottom-right' },
      { index: 1, cls: 'top-left' },
      { index: 2, cls: 'top-right' },
      { index: 3, cls: 'bottom-left' },
    ];
    for (const pos of LITE_POSITIONS) {
      test(`Cart Icon Position "${pos.cls}" applies its class to the icon`, async ({ page }) => {
        await gotoModuleSettings(page, ROUTE);
        await openTab(page, 'Design');
        await setRadioInField(page, 'quick-cart-position', pos.index);
        await saveForm(page);

        await gotoShop(page);
        await expect(page.locator(ICON).first()).toHaveClass(new RegExp(`\\b${pos.cls}\\b`));
      });
    }

    const ICON_PRESETS = [0, 1, 2, 3, 4].map((i) => ({ index: i, cls: `shopping-cart-icon-${i + 1}` }));
    for (const icon of ICON_PRESETS) {
      test(`Cart Icon "${icon.cls}" applies its glyph class to the open button`, async ({ page }) => {
        await gotoModuleSettings(page, ROUTE);
        await openTab(page, 'Design');
        await setRadioInField(page, 'quick-icon-layout', icon.index);
        await saveForm(page);

        await gotoShop(page);
        await expect(page.locator(OPEN_BTN).first()).toHaveClass(new RegExp(`\\b${icon.cls}\\b`));
      });
    }

    test('Action Buttons Background applies to the checkout button', async ({ page }) => {
      await addProductA(page);
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Action Buttons Background', '#aa1122');
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      expect(await computedStyle(page, `${SIDEBAR} .spsg-cart-widget-checkout-button`, 'background-color')).toBe(
        'rgb(170, 17, 34)',
      );
    });

    test('Shopping Button Background applies to the continue-shopping button', async ({ page }) => {
      await addProductA(page);
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Shopping Button Background', '#2211aa');
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      expect(await computedStyle(page, `${SIDEBAR} .spsg-cart-widget-shooping-button`, 'background-color')).toBe(
        'rgb(34, 17, 170)',
      );
    });

    test('Product Card Background Color applies to the cart item row', async ({ page }) => {
      await addProductA(page);
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Product Card Background Color', '#334455');
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      expect(await computedStyle(page, ITEM_ROW, 'background-color')).toBe('rgb(51, 68, 85)');
    });
  });

  test.describe('General Setting · Cart Contents', { tag: '@admin' }, () => {
    async function assertToggle(page: any, label: string, marker: string) {
      await addProductA(page);

      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(marker)).toHaveCount(1);

      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, label, false);
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(marker)).toHaveCount(0);
    }

    test('Show Product Image toggles the product thumbnail', async ({ page }) => {
      await assertToggle(page, 'Show Product Image', IMG);
    });

    test('Show Remove Icon toggles the remove link', async ({ page }) => {
      await assertToggle(page, 'Show Remove Icon', REMOVE);
    });

    test('Show Quantity Picker toggles the quantity stepper', async ({ page }) => {
      await assertToggle(page, 'Show Quantity Picker', QTY);
    });

    test('Show product price toggles the item subtotal', async ({ page }) => {
      await assertToggle(page, 'Show product price', SUBTOTAL);
    });

    test('"Cart panel auto-opens" controls auto-open on add-to-cart', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, 'Cart panel auto-opens', false);
      await saveForm(page);

      const id = await getProductIdBySlug(page, PRODUCTS.a.slug); // product A has no BOGO → count 1
      await gotoShop(page);
      const drawer = page.locator(SIDEBAR);
      await expect(drawer).toHaveClass(/wfc-slide/);
      await page.locator(`a.ajax_add_to_cart[data-product_id="${id}"]`).first().click();
      await expect(page.locator(COUNT).first()).toHaveText('1');
      await expect(drawer).toHaveClass(/wfc-slide/);
    });
  });

  test.describe('General Setting · Pro', { tag: ['@pro', '@admin'] }, () => {
    test('Layout "Centered Popup" switches the drawer to the centered layout', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await gotoModuleSettings(page, ROUTE);
      await setRadioInField(page, 'quick-cart-layout', 1);
      await saveForm(page);

      await gotoShop(page);
      await expect(page.locator(SIDEBAR)).toHaveClass(/spsg-quick-cart-center-layout/);
    });

    // Pro adds two centered Cart Icon Position presets (indexes 4 & 5).
    const PRO_POSITIONS = [
      { index: 4, cls: 'center-right' },
      { index: 5, cls: 'center-left' },
    ];
    for (const pos of PRO_POSITIONS) {
      test(`Cart Icon Position "${pos.cls}" applies its class to the icon`, async ({ page }) => {
        test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
        await gotoModuleSettings(page, ROUTE);
        await openTab(page, 'Design');
        await setRadioInField(page, 'quick-cart-position', pos.index);
        await saveForm(page);

        await gotoShop(page);
        await expect(page.locator(ICON).first()).toHaveClass(new RegExp(`\\b${pos.cls}\\b`));
      });
    }

    test('Show Stock Status renders the stock line in the drawer', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await addProductA(page); // product A manages stock (qty 25)

      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, 'Show Stock Status', true);
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(STOCK)).toContainText('Available');
    });

    test('Show coupon toggles the coupon form in the drawer', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required'); // coupon UI is Pro-rendered
      await addProductA(page);

      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(COUPON)).toHaveCount(1);

      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, 'Show coupon', false);
      await saveForm(page);

      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(COUPON)).toHaveCount(0);
    });

    test('applying a coupon discounts the cart', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);

      await page.locator(COUPON_INPUT).fill(SEED_COUPON);
      await page.locator(COUPON_APPLY).click();
      await expect(page.locator(COUPON_RESPONSE)).toContainText('applied successfully');
      await expect(page.locator(`${CONTENT} .cart-discount.coupon-${SEED_COUPON}`)).toBeVisible();

      // Drop the coupon so it can't leak into other tests' totals.
      await page.locator(`${CONTENT} .woocommerce-remove-coupon`).first().click();
      await expect(page.locator(`${CONTENT} .cart-discount.coupon-${SEED_COUPON}`)).toHaveCount(0);
    });

    test.fixme('Show BOGO Badge renders the BOGO badge on a matching item', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, 'Show BOGO Badge', true);
      await saveForm(page);

      const id = await getProductIdBySlug(page, SEED_BOGO_PRODUCT.slug);
      await addToCart(page, id);
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(BOGO_BADGE).first()).toBeVisible();
    });

    test('Show Free Shipping Message renders the free-shipping notice', async ({ page, guestPage }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      // The notice text comes from the Progressive Discount Banner helper. Its
      // save replaces the whole option, so give it (under shipping_bar_data) a
      // progressive message and a minimum far above the cart so the "add more"
      // text renders rather than the goal text.
      await moduleAjax(page, 'spsg_pd_banner_save_settings', {
        form_data: JSON.stringify({
          shipping_bar_data: {
            discount_type: 'free-shipping',
            cart_minimum_amount: 100000,
            progressive_banner_text: 'Add [amount] more to get FREE SHIPPING.',
            goal_completion_text: 'You unlocked free shipping!',
          },
        }),
      });

      await gotoModuleSettings(page, ROUTE);
      await setContentCheckbox(page, 'Show Free Shipping Message', true);
      await saveForm(page);

      // The notice is a guest/customer-only promotion, so assert it on guestPage.
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await addToCart(guestPage, id);
      await gotoShop(guestPage);
      await openDrawer(guestPage);
      await expect(guestPage.locator(FREE_SHIP_NOTICE)).toBeVisible();
      await expect(guestPage.locator(FREE_SHIP_NOTICE)).toContainText('FREE SHIPPING');
    });
  });

  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.flyCart.name, false);
      await setModuleState(page, MODULES.flyCart.name, true);
      await expect(moduleToggle(page, MODULES.flyCart.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
