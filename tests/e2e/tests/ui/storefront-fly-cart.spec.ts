import { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { createBogoOffer, deleteBogoOffer } from '../../helpers/records';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings, saveSettings, setField } from '../../helpers/settings-ui';
import { gotoShop, gotoProduct, addToCart, emptyCart, computedStyle } from '../../helpers/storefront';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Fly Cart (docs/redesign/modules/fly-cart.md). Setup through REST; colours
// are asserted as computed styles. Pro keys (layout `center`, centre icon
// positions, stock status, BOGO badge, free-shipping message, coupon, "Cart
// panel auto-opens") are ignored by a lite save, so their tests need pro.
const ID = MODULES.flyCart.id;
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
const SEED_COUPON = 'e2e10'; // bin/provision-site.php

let pro: boolean | undefined;
async function isPro(api: APIRequestContext): Promise<boolean> {
  pro ??= await hasPro(api);
  return pro;
}

async function addProductA(page: Page): Promise<void> {
  await addToCart(page, PRODUCTS.a.id);
}

async function openDrawer(page: Page): Promise<void> {
  await page.locator(OPEN_BTN).first().click();
  await expect(page.locator(SIDEBAR)).not.toHaveClass(/wfc-slide/);
  await expect(page.locator(ITEM_ROW).first()).toBeVisible();
  // Let the slide-in settle, so the drawer's controls are stable to click.
  await page.locator(SIDEBAR).evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
        .map((a) => a.finished),
    ),
  );
}

