# ADR-007: One client for admin-ajax calls from the admin app

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-002 (TypeScript rewrite, REST-first; `../redesign/adr/`), ADR-005 (ajax actions stay registered), `../redesign/rest-api.md`

## Context

The admin app talks to the server over REST (`sales-booster/v1`, `src/utilities/api.ts`). ADR-005 keeps every existing `wp_ajax_spsg_*` action registered, and some of them already do exactly what a screen needs, with no REST route. The rebuilt onboarding wizard is the first case: completion goes through the existing `spsg_inisetup_flag_update` action instead of a new route, to keep the API surface unchanged.

The old UI called admin-ajax in several different ways: a jQuery helper (`assets/src/ajax.js`), raw `fetch()` with hand-built `URLSearchParams`, and hard-coded `/wp-admin/admin-ajax.php` URLs. Each call site handled the nonce, boolean encoding and errors differently. WordPress also answers a failed nonce or capability check with a bare `-1` / `0`, which none of them turned into a readable error.

## Decision

### 1. REST first
New server features get a REST route. Call admin-ajax from the admin app only when an **existing** action already does the job and adding a route would only duplicate it.

### 2. Always use `ajax()` from `@storegrowth/utilities`

```ts
import { ajax } from '@storegrowth/utilities';

const data = await ajax< { message: string } >( 'spsg_inisetup_flag_update', {
    spsg_ini_completion: true,
} );
```

`src/utilities/ajax.ts`:
- Posts through `@wordpress/api-fetch` (`url` option) to `spsgAdmin.ajax_url`. Never use `window.fetch`, jQuery or a hard-coded URL.
- Adds `action` and `_ajax_nonce` (`spsgAdmin.nonce`, i.e. `spsg_ajax_nonce`) to every request.
- Sends `true` / `false` as `'1'` / `''`, which is how PHP reads them.
- Resolves with the reply's `data` (`wp_send_json_success()`).
- Rejects with an `Error`:
  - message = the reply's `data` when `wp_send_json_error()` sent a string (also on a 4xx);
  - a translated "request was refused" message when WordPress answered a bare `-1` / `0` (failed nonce or capability check).

So call sites use the same `try` / `catch` + `errorMessage()` + `toast.error()` pattern as REST calls.

### 3. Wrap each action in a named function
Put a typed wrapper next to the REST clients in `src/utilities/api.ts` (e.g. `completeOnboarding()`), so screens never spell an action name or its field names.

### 4. Server side
- The PHP handler must call `check_ajax_referer( 'spsg_ajax_nonce', '_ajax_nonce' )` **and** a capability check (`current_user_can( 'manage_options' )`). The nonce is shared across the admin, so it's not access control on its own.
- Reply with `wp_send_json_success()` / `wp_send_json_error( $message, $status )`. Error `data` should be a translatable string.
- The action name, fields and stored data follow ADR-005: never renamed or removed.

### Out of scope
Storefront ajax (`wp_ajax_nopriv_*`, nonces `spsg_frontend_ajax*`) stays as it is; see `../redesign/rest-api.md` §6 and ADR-006.

## Consequences

- One place handles the nonce, encoding and error shape. A future change (e.g. a new nonce) is a one-file edit.
- Admin screens handle ajax and REST errors the same way.
- Every ajax call in `src/` is a named wrapper in `api.ts`, easy to find and to move to REST later.
- Review checklist: no `fetch(`, `jQuery.ajax` / `$.post` or `admin-ajax.php` string in `src/`, `modules/*/src` or `integrations/src`; every new ajax use has a wrapper and a capability-checked handler.
