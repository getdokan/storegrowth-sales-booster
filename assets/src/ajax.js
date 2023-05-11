export const Ajax = (method, data = []) => {

  let body = {
    action: 'storepulse_sales_booster_admin_ajax',
    _ajax_nonce: storepulse_sales_boosterAdmin.nonce,
    data: data,
    method: method,
  };

  return jQuery.post( storepulse_sales_boosterAdmin.ajax_url, body );
}
