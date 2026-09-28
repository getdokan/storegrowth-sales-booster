# Settings pages

How a module gets a settings page, and how pro or another plugin extends one. The decisions behind it: [ADR-007](adr/ADR-007-settings-engine-and-extension-fields.md) (settings engine), [ADR-009](adr/ADR-009-backend-defined-settings-pages.md) (pages defined in the backend), [ADR-004](adr/ADR-004-backward-compatibility.md) (stored settings are never lost).

## How it works

- A module describes its settings in PHP: a **schema** (option, fields, types, defaults) that also defines its **page** (title, tabs, sections, labels).
- The admin fetches every page in one request, `GET sales-booster/v1/admin/settings`, and draws it at `admin.php?page=storegrowth#/settings?module=<id>&tab=<tab>`.
- Each tab saves its own fields through `POST sales-booster/v1/settings/<id>`. `SettingsService` validates, merges into the stored option and writes only changed keys.
- A module writes JS only for what PHP can't describe: a live preview, or a control that writes several keys.

Reference: `modules/stock-bar/` (schema in `includes/Settings/StockBarSettings.php`, about 90 lines of JS in `src/admin/index.tsx`).

## Add a settings page to a module

### 1. Schema and page (PHP)

`modules/<id>/includes/Settings/<Name>Settings.php`:

