import { addFilter } from "@wordpress/hooks";
import FlyCart from "./components";
import { ShoppingCartOutlined } from "@ant-design/icons";

/**
 * Add routes to sidebar.
 */
addFilter(
  "spsg_routes",
  "spsg",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "fly-cart";
    routes.push({
      name: moduleName,
      label: "Fly Cart",
      path: "/fly-cart",
      element: (
        <FlyCart
          navigate={navigate}
          useSearchParams={useSearchParams}
          moduleId={moduleName}
        />
      ),
    });

    return routes;
  }
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "spsg", (items, Link) => {
  items.push({
    label: <Link to="/fly-cart">Fly Cart</Link>,
    key: "fly-cart",
    icon: <ShoppingCartOutlined />,
  });

  return items;
});