test.describe('Storefront · Fly Cart', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page, api }) => {
    await setModuleStatus(api, ID, true);
    await resetModuleSettings(api, ID);
    await emptyCart(page);
  });

  test.afterEach(async ({ page, api }) => {
    await emptyCart(page);
    await setModuleStatus(api, ID, true);
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
      await page.locator(OPEN_BTN).first().click();
      await expect(drawer).not.toHaveClass(/wfc-slide/);
      await expect(page.locator('.wfc-cart-heading')).toBeVisible();
    });

    test('count badge reflects the cart contents', async ({ page }) => {
      await gotoShop(page);
      await expect(page.locator(COUNT).first()).toHaveText('0');
      await addProductA(page);
      await gotoShop(page);
      await expect(page.locator(COUNT).first()).toHaveText('1');
    });

    test('no cart icon when the module is inactive', async ({ page, api }) => {
      await setModuleStatus(api, ID, false);
      await gotoShop(page);
      await expect(page.locator(ICON)).toHaveCount(0);
    });

    test('no cart icon on the cart and checkout pages', async ({ page }) => {
      await addProductA(page);
      await page.goto('/cart/');
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
      await expect(page.locator(SUBTOTAL)).toContainText(PRODUCTS.a.price);
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
      await expect(page.locator(SUBTOTAL)).toContainText(PRODUCTS.a.price);
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
      await page.locator(`${SIDEBAR} .wfc-close-btn`).click();
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

    // Spec §2 known bug, fixed in the migration: the plugin's
    // `woocommerce_add_to_cart_fragments` filter dropped other fragments.
    test('an ajax add-to-cart still refreshes the theme mini-cart fragment', async ({ page }) => {
      await gotoShop(page);
      const themeCount = page.locator('.site-header-cart a.cart-contents .count').first();
      await expect(themeCount).toContainText('0 items');
      await page.locator(`a.ajax_add_to_cart[data-product_id="${PRODUCTS.a.id}"]`).first().click();
      await expect(page.locator(COUNT).first()).toHaveText('1');
      await expect(themeCount).toContainText('1 item');
    });
  });

  test.describe('Design', () => {
    test('Cart Icon Color colours the floating icon', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { icon_color: '#ff0000' });
      await gotoShop(page);
      expect(await computedStyle(page, `${ICON} .wfc-icon`, 'color')).toBe('rgb(255, 0, 0)');
      await expect(page.locator(`${OPEN_BTN} svg`).first()).toHaveAttribute('stroke', '#ff0000');
    });

    test('Widget Background Color applies to the cart drawer', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { widget_bg_color: '#112233' });
      await gotoShop(page);
      expect(await computedStyle(page, SIDEBAR, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('Action Buttons Background applies to the checkout button and the icon', async ({ page, api }) => {
      await addProductA(page);
      await saveModuleSettings(api, ID, { buttons_bg_color: '#aa1122' });
      await gotoShop(page);
      expect(await computedStyle(page, `${OPEN_BTN} svg`, 'background-color')).toBe('rgb(170, 17, 34)');
      await openDrawer(page);
      expect(await computedStyle(page, `${SIDEBAR} .spsg-cart-widget-checkout-button`, 'background-color')).toBe(
        'rgb(170, 17, 34)',
      );
    });

    test('Shopping Button Background applies to the continue-shopping button', async ({ page, api }) => {
      await addProductA(page);
      await saveModuleSettings(api, ID, { shopping_button_bg_color: '#2211aa' });
      await gotoShop(page);
      await openDrawer(page);
      expect(await computedStyle(page, `${SIDEBAR} .spsg-cart-widget-shooping-button`, 'background-color')).toBe(
        'rgb(34, 17, 170)',
      );
    });

    test('Product Card Background Color applies to the cart item row', async ({ page, api }) => {
      await addProductA(page);
      await saveModuleSettings(api, ID, { product_card_bg_color: '#334455' });
      await gotoShop(page);
      await openDrawer(page);
      expect(await computedStyle(page, ITEM_ROW, 'background-color')).toBe('rgb(51, 68, 85)');
    });

    for (const position of ['bottom-right', 'top-right', 'top-left', 'bottom-left']) {
      test(`Cart Icon Position "${position}" applies its class to the icon`, async ({ page, api }) => {
        await saveModuleSettings(api, ID, { icon_position: position });
        await gotoShop(page);
        await expect(page.locator(ICON).first()).toHaveClass(new RegExp(`\\b${position}\\b`));
      });
    }

    for (const n of [1, 2, 3, 4, 5]) {
      test(`Cart Icon "shopping-cart-icon-${n}" applies its glyph class to the open button`, async ({ page, api }) => {
        await saveModuleSettings(api, ID, { icon_name: `shopping-cart-icon-${n}` });
        await gotoShop(page);
        await expect(page.locator(OPEN_BTN).first()).toHaveClass(new RegExp(`\\bshopping-cart-icon-${n}\\b`));
        await expect(page.locator(`${OPEN_BTN} svg.spsg-cart-icon`).first()).toBeVisible();
      });
    }
  });

  test.describe('General · Cart Contents', () => {
    const toggles = [
      { key: 'show_product_image', label: 'Show Product Image', marker: IMG },
      { key: 'show_remove_icon', label: 'Show Remove Icon', marker: REMOVE },
      { key: 'show_quantity_picker', label: 'Show Quantity Picker', marker: QTY },
      // The price prints inside the quantity block (spec §9), which stays on.
      { key: 'show_product_price', label: 'Show product price', marker: SUBTOTAL },
    ];

    for (const t of toggles) {
      test(`${t.label} off removes it from the drawer`, async ({ page, api }) => {
        await addProductA(page);
        await gotoShop(page);
        await openDrawer(page);
        await expect(page.locator(t.marker)).toHaveCount(1);

        await saveModuleSettings(api, ID, { [t.key]: false });
        await gotoShop(page);
        await openDrawer(page);
        await expect(page.locator(t.marker)).toHaveCount(0);
      });
    }
  });

  test.describe('General · Pro', { tag: '@pro' }, () => {
    test('lite ignores the pro layout and centre positions', async ({ page, api }) => {
      test.skip(await isPro(api), 'lite-only behaviour');
      const saved = await saveModuleSettings(api, ID, { layout: 'center', icon_position: 'center-left' });
      expect(saved.values.layout).toBe('side');
      expect(saved.values.icon_position).toBe('bottom-right');
      await gotoShop(page);
      await expect(page.locator(SIDEBAR)).not.toHaveClass(/spsg-quick-cart-center-layout/);
    });

    test('Layout "Centered Popup" switches the drawer to the centered layout', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, ID, { layout: 'center' });
      await gotoShop(page);
      await expect(page.locator(SIDEBAR)).toHaveClass(/spsg-quick-cart-center-layout/);
    });

    for (const position of ['center-right', 'center-left']) {
      test(`Cart Icon Position "${position}" applies its class to the icon`, async ({ page, api }) => {
        test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
        await saveModuleSettings(api, ID, { icon_position: position });
        await gotoShop(page);
        await expect(page.locator(ICON).first()).toHaveClass(new RegExp(`\\b${position}\\b`));
      });
    }

    test('Show Stock Status renders the stock line in the drawer', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, ID, { show_stock_status: true });
      await addProductA(page); // stock-managed, qty 25
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(STOCK)).toContainText(`Available: ${PRODUCTS.a.stock}`);
    });

    test('Show coupon toggles the coupon form in the drawer', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(COUPON)).toHaveCount(1);

      await saveModuleSettings(api, ID, { show_coupon: false });
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(COUPON)).toHaveCount(0);
    });

    test('applying a coupon discounts the cart', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);

      await page.locator(COUPON_INPUT).fill(SEED_COUPON);
      await page.locator(COUPON_APPLY).click();
      await expect(page.locator(COUPON_RESPONSE)).toContainText('applied successfully');
      await expect(page.locator(`${CONTENT} .cart-discount.coupon-${SEED_COUPON}`)).toBeVisible();

      await page.locator(`${CONTENT} .woocommerce-remove-coupon`).first().click();
      await expect(page.locator(`${CONTENT} .cart-discount.coupon-${SEED_COUPON}`)).toHaveCount(0);
    });

    test('"Cart panel auto-opens" off keeps the drawer shut on an ajax add', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, ID, { enable_add_to_cart_redirect: false });
      await gotoShop(page);
      const drawer = page.locator(SIDEBAR);
      await expect(drawer).toHaveClass(/wfc-slide/);
      await page.locator(`a.ajax_add_to_cart[data-product_id="${PRODUCTS.a.id}"]`).first().click();
      await expect(page.locator(COUNT).first()).toHaveText('1');
      await expect(drawer).toHaveClass(/wfc-slide/);
    });

    test('Show Free Shipping Message renders the free-shipping notice', async ({ api, guestPage }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      const banner = MODULES.freeShipping.id;
      try {
        await resetModuleSettings(api, banner, {
          discount_type: 'free-shipping',
          cart_minimum_amount: 100000,
          progressive_banner_text: 'Add [amount] more to get FREE SHIPPING.',
        });
        await saveModuleSettings(api, ID, { show_free_shipping_message: true });

        // A guest/customer-only promotion: assert on guestPage.
        await addToCart(guestPage, PRODUCTS.a.id);
        await gotoShop(guestPage);
        await openDrawer(guestPage);
        await expect(guestPage.locator(FREE_SHIP_NOTICE)).toContainText('FREE SHIPPING');
      } finally {
        await resetModuleSettings(api, banner);
      }
    });
  });

  test.describe('BOGO badge', () => {
    let offerId: number | undefined;

    test.beforeEach(async ({ api }) => {
      await setModuleStatus(api, MODULES.bogo.id, true);
      const offer = await createBogoOffer(api, {
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
      });
      offerId = offer.id;
    });

    test.afterEach(async ({ api }) => {
      if (offerId) await deleteBogoOffer(api, offerId);
      offerId = undefined;
    });

    test('the BOGO gift line shows in the drawer; its badge only with pro', async ({ page, api }) => {
      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(ITEM_ROW)).toHaveCount(2);
      await expect(page.locator(ITEM_ROW).filter({ hasText: PRODUCTS.b.name })).toHaveCount(1);

      if (await isPro(api)) {
        await expect(page.locator(BOGO_BADGE).first()).toBeVisible();
        await saveModuleSettings(api, ID, { fly_cart_badge_icon: false });
        await gotoShop(page);
        await openDrawer(page);
      }
      // Lite: "Show BOGO Badge" is a pro control, the badge stays hidden.
      await expect(page.locator(BOGO_BADGE)).toHaveCount(0);
    });
  });

  test.describe('Admin form', { tag: '@admin' }, () => {
    test('editing Widget Background Color on the settings page updates the drawer', async ({ page, api }) => {
      const { schema, page: settingsPage } = await getModuleSettings(api, ID);
      const field = schema.widget_bg_color;
      await gotoSettings(page, ID);
      await setField(page, field, '#112233', settingsPage.tabs?.[String(field.tab)]?.label);
      await saveSettings(page, ID);

      await gotoShop(page);
      expect(await computedStyle(page, SIDEBAR, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('unchecking Show Product Image on the settings page hides the thumbnail', async ({ page, api }) => {
      const { schema, page: settingsPage } = await getModuleSettings(api, ID);
      const field = schema.show_product_image;
      await gotoSettings(page, ID);
      await setField(page, field, false, settingsPage.tabs?.[String(field.tab)]?.label);
      await saveSettings(page, ID);

      await addProductA(page);
      await gotoShop(page);
      await openDrawer(page);
      await expect(page.locator(IMG)).toHaveCount(0);
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
