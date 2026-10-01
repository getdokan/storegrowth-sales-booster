import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings, saveSettings, setColor, setField, setText } from '../../helpers/settings-ui';
import { computedStyle } from '../../helpers/storefront';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { STORE_PAGES } from '../../data/products';

// Floating Bar (`floating-notification-bar`). A guest/customer-only promotion,
// so storefront checks use the logged-out `guestPage`. The schema is gated
// (first save turns the bar on, floating-notification-bar.md §5); the
// beforeEach reset is that save. Styles are still printed as inline CSS
// (ADR-005 deferred for the bars), so read computed styles.
const id = MODULES.floatingBar.id;
const WRAP = '.spsg-floating-notification-bar-wrapper';
const TEXT = '.spsg-floating-notification-bar-text';
// Scoped to the wrapper: the Free Shipping banner reuses `.fn-bar-action-button`.
const BTN = `${WRAP} .fn-bar-action-button`;
const ICON = `${WRAP} .spsg-floating-notification-bar-icon svg`;
const CLOSE_ICON = `${WRAP} .spsg-floating-notification-bar > .spsg-floating-notification-bar-remove svg`;

async function gotoShopAsGuest(guestPage: Page): Promise<void> {
  await guestPage.goto(STORE_PAGES.shop);
  await expect(guestPage.locator(WRAP)).toHaveCount(1);
}

