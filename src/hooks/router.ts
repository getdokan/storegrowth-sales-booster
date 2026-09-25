/**
 * react-router-dom, re-exported from the shared `@storegrowth/hooks` bundle.
 *
 * The shell and every module / pro bundle must use the same react-router
 * instance, otherwise hooks such as `useNavigate()` run outside the shell's
 * router context. So bundles import router APIs from `@storegrowth/hooks`,
 * never from `react-router-dom` directly (enforced by ESLint).
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
    Routes,
    useLocation,
    useMatch,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';

export type { NavigateFunction, Params } from 'react-router-dom';
