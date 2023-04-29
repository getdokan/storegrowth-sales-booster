export const Ajax = (method, data = []) => {

  let body = {
    action: 'sbfw_admin_ajax',
    _ajax_nonce: sbfwAdmin.nonce,
    data: data,
    method: method,
  };

  return jQuery.post( sbfwAdmin.ajax_url, body );
}
