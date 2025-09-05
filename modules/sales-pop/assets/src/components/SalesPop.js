import { Form } from "antd";
import { useEffect } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";

function SalesPop({ outlet: Outlet }) {
  const { setCreateFromData } = useDispatch("spsg_order_sales_pop");
  const { setPageLoading } = useDispatch("spsg");
  const { createPopupForm } = useSelect((select) => ({
    createPopupForm: select("spsg_order_sales_pop").getCreateFromData(),
  }));
  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 18,
    },
  };

  useEffect(() => {
    setPageLoading(true);

    let $ = jQuery;
    $.post(
      sales_pop_data.ajax_url,
      {
        action: "popup_products",
        data: [],
        _ajax_nonce: sales_pop_data.ajd_nonce,
      },
      function (response) {
        setPageLoading(false);
        setCreateFromData({
          ...createPopupForm,
          ...response.data,
        });
      }
    );
  }, []);

  return (
    <Form {...layout}>
      <Outlet />
    </Form>
  );
}

export default SalesPop;
