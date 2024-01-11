import { addFilter } from "@wordpress/hooks";
import BogoLayout from "./components/BogoLayout";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CreateBogo from "./components/CreateBogo";
import { register } from "@wordpress/data";

import BogoStore from "./store";
import BogoTabLayout from "./components/BogoTabLayout";
import CreateMessage from "./components/CreateMessage";

register(BogoStore);

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    routes.push({
      path: "/bogo",
      exact: true,
      name: "bogo",
      label: "BOGO",
      element: (
        <BogoLayout outlet={outlet} navigate={navigate} useParams={useParams} useSearchParams={useSearchParams} />
      ),
      children: [
        {
          index: true,
          element: (
            <BogoTabLayout
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: "create-bogo",
          element: (
            <CreateBogo
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: ":bogo_id",
          element: (
            <CreateBogo
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: ":action_name/:bogo_id",
          element: (
            <CreateBogo
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: 'create-message',
          element: (
            <CreateMessage
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: "create-message/:category_id",
          element: (
            <CreateMessage
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
        {
          path: "create-message/:action_name/:category_id",
          element: (
            <CreateMessage
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
      ],
    });

    return routes;
  }
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: <Link to="/bogo">BOGO</Link>,
    key: "bogo",
    icon: <ShoppingCartOutlined />,
  });

  return items;
});
