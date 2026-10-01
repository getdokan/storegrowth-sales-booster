import fs from "fs";
import path from "path";

/**
 * Deletes what the webpack build generates, so a release zip carries only
 * the bundles of the build that runs right after (no stale entry or dev
 * source map left by `npm run start`).
 *
 * - `build/` (webpack's `clean` also empties it, this covers a failed build).
 * - Each module's generated bundles in `modules/<id>/assets/js/`: `admin.js`,
 *   `blocks.js`, `*.asset.php` and `*.js.map` — the names `.gitignore` lists.
 *   Hand-written storefront scripts there (e.g. `admin-custom.js`) stay.
 */
const GENERATED = [ /^admin\.js$/, /^blocks\.js$/, /\.asset\.php$/, /\.js\.map$/ ];

const root = path.resolve();
let removed = 0;

fs.rmSync( path.join( root, "build" ), { recursive: true, force: true } );

const modulesDir = path.join( root, "modules" );

for ( const moduleId of fs.readdirSync( modulesDir ) ) {
  const jsDir = path.join( modulesDir, moduleId, "assets", "js" );

  if ( ! fs.existsSync( jsDir ) ) {
    continue;
  }

  for ( const file of fs.readdirSync( jsDir ) ) {
    if ( GENERATED.some( ( pattern ) => pattern.test( file ) ) ) {
      fs.rmSync( path.join( jsDir, file ) );
      removed++;
    }
  }
}

console.log( `Cleaned build/ and ${ removed } generated module asset(s).` );
