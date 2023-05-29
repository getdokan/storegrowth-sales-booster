export const Ajax = (method, data = []) => {

  let body = {
    action: 'sgsb_admin_ajax',
    _ajax_nonce: sgsbAdmin.nonce,
    data: data,
    method: method,
  };

  return jQuery.post( sgsbAdmin.ajax_url, body );
}
