export const Ajax = (method, data = []) => {

  let body = {
    action: 'spsg_admin_ajax',
    _ajax_nonce: spsgAdmin.nonce,
    data: data,
    method: method,
  };

  return jQuery.post( spsgAdmin.ajax_url, body );
}
