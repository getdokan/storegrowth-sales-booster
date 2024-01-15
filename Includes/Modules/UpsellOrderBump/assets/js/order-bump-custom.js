function extraProducts(product_id, check_status, offer_price) {
    
  var $ = jQuery;
  var passData = {
     offer_product_id  : product_id,
     checked           : check_status,
     bump_price   : offer_price
     
    };
    $.post(bump_save_url.ajax_url_for_front, { 
        'action'    : 'offer_product_add_to_cart', 
        'data'      : passData,
        '_ajax_nonce' : bump_save_url.ajd_nonce
     }, function (data) {
        location.reload();
    });
}