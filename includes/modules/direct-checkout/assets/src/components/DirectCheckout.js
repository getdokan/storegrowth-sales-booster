import { Card, Form } from "antd";
import { useEffect } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";


function DirectCheckout({ outlet: Outlet }) {
  const { setCreateFromData } = useDispatch("sgsb_direct_checkout");
  const { setPageLoading } = useDispatch("sgsb");
  const { createDirectCheckoutForm } = useSelect((select) => ({
    createDirectCheckoutForm: select(
      "sgsb_direct_checkout"
    ).getCreateFromData(),
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
      sgsbAdmin.ajax_url,
      {
        action: "sgsb_direct_checkout_get_settings",
        data: [],
        _ajax_nonce: sgsbAdmin.nonce,
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
      <Card className="tab-pan-wrapper">
        <Outlet />
      </Card>
    </Form>
  );
}

export default DirectCheckout;
