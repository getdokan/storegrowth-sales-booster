<?php
/**
 * Settings page contract.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Interfaces;

defined( 'ABSPATH' ) || exit;

/**
 * A settings schema that defines its admin page: title, tabs and the
 * sections (accordions) its fields go in. The admin app builds the page from
 * it, with no page code in the module: `#/settings?module=<id>&tab=<tab>`.
 *
 * Every page comes to the app in one request, `GET sales-booster/v1/admin/settings`
 * (`{ <id>: { page, schema, values, published } }`); each saves through
 * `POST sales-booster/v1/settings/<id>`.
 *
 * The page draws a tab's fields in field order (module fields, then the ones
 * extensions add) and groups a section's fields in its accordion. Fields
 * carry the presentation keys extension fields already have (`tab`, `label`,
 * `help`, `labels`, `variant`, `suffix`, …, see `SettingsSchema`) plus:
 *
 *     'section'     => 'bar',   // section id of the field's tab (optional)
 *     'pro_ui'      => true,    // control locked without pro, value still saved
 *                               // (e.g. written by a template preset in lite)
 *     'show_when'   => [ 'button_action' => 'ba-url-redirect' ],
 *                               // shown while every key has that value (or one
 *                               // of a list: [ 'product_source' => [ '0', '2' ] ])
 *     'hidden'      => true,    // saved with its tab, never drawn (written by a
 *                               // preset or another key's control)
 *     'width'       => 'half',  // consecutive half fields share a row
 *     'pro_options' => [ 'center' ], // options offered only with pro (or stored)
 *     'rows'        => 4,       // textarea lines
 *     'max_length'  => 15,      // text input limit (counter)
 *     'name'        => __( 'Counter margin', '…' ), // accessible name when
 *                               // the label repeats (box, alignment)
 *
 * `variant` picks the control; without one the type decides (text, url,
 * date, textarea, number, toggle → switch, color → color_picker, select,
 * list → multicheck, box). Built in: `checkbox` (grouped in one column when
 * consecutive), `switch_card`, `alignment`, `radio`, `device` (Desktop /
 * Mobile checkboxes of a list; options are [ desktop, mobile ]). Anything
 * else is drawn by the module (`controls` in `storegrowth.settings.page`) or
 * an extension (`storegrowth_settings_{variant}_field`).
 *
 * Section keys: `title`, `help`, `collapsed` (starts closed), `show_when`,
 * `toggle` (a toggle field drawn as the header switch; the body shows while
 * it's on), `toggle_label`, `card` (with `toggle`: a switch card instead of an
 * accordion).
 *
 * Page:
 *
 *     [
 *         'title' => __( 'Stock Bar', '…' ),
 *         'tabs'  => [                               // id → tab, in order
 *             'design' => [
 *                 'label'    => __( 'Design', '…' ),
 *                 'sections' => [                    // id → section, in order
 *                     'bar' => [
 *                         'title' => __( 'Stock Bar', '…' ),
 *                         'help'  => __( 'The progress bar itself', '…' ),
 *                     ],
 *                 ],
 *             ],
 *         ],
 *     ]
 *
 * A page without `tabs` (e.g. the global settings: `[ 'title' => … ]`) draws
 * its fields that have no `tab` in one card under the title, with one Save
 * bar; it may have `sections` of its own.
 *
 * Also `links` (buttons beside the title to another page of the app:
 * `[ [ 'label' => …, 'route' => '/settings?module=…' ] ]`, e.g. an extension's
 * page added through `spsg_settings_page`) and `module` (a page that isn't a
 * module's sits in that module's frame, its feature rail).
 *
 * Extending (pro, other plugins), all PHP:
 * - `spsg_settings_schema` ( $fields, $id ): add fields to a page (with `tab`
 *   / `section`); a module's own fields can't be redefined. Per module:
 *   `spsg_{module}_settings_schema` ( $fields ), module id in snake case
 *   (`spsg_stock_bar_settings_schema`, `spsg_general_settings_schema`).
 * - `spsg_settings_page` ( $page, $id ): add or change tabs and sections.
 * - `spsg_settings_schemas` ( $schemas ): register a schema (and page) of
 *   your own; StoreGrowth's schemas can't be replaced.
 *
 * A module adds what only JS can draw (its live preview, a control that sets
 * several keys) through the JS filter `storegrowth.settings.page`.
 *
 * @since SPSG_VERSION
 */
interface SettingsPage {

	/**
	 * The page: title, and tabs (with their sections) or, without tabs, its
	 * own sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array{title: string, tabs?: array<string, array{label: string, sections?: array<string, array<string, mixed>>}>, sections?: array<string, array<string, mixed>>}
	 */
	public function get_page(): array;
}
