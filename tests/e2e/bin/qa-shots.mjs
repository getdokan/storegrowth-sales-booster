#!/usr/bin/env node
/**
 * QA screenshots for review before/after comparisons.
 *
 *     node tests/e2e/bin/qa-shots.mjs --label step-5 --phase before \
 *         'fs-content|/wp-admin/admin.php?page=spsg-settings#/progressive-discount-banner' \
 *         'fs-configure|/wp-admin/admin.php?page=spsg-settings#/progressive-discount-banner|click:Configure' \
 *         'shop|/shop/|guest'
 *
 * Run from the plugin folder (WP-CLI must work there). Each shot is
 * `name|path|actions`, actions separated by `;`:
 *   guest        load without the admin login (storefront as a shopper)
 *   click:Text   click the tab or button named Text, else the first
 *                visible element with exactly that text
 *   w:390        set the viewport width
 *   wait:2000    wait (ms)
 * Writes `.claude/scratch/qa/<label>/<name>.<phase>.png` (git-ignored) and
 * refreshes `compare.html` there: before and after side by side.
 *
 * @since SPSG_VERSION
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice( 2 );
const option = ( name, fallback ) => {
	const at = args.indexOf( `--${ name }` );
	return at === -1 ? fallback : args.splice( at, 2 )[ 1 ];
};

const label = option( 'label', 'review' );
const phase = option( 'phase', 'after' );
const width = Number( option( 'width', '1440' ) );
const shots = args;

if ( ! shots.length || ! [ 'before', 'after' ].includes( phase ) ) {
	console.error( 'Usage: qa-shots.mjs --label <name> --phase before|after "name|path|actions" …' );
	process.exit( 1 );
}

const out = path.resolve( '.claude/scratch/qa', label );
fs.mkdirSync( out, { recursive: true } );

// Site URL and an admin login cookie, from WP-CLI (never a password).
const wp = ( code ) => execFileSync( 'wp', [ 'eval', code ], { encoding: 'utf8' } ).trim();
const site = new URL( wp( 'echo get_option( "siteurl" );' ) );
const auth = JSON.parse(
	wp( `
		$user = get_users( [ 'role' => 'administrator', 'number' => 1 ] )[0];
		$exp  = time() + HOUR_IN_SECONDS;
		echo wp_json_encode( [
			[ 'name' => SECURE_AUTH_COOKIE, 'value' => wp_generate_auth_cookie( $user->ID, $exp, 'secure_auth' ) ],
			[ 'name' => AUTH_COOKIE, 'value' => wp_generate_auth_cookie( $user->ID, $exp, 'auth' ) ],
			[ 'name' => LOGGED_IN_COOKIE, 'value' => wp_generate_auth_cookie( $user->ID, $exp, 'logged_in' ) ],
		] );
	` )
).map( ( cookie ) => ( { ...cookie, domain: site.hostname, path: '/', secure: 'https:' === site.protocol } ) );

const browser = await chromium.launch( { channel: 'chrome' } ).catch( () => chromium.launch() );

for ( const shot of shots ) {
	const [ name, target, actions = '' ] = shot.split( '|' );
	const steps = actions.split( ';' ).filter( Boolean );
	const context = await browser.newContext( {
		ignoreHTTPSErrors: true,
		viewport: { width, height: 1000 },
	} );

	if ( ! steps.includes( 'guest' ) ) {
		await context.addCookies( auth );
	}

	const page = await context.newPage();
	// `load`, not `networkidle`: storefront trackers keep the network busy.
	await page.goto( new URL( target, site ).href, { waitUntil: 'load' } );
	await page.waitForTimeout( 2500 );

	for ( const step of steps ) {
		if ( step.startsWith( 'click:' ) ) {
			// A tab or button with that name first (the WP admin menu has
			// links such as "Design"), then the first visible text match.
			const name = step.slice( 6 );
			const control = page
				.getByRole( 'tab', { name, exact: true } )
				.or( page.getByRole( 'button', { name, exact: true } ) )
				.filter( { visible: true } );
			const target = ( await control.count() )
				? control
				: page.getByText( name, { exact: true } ).filter( { visible: true } );
			await target.first().click();
			await page.waitForTimeout( 600 );
		} else if ( step.startsWith( 'w:' ) ) {
			await page.setViewportSize( { width: Number( step.slice( 2 ) ), height: 1000 } );
			await page.waitForTimeout( 600 );
		} else if ( step.startsWith( 'wait:' ) ) {
			await page.waitForTimeout( Number( step.slice( 5 ) ) );
		}
	}

	await page.screenshot( { path: path.join( out, `${ name }.${ phase }.png` ), fullPage: true } );
	console.log( `${ name }.${ phase }.png` );
	await context.close();
}

await browser.close();

// Side-by-side page for every shot that has a before and/or an after.
const names = [ ...new Set( fs.readdirSync( out )
	.map( ( file ) => file.match( /^(.+)\.(before|after)\.png$/ )?.[ 1 ] )
	.filter( Boolean ) ) ].sort();
const cell = ( name, which ) =>
	fs.existsSync( path.join( out, `${ name }.${ which }.png` ) )
		? `<a href="${ name }.${ which }.png"><img src="${ name }.${ which }.png" alt="${ name } ${ which }"></a>`
		: '<p>—</p>';

fs.writeFileSync(
	path.join( out, 'compare.html' ),
	`<!doctype html><meta charset="utf-8"><title>${ label }: before / after</title>
<style>body{font:14px system-ui;margin:24px}h2{margin:32px 0 8px}.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.row h3{margin:0 0 6px;font-size:12px;color:#666}img{width:100%;border:1px solid #ddd}</style>
<h1>${ label }: before / after</h1>
${ names.map( ( name ) => `<h2>${ name }</h2><div class="row"><div><h3>Before</h3>${ cell( name, 'before' ) }</div><div><h3>After</h3>${ cell( name, 'after' ) }</div></div>` ).join( '\n' ) }`
);
console.log( `compare: ${ path.join( out, 'compare.html' ) }` );
