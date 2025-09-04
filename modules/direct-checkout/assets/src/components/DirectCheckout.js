import { Card, Form } from "antd";
import { useEffect } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";


function DirectCheckout({ outlet: Outlet }) {
  const { setCreateFromData } = useDispatch("spsg_direct_checkout");
  const { setPageLoading } = useDispatch("spsg");
  const { createDirectCheckoutForm } = useSelect((select) => ({
    createDirectCheckoutForm: select(
      "spsg_direct_checkout"
    ).getCreateFromData(),
  }));
  const layout = {
    labelCol:{
      span: 7
    },
    wrapperCol:{
      span: 17
    },
    autoComplete:"off"
  };
  useEffect(() => {
    setPageLoading(true);
    let $ = jQuery;
    $.post(
      spsgAdmin.ajax_url,
      {
        action: "spsg_direct_checkout_get_settings",
        data: [],
        _ajax_nonce: spsgAdmin.nonce,
      },
      function (response) {
        setPageLoading(false);
        setCreateFromData({
          ...createDirectCheckoutForm,
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

export default DirectCheckout;
