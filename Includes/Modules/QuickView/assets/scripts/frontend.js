// 'use strict';

// var sgsbqcv_ids = [], sgsbqcv_products = [];
// console.log(sgsbqcv_vars);
// (function($) {
//   $(function() {
//     $('.sgsbqcv-btn, .woosq-link').each(function() {
//       var id = $(this).attr('data-id');
//       var pid = $(this).attr('data-pid');
//       var product_id = $(this).attr('data-product_id');

//       if (typeof pid !== typeof undefined && pid !== false) {
//         id = pid;
//       }

//       if (typeof product_id !== typeof undefined && product_id !== false) {
//         id = product_id;
//       }

//       if (-1 === $.inArray(id, sgsbqcv_ids)) {
//         sgsbqcv_ids.push(id);
//         sgsbqcv_products.push({src: sgsbqcv_vars.ajax_url + '?product_id=' + id});
//       }
//     });

//     console.log(sgsbqcv_ids)
//     console.log(sgsbqcv_products)
//     // quick view
//     if (sgsbqcv_vars.quick_view > 0) {
//       setTimeout(function() {
//         woosq_open(sgsbqcv_vars.quick_view);
//       }, 1000);
//     }
//   });

//   $(document).on('click touch', '[href*="#woosq-"]', function(e) {
//     var $this = $(this);
//     var href = $this.attr('href');
//     var reg = /#woosq-([0-9]+)/g;
//     var match = reg.exec(href);

//     if (match[1] !== undefined) {
//       var id = match[1];
//       var effect = $this.attr('data-effect');
//       var context = $this.attr('data-context');

//       woosq_open(id, effect, context);
//       e.preventDefault();
//     }
//   });

//   $(document).on('click touch', '.sgsbqcv-btn, .woosq-link', function(e) {
//     e.preventDefault();

//     var $this = $(this);
//     var id = $this.attr('data-id');
//     var pid = $this.attr('data-pid');
//     var product_id = $this.attr('data-product_id');
//     var effect = $this.attr('data-effect');
//     var context = $this.attr('data-context');

//     if (typeof pid !== typeof undefined && pid !== false) {
//       id = pid;
//     }

//     if (typeof product_id !== typeof undefined && product_id !== false) {
//       id = product_id;
//     }

//     console.log("contectss");
//     console.log(`${id} ${effect} ${context}`);
//     woosq_open(id, effect, context);
//   });

//   $(document).on('added_to_cart', function() {
//     if (sgsbqcv_vars.auto_close === 'yes') {
//       if (sgsbqcv_vars.view === 'popup') {
//         $.magnificPopup.close();
//       }

//       woosq_close();
//     }
//   });

//   $(document).on('woosq_loaded', function() {
//     var form_variation = $('#woosq-popup').find('.variations_form');

//     form_variation.each(function() {
//       $(this).wc_variation_form();
//     });

//     woosq_init_content('loaded');

//     // add redirect
//     if (!$('#woosq-popup .woosq-redirect').length) {
//       if ((sgsbqcv_vars.cart_redirect === 'yes') &&
//           (sgsbqcv_vars.cart_url !== '')) {
//         $('#woosq-popup form').
//             prepend(
//                 '<input class="woosq-redirect" name="woosq-redirect" type="hidden" value="' +
//                 sgsbqcv_vars.cart_url + '"/>');
//       } else {
//         $('#woosq-popup form').
//             prepend(
//                 '<input class="woosq-redirect" name="woosq-redirect" type="hidden" value="' +
//                 window.location.href + '"/>');
//       }
//     }
//   });

//   $(window).on('resize', function() {
//     woosq_init_content('resize');
//   });

//   $(document).on('found_variation', function(e, t) {
//     if (!$(e['target']).closest('.woosb-product').length &&
//         !$(e['target']).closest('.woosg-product').length &&
//         !$(e['target']).closest('.woobt-product').length &&
//         !$(e['target']).closest('.woofs-product').length &&
//         $(e['target']).closest('#woosq-popup').length) {
//       if (t['image_id'] !== undefined) {
//         if ($('#woosq-popup .thumbnails .thumbnail').length > 1) {
//           var $thumb = $(
//               '.thumbnail:not(.slick-cloned)[data-id="' + t['image_id'] + '"]');

//           if ($thumb.length) {
//             var pos = $('#woosq-popup .thumbnails .thumbnail').index($thumb);
//             var $images = $('#woosq-popup .thumbnails .images');

//             if ((pos > 0) && $images.hasClass('slick-initialized')) {
//               setTimeout(function() {
//                 $images.slick('slickGoTo', pos - 1);
//               }, 100);
//             }
//           }
//         }
//       }
//     }
//   });

//   $(document).on('reset_data', function(e) {
//     if ($(e['target']).closest('#woosq-popup').length) {
//       if (($('#woosq-popup .thumbnails .thumbnail').length > 1) &&
//           $('#woosq-popup .thumbnails .images').hasClass('slick-initialized')) {
//         $('#woosq-popup .thumbnails .images').slick('slickGoTo', 0);
//       }
//     }
//   });

//   if (sgsbqcv_vars.hashchange === 'yes') {
//     $(window).on('hashchange', function() {
//       if (location.href.indexOf('#woosq') < 0) {
//         if (sgsbqcv_vars.view === 'popup') {
//           $.magnificPopup.close();
//         }

//         woosq_close();
//       }
//     });
//   }

//   $(document).on('click touch', '.woosq-overlay, .woosq-close', function() {
//     woosq_close();
//   });
// })(jQuery);

// function woosq_open(id, effect, context) {
//   jQuery('body').addClass('woosq-open');

//   if (sgsbqcv_vars.view === 'sidebar') {
//     // sidebar
//     woosq_loading();

