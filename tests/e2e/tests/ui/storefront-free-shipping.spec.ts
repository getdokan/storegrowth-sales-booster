import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax, getIsPro } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import {
  gotoModuleSettings,
  openTab,
  saveForm,
  setTextField,
  setNumber,
  setColor,
  setSelect,
  setSwitch,
  setGroupCheckbox,
  setBannerIcon,
  resetForm,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';

// Promotion-gated bar: guests only (use `guestPage`); JS removes the wrapper when
// banner_device_view is empty/mismatched, so every test first saves the FULL form
// (resetBar) to keep the wrapper in the DOM. Colors checked via COMPUTED styles
// since the bar starts display:none.
const ROUTE = 'progressive-discount-banner';
const WRAP = '.spsg-pd-banner-bar-wrapper';
const TEXT = `${WRAP} .spsg-pd-banner-text`;
const BTN = `${WRAP} a.fn-bar-action-button`;
const ICON = `${WRAP} .spsg-pd-banner-bar-icon svg`;
const REMOVE = `${WRAP} .spsg-pd-banner-bar-remove svg path`;
const GET = 'spsg_pd_banner_get_settings';

// Save REPLACES the whole option, so this base must be complete: device view set
// (wrapper survives JS) and a high minimum (empty cart < minimum → progressive text).
const DEFAULTS = {
  bar_type: 'normal',
  bar_position: 'top',
  discount_type: 'free-shipping',
  cart_minimum_amount: 100000,
  progressive_banner_icon_name: 'shipping-bar-icon-1',
  progressive_banner_text: 'Add [amount] more to get FREE SHIPPING.',
  goal_completion_text: 'You unlocked free shipping!',
  btn_style: true,
  btn_text: 'Cart',
  btn_target: '#',
  banner_device_view: ['banner-show-desktop'],
  banner_trigger: 'after-few-seconds',
  banner_delay: 1,
  banner_height: 60,
  font_size: 20,
  font_family: 'poppins',
  background_color: '#008DFF',
  text_color: '#ffffff',
  icon_color: '#ffffff',
  close_icon_color: '#ffffff',
  btn_color: '#ffffff',
  btn_text_color: '#073b4c',
};

async function resetBar(page: any) {
  await moduleAjax(page, 'spsg_pd_banner_save_settings', {
    form_data: JSON.stringify({ shipping_bar_data: DEFAULTS }),
  });
}

async function getSettings(page: any) {
  return (await moduleAjax(page, GET)).body?.data ?? {};
}

async function computedOn(p: any, selector: string, prop: string): Promise<string> {
  return p
    .locator(selector)
    .first()
    .evaluate((el: Element, pr: string) => getComputedStyle(el).getPropertyValue(pr).trim(), prop);
}

test.describe('Storefront · Free Shipping Rules', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.freeShipping.id, true);
    await resetBar(page);
  });

  test.afterEach(async ({ page }) => {
    await resetBar(page);
    await setModuleActive(page, MODULES.freeShipping.id, true);
  });

  test.describe('Banner Setting', { tag: '@admin' }, () => {
    test('Banner Text updates the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Banner Text', 'Spend more, ship free today!');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(TEXT)).toContainText('Spend more, ship free today!');
    });

    test('Cart Minimum Amount feeds the [amount] placeholder', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setNumber(page, 'Cart Minimum Amount', 250);
      await saveForm(page);

      // Empty guest cart → [amount] = 250 − 0 = $250.00.
      await guestPage.goto('/shop/');
      await expect(guestPage.locator(TEXT)).toContainText('$250.00');
    });

    test('Goal Completion Text shows once the cart clears the minimum', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Goal Completion Text', 'Goal reached — free shipping!');
      await setNumber(page, 'Cart Minimum Amount', 0); // empty cart (0) ≥ 0 → goal text shows
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(TEXT)).toContainText('Goal reached — free shipping!');
    });

    test('Bar Type "Sticky" makes the bar position fixed', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Type', 'Sticky');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'position')).toBe('fixed');
    });

    test('Bar Type "Normal" leaves the bar absolutely positioned', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Type', 'Normal');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'position')).toBe('absolute');
    });

    test('Bar Position "Bottom" pins the bar to the bottom', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Position', 'Bottom');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'bottom')).toBe('0px');
    });

    test('Banner Icon renders an icon in the bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setBannerIcon(page, 1);
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(ICON)).toHaveCount(1);
    });

    test('Display CTA Button toggles the action button', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSwitch(page, 'Display CTA Button', false);
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(BTN)).toHaveCount(0);
    });

    test('CTA Name updates the button label', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'CTA Name', 'Grab Free Shipping');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(BTN)).toContainText('Grab Free Shipping');
    });

    test('CTA Target URI updates the button link', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      // CTA Target URI is a type="url" input → target by placeholder.
      await page
        .locator('#sbooster-settings-page')
        .getByPlaceholder('Write CTA button target url')
        .fill('https://example.com/free-shipping');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(BTN)).toHaveAttribute('href', 'https://example.com/free-shipping');
    });

    test('Show Banner: unchecking Desktop removes the bar on desktop', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      // Clearing Desktop empties banner_device_view → wp_footer renders nothing.
      await setGroupCheckbox(page, 'Show Banner', 'Desktop', false);
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });

    test('Trigger "After a few Seconds" reveals the hidden bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await page
        .locator('#sbooster-settings-page')
        .getByText('After a few Seconds', { exact: true })
        .click();
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toBeVisible({ timeout: 8000 });
    });

    // Discount Type/Mode/Amount drive cart-total discount logic, not banner markup,
    // so they are validated by round-tripping through the admin GET.
    test('Discount Type "Discount Amount" persists with its mode and value', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Discount Type', 'Discount Amount');
      await setSelect(page, 'Discount Mode', 'Fixed Amount');
      await setNumber(page, 'Discount Amount', 15);
      await saveForm(page);

      const s = await getSettings(page);
      expect(s.discount_type).toBe('discount-amount');
      expect(String(s.discount_amount_value)).toBe('15');
    });
  });

  test.describe('Banner Setting · Pro', { tag: ['@pro', '@admin'] }, () => {
    test('Page Targeting "Show on Selected" hides the bar on non-targeted pages', async ({
      page,
      guestPage,
    }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Page Targeting', 'Show on Selected');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });
  });

  test.describe('Design', { tag: '@admin' }, () => {
    test('Background Color applies to the bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Background Color', '#112233');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('Text Color applies to the bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Text Color', '#445566');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'color')).toBe('rgb(68, 85, 102)');
    });

    test('Icon Color applies to the bar icon (svg fill)', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Icon Color', '#123456');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, ICON, 'fill')).toBe('rgb(18, 52, 86)');
    });

    test('Close Button Color applies to the dismiss (X) icon', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Close Button Color', '#654321');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, REMOVE, 'fill')).toBe('rgb(101, 67, 33)');
    });

    test('CTA Background applies to the action button', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'CTA Background', '#aa0000');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, BTN, 'background-color')).toBe('rgb(170, 0, 0)');
    });

    test('CTA Text Color applies to the action button text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'CTA Text Color', '#00bb00');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, BTN, 'color')).toBe('rgb(0, 187, 0)');
    });

    const FONT_FAMILIES = ['Poppins', 'Roboto', 'Lato', 'Montserrat', 'IBM Plex Sans'];
    for (const font of FONT_FAMILIES) {
      test(`Font Family "${font}" applies to the bar text`, async ({ page, guestPage }) => {
        await gotoModuleSettings(page, ROUTE);
        await openTab(page, 'Design');
        await setSelect(page, 'Font Family', font);
        await saveForm(page);

        await guestPage.goto('/shop/');
        expect(await computedOn(guestPage, TEXT, 'font-family')).toContain(font);
      });
    }

    test('Font Size applies to the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Font Size', 24);
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, TEXT, 'font-size')).toBe('24px');
    });

    test('Banner Height applies to the bar wrapper', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Banner Height', 80);
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'height')).toBe('80px');
    });
  });

  test.describe('Storefront', () => {
    test('marks the storefront as showing the discount banner for a guest', async ({ guestPage }) => {
      await guestPage.goto('/shop/');
      await expect(guestPage.locator('body')).toHaveClass(/show_discount_banner/);
    });

    test('bar is not shown to a logged-in admin (promotions are guest-only)', async ({ page }) => {
      await page.goto('/shop/');
      await expect(page.locator(WRAP)).toHaveCount(0);
    });

    test('no discount-banner flag when the module is inactive', async ({ page, guestPage }) => {
      await setModuleActive(page, MODULES.freeShipping.id, false);
      await guestPage.goto('/shop/');
      await expect(guestPage.locator('body')).not.toHaveClass(/show_discount_banner/);
    });
  });

  test.describe('Reset', { tag: '@admin' }, () => {
    test('the Reset button reverts a changed banner text', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Banner Text', 'Temporary text 999');
      await saveForm(page);
      expect((await getSettings(page)).progressive_banner_text).toBe('Temporary text 999');

      await gotoModuleSettings(page, ROUTE);
      await resetForm(page);
      await saveForm(page);
      expect((await getSettings(page)).progressive_banner_text).not.toBe('Temporary text 999');
    });
  });

  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.freeShipping.name, false);
      await setModuleState(page, MODULES.freeShipping.name, true);
      await expect(moduleToggle(page, MODULES.freeShipping.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