test.describe('Storefront · Floating Bar', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id, { default_banner_text: 'Default Bar Text' });
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.describe('Content and button (admin UI → storefront)', () => {
    test('editing Default Banner Text updates the bar text', async ({ page, guestPage }) => {
      await gotoSettings(page, id, 'content');
      await setText(page, 'Default Banner Text', 'Mega Flash Sale 50% Off');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(TEXT)).toContainText('Mega Flash Sale 50% Off');
    });

    test('editing Button Text updates the action button label', async ({ page, guestPage }) => {
      await gotoSettings(page, id, 'configure');
      await setText(page, 'Button Text', 'Grab It Now');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toContainText('Grab It Now');
    });

    test('Button Action "Open Link" + Button Link make the button a link', async ({ page, api, guestPage }) => {
      const { schema } = await getModuleSettings(api, id);
      const url = 'https://example.com/flash-sale';
      await gotoSettings(page, id, 'configure');
      await setField(page, schema.button_action, 'ba-url-redirect');
      await setText(page, String(schema.redirect_url.label), url); // drawn only for Open Link
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toHaveAttribute('href', url);
    });

    test('Bar Type "Sticky" makes the bar position fixed', async ({ page, api, guestPage }) => {
      const { schema } = await getModuleSettings(api, id);
      await gotoSettings(page, id, 'configure');
      await setField(page, schema.bar_type, 'sticky');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'position')).toBe('fixed');
    });

    test('Background Color applies to the bar', async ({ page, guestPage }) => {
      await gotoSettings(page, id, 'design');
      await setColor(page, 'Background Color', '#112233');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'background-color')).toBe('rgb(17, 34, 51)');
    });
  });

  test.describe('Configure', () => {
    test('Bar Type "Normal" leaves the bar absolutely positioned', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { bar_type: 'normal' });
      await gotoShopAsGuest(guestPage);
      // bar_type=normal + bar_position=top (default) → position: absolute.
      expect(await computedStyle(guestPage, WRAP, 'position')).toBe('absolute');
    });

    test('Button Action "Close" turns the action button into a dismiss control', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { button_action: 'ba-close' });
      await gotoShopAsGuest(guestPage);
      const btn = guestPage.locator(BTN);
      await expect(btn).toHaveClass(/spsg-floating-notification-bar-remove/);
      await expect(btn).not.toHaveAttribute('href', /.*/);
    });

    test('the button "Show" switch off removes the action button', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { button_enable: false });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toHaveCount(0);
    });

    test('Show Button without Desktop removes the action button on desktop', async ({ api, guestPage }) => {
      // The storefront JS strips the button for an unselected device; the bar stays.
      await saveModuleSettings(api, id, { button_view: ['button-mobile-enable'] });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toHaveCount(0);
    });

    test('the bar is revealed after the trigger delay', async ({ guestPage }) => {
      // The bar ships hidden and fades in after banner_delay (default 1s).
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(WRAP)).toBeVisible({ timeout: 8000 });
    });
  });

  test.describe('Design', () => {
    const cases: [string, Record<string, unknown>, string, string, string][] = [
      ['Text Color applies to the bar', { text_color: '#445566' }, WRAP, 'color', 'rgb(68, 85, 102)'],
      ['Button Color applies to the action button', { button_color: '#aa0000' }, BTN, 'background-color', 'rgb(170, 0, 0)'],
      ['Button Text Color applies to the action button text', { button_text_color: '#00bb00' }, BTN, 'color', 'rgb(0, 187, 0)'],
      ['Icon Color applies to the bar icon', { icon_color: '#123456' }, ICON, 'color', 'rgb(18, 52, 86)'],
      ['Close Icon Color applies to the dismiss (X) icon', { close_icon_color: '#654321' }, CLOSE_ICON, 'color', 'rgb(101, 67, 33)'],
    ];
    for (const [title, values, selector, prop, expected] of cases) {
      test(title, async ({ api, guestPage }) => {
        await saveModuleSettings(api, id, values);
        await gotoShopAsGuest(guestPage);
        expect(await computedStyle(guestPage, selector, prop)).toBe(expected);
      });
    }

    test('Font Family applies to the bar text', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { font_family: 'roboto' });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, TEXT, 'font-family')).toContain('Roboto');
    });
  });

  // Pro fields, saved through REST (the engine ignores them without pro).
  test.describe('Pro', { tag: '@pro' }, () => {
    test.beforeEach(async ({ api }) => {
      test.skip(!(await hasPro(api)), 'StoreGrowth Pro required');
    });

    test('Bar Position "Bottom" pins the bar to the bottom of the viewport', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { bar_position: 'bottom' });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'bottom')).toBe('0px');
    });

    test('Banner Height applies to the bar wrapper', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { banner_height: 70 });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'height')).toBe('70px');
    });

    test('Font Size applies to the bar text', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { font_size: 24 });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, TEXT, 'font-size')).toBe('24px');
    });

    test('Show Bar without Desktop removes the whole bar on desktop', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { banner_device_view: [] });
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });

    test('Coupon Code renders the coupon inside the bar', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { show_cupon: true, cupon_code: 'E2E10' });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(`${WRAP} .spsg-coupon-code`)).toContainText('E2E10');
    });

    test('Countdown renders a four-part live timer in the bar', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        countdown_show_enable: true,
        countdown_start_date: '2020-01-01',
        countdown_end_date: '2099-12-31',
      });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(`${WRAP} .spsg-fn-bar-countdown`)).toHaveCount(1);
      await expect(guestPage.locator(`${WRAP} .spsg-countdown-value`)).toHaveCount(4);
    });

    test('Page Targeting "Show on Selected" hides the bar on non-targeted pages', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { banner_show_option: 'banner-show-selected', slected_page_option: ['is_front_page'] });
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });
  });

  test.describe('Visibility', () => {
    test('bar content is not shown to a logged-in admin (promotions are guest-only)', async ({ page }) => {
      await page.goto(STORE_PAGES.shop);
      await expect(page.locator(TEXT)).toHaveCount(0);
      await expect(page.locator(BTN)).toHaveCount(0);
    });

    test('no bar when the module is inactive', async ({ api, guestPage }) => {
      await setModuleStatus(api, id, false);
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });
  });

  // Last: the UI toggle churns shared state.
  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.floatingBar.name, false);
      await setModuleState(page, MODULES.floatingBar.name, true);
      await expect(moduleToggle(page, MODULES.floatingBar.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