```php
<?php
/**
 * My Module settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\MyModule
 */

namespace StorePulse\StoreGrowth\Modules\MyModule\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\MyModule\MyModuleModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields and page of `spsg_my_module_settings`.
 *
 * @since SPSG_VERSION
 */
class MyModuleSettings implements SettingsSchema, SettingsPage {

	/**
	 * Module id: the `module` in `#/settings?module=…` and the REST route.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return MyModuleModule::get_id();
	}

	/**
	 * Option holding the settings. An existing option keeps its name.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_my_module_settings';
	}

	/**
	 * Fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		return [
			'enable_badge' => [
				'type'    => 'toggle',
				'default' => true,
				'tab'     => 'general',
				'label'   => __( 'Show Badge', 'storegrowth-sales-booster' ),
			],
			'badge_text'   => [
				'type'      => 'text',
				'default'   => __( 'Sale', 'storegrowth-sales-booster' ),
				'tab'       => 'general',
				'label'     => __( 'Badge Text', 'storegrowth-sales-booster' ),
				'show_when' => [ 'enable_badge' => true ],
			],
			'badge_color'  => [
				'type'    => 'color',
				'default' => '#0875ff',
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'look',
				'label'   => __( 'Badge Color', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * The settings page: title, tabs and sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title' => __( 'My Module', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'general' => [
					'label' => __( 'General', 'storegrowth-sales-booster' ),
				],
				'design'  => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'look' => [
							'title' => __( 'Look', 'storegrowth-sales-booster' ),
							'help'  => __( 'Colours of the badge', 'storegrowth-sales-booster' ),
						],
					],
				],
			],
		];
	}
}
```

A page without tabs (like the global settings): leave out `tabs` in `get_page()` and `tab` on the fields. Its fields sit in one card under the title with one Save bar; the page may have `sections` of its own.

### 2. Register it (PHP)

In the module's always-loaded `modules/<id>/includes/Providers/ServiceProvider.php`, so the page works whether or not the module is active:

```php
$this->add_with_implements_tags( MyModuleSettings::class, MyModuleSettings::class, true );
```

That's all for a plain settings page: it shows up at `#/settings?module=<id>`, the module menu, dashboard and modules list link to it, and it saves through the settings engine.

### 3. Preview and custom controls (JS, optional)

Only when the page needs something the schema can't describe.

`modules/<id>/src/admin/index.tsx`:

```tsx
/**
 * My Module admin bundle: the live preview and the icon picker of the
 * settings page the app draws from the schema.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
    IconPicker,
    LivePreview,
    type SettingsPageParts,
} from '@storegrowth/components';

import { BADGE_ICONS, MyWidget } from './preview/my-widget';
import type { MyModuleValues } from './types';

const myModulePage: SettingsPageParts< MyModuleValues > = {
    // Render functions of the page's settings: they see unsaved values.
    preview: ( { values } ) => {
        return <LivePreview widget={ <MyWidget values={ values } /> } />;
    },

    // A control drawn instead of a field's, by key.
    controls: ( { values, setValue, isLocked } ) => {
        return {
            badge_icon: (
                <IconPicker
                    label={ __( 'Badge Icon', 'storegrowth-sales-booster' ) }
                    icons={ BADGE_ICONS }
                    value={ values.badge_icon }
                    onChange={ ( icon ) => {
                        setValue( 'badge_icon', icon );
                    } }
                    locked={ isLocked( 'badge_icon' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/my-module',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'my-module' !== moduleId ) {
            return parts;
        }

        return myModulePage as SettingsPageParts;
    }
);
```

Then:

- `webpack-entries.js`: `moduleEntry( 'my-module', 'admin', './modules/my-module/src/admin/index.tsx' )`, and restart `npm run start`.
- `modules/<id>/includes/AdminPage.php`: extend `Admin\ModuleAdminPage` (`module_id()`; `stylesheets()` for the storefront CSS the preview uses; `data()` for JS data; `uses_media()` for the media library). Register it in the same `ServiceProvider`.

A hook can't run inside `preview` / `controls` directly: put it in a small component they render.

### 4. Storefront

Nothing changes: read the option with `get_option()`, or `SettingsService::with_defaults()` to fill keys never saved.

### 5. Before committing

- `wp eval-file tests/compat/settings-roundtrip.php`: saving never loses or alters stored data (runs every schema).
- `npm run type-check`, `npm run lint:js`, `vendor/bin/phpcs`.
- New PHP hooks in `tests/compat/php-hooks-baseline.txt`, `npm run check:hooks`.
- `@since SPSG_VERSION` on new symbols.

## Reference

### Field keys

| Key | Meaning |
|---|---|
| `type` | `text`, `textarea`, `number`, `toggle`, `color`, `select`, `box`, `list`, `url`, `date` |
| `default` | In API shape (int, bool, string, array) |
| `pro` | Saved only with pro; locked without |
| `min`, `max`, `step` | Number and box bounds |
| `options` | Allowed values of `select` / `list` |
| `item`, `separator`, `max_items`, `lite_max_items` | `list` details |
| `allow_empty` | `number`: `''` means "not set" |
| `html` | `text` / `textarea`: keep `wp_kses_post` markup |
| `tab` | Tab it's drawn on (and saved with) |
| `section` | Section (accordion) of that tab |
| `label`, `help`, `placeholder`, `prefix`, `suffix` | Presentation |
| `labels` | Option value → label |
| `variant` | Control to use (below) |
| `show_when` | Shown while every key has that value, or one of a list: `[ 'mode' => [ 'a', 'b' ] ]` |
| `hidden` | Saved with its tab, never drawn (written by a preset or another key's control) |
| `width` | `half`: consecutive half fields share a row |
| `pro_options` | Options offered only with pro (or while stored) |
| `pro_ui` | Control locked without pro, value still saved (e.g. set by a lite preset) |
| `rows`, `max_length` | Textarea lines, text input limit |
| `name` | Accessible name when the label repeats (`box`, `alignment`) |
| `priority` | Order among extension fields (lower first) |

Keys, their spellings and value shapes are the ones already stored: never rename them (ADR-004).

### Controls (`variant`)

Without a `variant` the type decides: text, url, date → text input; textarea; number; toggle → switch; color → colour picker; select; list → multi-select; box → margin/padding box.

Built in: `checkbox` (consecutive ones share a column), `switch_card`, `alignment`, `radio`, `device` (Desktop / Mobile checkboxes of a list; options are `[ desktop, mobile ]`).

Anything else: the module draws it (`controls`), or an extension handles its variant (below).

### Section keys

| Key | Meaning |
|---|---|
| `title`, `help` | Header |
| `collapsed` | Starts closed |
| `show_when` | Shown while the condition holds |
| `toggle` | A toggle field drawn as the header switch; the body shows while it's on |
| `toggle_label` | Text beside that switch (default "Show") |
| `card` | With `toggle`: a switch card instead of an accordion |

A section's fields are grouped in its accordion wherever the section first appears; fields without a section stay in field order.

### Shared fields

`Settings\DisplaySettings::bar_fields()` and `targeting_fields()` carry their labels and conditions. Place them on a tab and section with `DisplaySettings::place( $fields, $tab, $section )`, and override a label with `array_merge` where a page's copy differs.

## Extend a page (pro, other plugins)

All in PHP. A module's own fields and StoreGrowth's schemas can't be redefined.

**Add fields to a module**: generic, or per module (module id in snake case):

```php
add_filter( 'spsg_stock_bar_settings_schema', function ( $fields ) {
	$fields['pulse'] = [
		'type'    => 'toggle',
		'default' => false,
		'pro'     => true,
		'tab'     => 'design',
		'section' => 'bar',
		'label'   => __( 'Pulse Animation', 'my-plugin' ),
	];

	return $fields;
} );

// Same, for any module:
add_filter( 'spsg_settings_schema', function ( $fields, $module_id ) {
	return $fields;
}, 10, 2 );
```

The field is drawn in its section (or after the tab's fields), stored in the module's option and saved with its tab. Per-module filters: `spsg_stock_bar_settings_schema`, `spsg_countdown_timer_settings_schema`, `spsg_floating_notification_bar_settings_schema`, `spsg_progressive_discount_banner_settings_schema`, `spsg_fly_cart_settings_schema`, `spsg_quick_view_settings_schema`, `spsg_sales_pop_settings_schema`, `spsg_general_settings_schema`.

**Add a tab or section**:

```php
add_filter( 'spsg_settings_page', function ( $page, $module_id ) {
	if ( 'stock-bar' === $module_id ) {
		$page['tabs']['advanced'] = [ 'label' => __( 'Advanced', 'my-plugin' ) ];
	}

	return $page;
}, 10, 2 );
```

**Add a page of your own**: a class implementing `SettingsSchema` and `SettingsPage`, as above:

```php
add_filter( 'spsg_settings_schemas', function ( $schemas ) {
	$schemas[] = new My_Plugin_Settings();

	return $schemas;
} );
```

It's read, saved and drawn at `#/settings?module=<its id>` by the same engine.

**A custom control**: give the field a `variant` and draw it in JS:

```js
addFilter(
    'storegrowth_settings_my_picker_field',
    'my-plugin/my-picker',
    ( defaultField, element ) => {
        return (
            <MyPicker
                element={ element }
                onChange={ defaultField.props.onChange } // ( key, value )
            />
        );
    }
);
```

**Change a module's preview or controls**: filter `storegrowth.settings.page` after the module (a later priority) and wrap its `preview` / `controls`. Some modules also fire a preview filter of their own (`storegrowth.preview.stock-bar`, `storegrowth.preview.countdown-timer`, `storegrowth.preview.fly-cart`, `storegrowth.preview.sales-pop`).

## REST

| Route | |
|---|---|
| `GET sales-booster/v1/admin/settings` | Every page: `{ <id>: { page, schema, values, published } }` |
| `GET sales-booster/v1/settings/<id>` | One: `{ page, schema, values, published }` |
| `POST sales-booster/v1/settings/<id>` | Save `{ values }`; 400 with `params` (field → message) when a value is invalid, nothing saved |
| `GET/POST sales-booster/v1/settings` | Old global settings route, kept (ADR-004) |

`published` is false while a gated module (`GatedSettingsSchema`) was never saved; its first save writes every key.
