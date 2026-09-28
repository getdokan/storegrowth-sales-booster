/**
 * react-router-dom, re-exported from the shared `@storegrowth/hooks` bundle.
 *
 * The shell and every module / pro bundle must use the same react-router
 * instance, otherwise hooks such as `useNavigate()` run outside the shell's
 * router context. So bundles import router APIs from `@storegrowth/hooks`,
 * never from `react-router-dom` directly (enforced by ESLint).
 *
 * `Router` (the low-level router: a given location and navigator) lets a
 * page drawn by another app's router use these hooks, e.g. the BOGO pages
 * on the Dokan vendor dashboard, bridged to Dokan's router (ADR-011).
 *
 * @since SPSG_VERSION
 */
export {
    HashRouter,
    Link,
    NavLink,
    Navigate,
    Outlet,
    Route,
    Router,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';

export type {
    Location,
    NavigateFunction,
    Navigator,
    Params,
    To,
} from 'react-router-dom';
