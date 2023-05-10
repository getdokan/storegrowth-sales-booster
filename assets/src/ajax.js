export const Ajax = (method, data = []) => {

  let body = {
    action: 'spsb_admin_ajax',
    _ajax_nonce: spsbAdmin.nonce,
    data: data,
    method: method,
  };

  return jQuery.post( spsbAdmin.ajax_url, body );
}