//     var data = {
//       action: 'get_product_data', product_id: id, nonce: sgsbqcv_vars.nonce,
//     };

//     jQuery.post(sgsbqcv_vars.ajax_url, data, function(response) {
//       jQuery('.woosq-sidebar').html(response);
//       woosq_loaded();
//       jQuery(document.body).trigger('woosq_loaded', [id]);
//     });
//   } else {
//     // popup
//     if (-1 === jQuery.inArray(id, sgsbqcv_ids)) {
//       sgsbqcv_ids.push(id);
//       sgsbqcv_products.push({src: sgsbqcv_vars.ajax_url + '?product_id=' + id});
//     }

//     var index = woosq_get_key(sgsbqcv_products, 'src',
//         sgsbqcv_vars.ajax_url + '?product_id=' + id);
//     var main_class = 'mfp-woosq';

//     if (typeof context !== typeof undefined && context !== false) {
//       main_class = main_class + ' mfp-woosq-' + context;
//     }

//     if (typeof effect !== typeof undefined && effect !== false) {
//       main_class = main_class + ' ' + effect;
//     } else {
//       main_class = main_class + ' ' + sgsbqcv_vars.effect;
//     }

//     jQuery.magnificPopup.open({
//       items: sgsbqcv_products,
//       type: 'ajax',
//       mainClass: main_class,
//       removalDelay: 160,
//       overflowY: 'scroll',
//       fixedContentPos: true,
//       tClose: sgsbqcv_vars.close,
//       gallery: {
//         tPrev: sgsbqcv_vars.prev,
//         tNext: sgsbqcv_vars.next,
//         enabled: sgsbqcv_vars.next_prev === 'yes',
//       },
//       ajax: {
//         settings: {
//           type: 'GET',
//           data: {
//             action: 'get_product_data', nonce: sgsbqcv_vars.nonce,
//           },
//         },
//       },
//       callbacks: {
//         open: function() {
//           if (sgsbqcv_vars.hashchange === 'yes') {
//             location.href = location.href.split('#')[0] + '#woosq';
//           }
//         }, ajaxContentAdded: function() {
//           jQuery(document.body).trigger('woosq_loaded', [id]);
//         }, close: function() {
//           if (sgsbqcv_vars.hashchange === 'yes') {
//             if (location.hash) history.go(-1);
//           }
//         }, afterClose: function() {
//           jQuery(document.body).trigger('woosq_close', [id]);
//         },
//       },
//     }, index);
//   }
//   jQuery(document.body).trigger('woosq_open', [id]);
// }

// function woosq_close() {
//   jQuery('body').removeClass('woosq-open');
//   jQuery(document.body).trigger('woosq_close');
// }

// function woosq_loading() {
//   jQuery('.woosq-sidebar').addClass('woosq-loading');
// }

// function woosq_loaded() {
//   jQuery('.woosq-sidebar').removeClass('woosq-loading');
// }

// function woosq_init_content(context) {
//   if (context === 'loaded') {
//     woosq_thumbnails_zoom();
//     woosq_thumbnails_slick();
//     woosq_related_slick();
//   }

//   if (sgsbqcv_vars.view === 'sidebar') {
//     if (sgsbqcv_vars.scrollbar === 'yes') {
//       jQuery('.woosq-product').
//           perfectScrollbar('destroy').
//           perfectScrollbar({theme: 'wpc'});
//     }
//   } else {
//     // fix for popup
//     if (sgsbqcv_vars.scrollbar === 'yes') {
//       if (jQuery(window).width() < 1024) {
//         // jQuery('.woosq-product .summary-content').perfectScrollbar('destroy');
//         jQuery('.woosq-product').
//             perfectScrollbar('destroy').
//             perfectScrollbar({theme: 'wpc'});
//       } else {
//         // jQuery('.woosq-product').perfectScrollbar('destroy');
//         jQuery('.woosq-product .summary-content').
//             perfectScrollbar('destroy').
//             perfectScrollbar({theme: 'wpc'});
//       }
//     }
//   }
// }

// function woosq_get_key(array, key, value) {
//   for (var i = 0; i < array.length; i++) {
//     if (array[i][key] === value) {
//       return i;
//     }
//   }

//   return -1;
// }

// function woosq_thumbnails_zoom() {
//   if (sgsbqcv_vars.thumbnails_effect === 'zoom') {
//     jQuery('#woosq-popup .thumbnails .images .thumbnail').each(function() {
//       var $this = jQuery(this);
//       var zoom_params = JSON.parse(sgsbqcv_vars.thumbnails_zoom_params);

//       zoom_params.url = $this.find('img').attr('data-src');

//       // destroy first
//       $this.trigger('zoom.destroy');
//       $this.zoom(zoom_params);
//     });
//   }
// }

// function woosq_thumbnails_slick() {
//   if (jQuery('#woosq-popup .thumbnails .images .thumbnail').length > 1) {
//     if (jQuery('#woosq-popup .thumbnails .images').
//         hasClass('slick-initialized')) {
//       // unslick first
//       jQuery('#woosq-popup .thumbnails .images').slick('unslick');
//     }

//     jQuery('#woosq-popup .thumbnails .images').
//         slick(JSON.parse(sgsbqcv_vars.thumbnails_slick_params));
//   }
// }

// function woosq_related_slick() {
//   if (jQuery('.woosq-related-products').hasClass('slick-initialized')) {
//     // unslick first
//     jQuery('.woosq-related-products').slick('unslick');
//   }

//   if (jQuery('.woosq-related-product').length > 1) {
//     jQuery('.woosq-related-products').
//         slick(JSON.parse(sgsbqcv_vars.related_slick_params));
//   }
// }
