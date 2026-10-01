import { execSync } from 'child_process';
import * as path from 'path';
import { env } from './env';

// Raw WordPress access through WP-CLI, for the rare setup no API can do: storing
// an option value the settings engine would reject (a legacy value saved before
// validation existed). Opt-in: `E2E_WP_CLI` names the command prefix
// (helpers/env.ts); without it, guard the test with `test.skip(!hasWpCli())`.

/** Whether a WP-CLI prefix is configured. */
export function hasWpCli(): boolean {
  return env.wpCli !== '';
}

/** Single-quote a shell argument. */
function quote(arg: string): string {
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

/** Run `wp <args>` and return its stdout (trimmed). Throws on a non-zero exit. */
export function wpCli(args: string[]): string {
  if (!hasWpCli()) throw new Error('E2E_WP_CLI is not set');
  return execSync(`${env.wpCli} ${args.map(quote).join(' ')}`, {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60_000,
  }).trim();
}

/** An option as decoded JSON, or `undefined` when it doesn't exist. */
export function getOptionRaw(name: string): unknown {
  try {
    return JSON.parse(wpCli(['option', 'get', name, '--format=json']));
  } catch {
    return undefined;
  }
}

/** Store an option exactly as given (JSON-encoded through WP-CLI, no plugin sanitizing). */
export function setOptionRaw(name: string, value: unknown): void {
  wpCli(['option', 'update', name, JSON.stringify(value), '--format=json']);
}

/** Put an option back as `getOptionRaw()` found it (deleting it when it didn't exist). */
export function restoreOptionRaw(name: string, original: unknown): void {
  if (original === undefined) {
    wpCli(['option', 'delete', name]);
  } else {
    setOptionRaw(name, original);
  }
}
