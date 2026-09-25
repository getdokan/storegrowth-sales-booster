/**
 * Shared hooks, context and router, exposed as `window.storegrowth.hooks`
 * (import from `@storegrowth/hooks`). No global data store: shared state is
 * React context, everything else is local.
 *
 * @since SPSG_VERSION
 */
export { ModulesProvider, useModules } from './modules-context';
export type { ModulesContextValue } from './modules-context';
export { useModuleSettings } from './use-module-settings';
export type { ModuleSettings } from './use-module-settings';
export * from './router';
