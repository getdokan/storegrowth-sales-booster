import { test, expect } from '../../fixtures/test';
import { gotoModules, setModuleState } from '../../helpers/modules';
import { MODULES } from '../../data/modules';

test.describe('Admin · Modules catalog', () => {
  test('renders the module catalog', async ({ page }) => {
    await gotoModules(page);

    // A couple of always-present free modules should be listed.
    await expect(page.getByText(MODULES.bogo.name, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(MODULES.quickView.name, { exact: false }).first()).toBeVisible();
  });

  test('a module can be activated and deactivated', async ({ page }) => {
    // Leave the environment as we found it: enable, assert, then disable again.
    await setModuleState(page, MODULES.quickView.name, true);
    await setModuleState(page, MODULES.quickView.name, false);
  });
});
