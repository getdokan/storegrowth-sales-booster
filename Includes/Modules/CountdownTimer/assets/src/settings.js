import { addFilter } from "@wordpress/hooks";
import SalesCountdownLayout from "./components/SalesCountdownLayout";
import { StockOutlined } from "@ant-design/icons";
import CreateCountdown from "./components/CreateCountdown";
import CountdownTimerLayout from "./components/CountdownTimerLayout";
/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "countdown-timer";

    routes.push({
      name: moduleName,
      label: "Countdown Timer",
      path: "/countdown-timer",
      exact: true,
      element: (
        <CountdownTimerLayout
          moduleId={moduleName}
          outlet={outlet}
          navigate={navigate}
          useParams={useParams}
          useSearchParams={useSearchParams}
        />
      ),
      children: [
        {
          index: true,
          element: (
            <SalesCountdownLayout
              moduleId={moduleName}
              outlet={outlet}
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: "create-countdown",
          element: (
            <CreateCountdown
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: ":countdown_id",
          element: (
            <CreateCountdown
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: ":action_name/:countdown_id",
          element: (
            <CreateCountdown
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
      ],
    });

    return routes;
  },
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: <Link to="/countdown-timer">Countdown Timer</Link>,
    key: "countdown-timer",
    icon: <StockOutlined />,
  });

  return items;
});
