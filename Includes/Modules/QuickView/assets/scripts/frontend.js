"use strict";

var sgsbqcv_ids = [],
  sgsbqcv_products = [];
console.log("Workimg");
(function ($) {
  $(function () {
    $(".sgsbqcv-btn, .sgsbqcv-link").each(function () {
      var id = $(this).attr("data-id");
      var pid = $(this).attr("data-pid");
      var product_id = $(this).attr("data-product_id");
      console.log(product_id);
      if (typeof pid !== typeof undefined && pid !== false) {
        id = pid;
      }

      if (typeof product_id !== typeof undefined && product_id !== false) {
        id = product_id;
      }

      if (-1 === $.inArray(id, sgsbqcv_ids)) {
        sgsbqcv_ids.push(id);
        sgsbqcv_products.push({
          src: sgsbqcv_vars.ajax_url + "?product_id=" + id,
        });
      }
    });
    // quick view
    if (sgsbqcv_vars.quick_view > 0) {
      setTimeout(function () {
        sgsbqcv_open(sgsbqcv_vars.quick_view);
      }, 1000);
    }
  });

  console.log(sgsbqcv_vars);

  $(document).on("click touch", '[href*="#sgsbqcv-"]', function (e) {
    var $this = $(this);
    var href = $this.attr("href");
    var reg = /#sgsbqcv-([0-9]+)/g;
    var match = reg.exec(href);

    if (match[1] !== undefined) {
      var id = match[1];
      var effect = $this.attr("data-effect");
      var context = $this.attr("data-context");
      console.log("Data Effect");
      console.log(effect);
      sgsbqcv_open(id, effect, context);
      e.preventDefault();
    }
  });

  $(document).on("click touch", ".sgsbqcv-btn, .sgsbqcv-link", function (e) {
    e.preventDefault();

    var $this = $(this);
    var id = $this.attr("data-id");
    var pid = $this.attr("data-pid");
    var product_id = $this.attr("data-product_id");
    var effect = $this.attr("data-effect");
    var context = $this.attr("data-context");

    if (typeof pid !== typeof undefined && pid !== false) {
      id = pid;
    }

    if (typeof product_id !== typeof undefined && product_id !== false) {
      id = product_id;
    }

    sgsbqcv_open(id, effect, context);
  });

  jQuery(document).ready(function ($) {
    console.log("loading");
    function custom_ajax_add_to_cart(product_id) {
      var quantity = $("#custom-quantity").val();

      $.ajax({
        type: "POST",
        url: sgsbqcv_vars.ajax_url,
        data: {
          action: "custom_ajax_add_to_cart",
          product_id: product_id,
          quantity: quantity,
        },
        success: function (response) {
          alert("Product added to cart!");
        },
      });
    }

    $("body").on("click", ".custom-add-to-cart button", function () {
      // Get the ID of the clicked element (assumes the button has an ID attribute)
      var clickedElementId = $(this).attr("product-id");
      console.log(clickedElementId);

      // // Call the function with the clicked element's ID
      custom_ajax_add_to_cart(clickedElementId);
      // Add your additional logic here
    });

    $(".custom-add-to-cart").on("click", function () {
      console.log("clicked");
      // Get the ID of the clicked element (assumes the button has an ID attribute)
      var clickedElementId = $(this).attr("product-id");

      // // Call the function with the clicked element's ID
      // custom_ajax_add_to_cart(clickedElementId);
    });
  });

  // $(document).on("added_to_cart", function () {
  //   if (sgsbqcv_vars.auto_close === "yes") {
  //     if (sgsbqcv_vars.view === "popup") {
  //       $.magnificPopup.close();
  //     }

  //     sgsbqcv_close();
  //   }
  // });

  $(document).on("sgsbqcv_loaded", function () {
    var form_variation = $("#sgsbqcv-popup").find(".variations_form");

    form_variation.each(function () {
      $(this).wc_variation_form();
    });

    sgsbqcv_init_content("loaded");

    // add redirect
    if (!$("#sgsbqcv-popup .sgsbqcv-redirect").length) {
      if (
        sgsbqcv_vars.cart_redirect === "yes" &&
        sgsbqcv_vars.cart_url !== ""
      ) {
        $("#sgsbqcv-popup form").prepend(
          '<input class="sgsbqcv-redirect" name="sgsbqcv-redirect" type="hidden" value="' +
            sgsbqcv_vars.cart_url +
            '"/>'
        );
      } else {
        $("#sgsbqcv-popup form").prepend(
          '<input class="sgsbqcv-redirect" name="sgsbqcv-redirect" type="hidden" value="' +
            window.location.href +
            '"/>'
        );
      }
    }
  });

  $(window).on("resize", function () {
    sgsbqcv_init_content("resize");
  });

  $(document).on("found_variation", function (e, t) {
    if (
      !$(e["target"]).closest(".woosb-product").length &&
      !$(e["target"]).closest(".woosg-product").length &&
      !$(e["target"]).closest(".woobt-product").length &&
      !$(e["target"]).closest(".woofs-product").length &&
      $(e["target"]).closest("#sgsbqcv-popup").length
    ) {
      if (t["image_id"] !== undefined) {
        if ($("#sgsbqcv-popup .thumbnails .thumbnail").length > 1) {
          var $thumb = $(
            '.thumbnail:not(.slick-cloned)[data-id="' + t["image_id"] + '"]'
          );

          if ($thumb.length) {
            var pos = $("#sgsbqcv-popup .thumbnails .thumbnail").index($thumb);
            var $images = $("#sgsbqcv-popup .thumbnails .images");

            if (pos > 0 && $images.hasClass("slick-initialized")) {
              setTimeout(function () {
                $images.slick("slickGoTo", pos - 1);
              }, 100);
            }
          }
        }
      }
    }
  });

  $(document).on("reset_data", function (e) {
    if ($(e["target"]).closest("#sgsbqcv-popup").length) {
      if (
        $("#sgsbqcv-popup .thumbnails .thumbnail").length > 1 &&
        $("#sgsbqcv-popup .thumbnails .images").hasClass("slick-initialized")
      ) {
        $("#sgsbqcv-popup .thumbnails .images").slick("slickGoTo", 0);
      }
    }
  });

  if (sgsbqcv_vars.hashchange === "yes") {
    $(window).on("hashchange", function () {
      if (location.href.indexOf("#sgsbqcv") < 0) {
        if (sgsbqcv_vars.view === "popup") {
          $.magnificPopup.close();
        }

        sgsbqcv_close();
      }
    });
  }

  $(document).on(
    "click touch",
    ".sgsbqcv-overlay, .sgsbqcv-close",
    function () {
      sgsbqcv_close();
    }
  );
})(jQuery);

function sgsbqcv_open(id, effect, context) {
  jQuery("body").addClass("sgsbqcv-open");

  if (sgsbqcv_vars.view === "sidebar") {
    // sidebar
    sgsbqcv_loading();

    var data = {
      action: "sgsbqcv_quickview",
      product_id: id,
      nonce: sgsbqcv_vars.nonce,
    };

    jQuery.post(sgsbqcv_vars.ajax_url, data, function (response) {
      jQuery(".sgsbqcv-sidebar").html(response);
      sgsbqcv_loaded();
      jQuery(document.body).trigger("sgsbqcv_loaded", [id]);
    });
  } else {
    // popup
    if (-1 === jQuery.inArray(id, sgsbqcv_ids)) {
      sgsbqcv_ids.push(id);
      sgsbqcv_products.push({
        src: sgsbqcv_vars.ajax_url + "?product_id=" + id,
      });
    }

    var index = sgsbqcv_get_key(
      sgsbqcv_products,
      "src",
      sgsbqcv_vars.ajax_url + "?product_id=" + id
    );
    var main_class = "mfp-sgsbqcv";

    if (typeof context !== typeof undefined && context !== false) {
      main_class = main_class + " mfp-sgsbqcv-" + context;
    }

    if (typeof effect !== typeof undefined && effect !== false) {
      main_class = main_class + " " + effect;
      console.log("main2");
      console.log(main_class);
    } else {
      console.log("main1");
      console.log(main_class);
      main_class = main_class + " " + sgsbqcv_vars.effect;
    }

    jQuery.magnificPopup.open(
      {
        items: sgsbqcv_products,
        type: "ajax",
        mainClass: main_class,
        removalDelay: 160,
        overflowY: "scroll",
        fixedContentPos: true,
        tClose: sgsbqcv_vars.close,
        showCloseBtn:sgsbqcv_vars?.enable_close_button,
        gallery: {
          tPrev: sgsbqcv_vars.prev,
          tNext: sgsbqcv_vars.next,
          enabled: sgsbqcv_vars.next_prev === "yes",
        },
        ajax: {
          settings: {
            type: "GET",
            data: {
              action: "sgsbqcv_quickview",
              nonce: sgsbqcv_vars.nonce,
            },
          },
        },
        callbacks: {
          open: function () {
            if (sgsbqcv_vars.hashchange === "yes") {
              location.href = location.href.split("#")[0] + "#sgsbqcv";
            }
          },
          ajaxContentAdded: function () {
            jQuery(document.body).trigger("sgsbqcv_loaded", [id]);
          },
          close: function () {
            if (sgsbqcv_vars.hashchange === "yes") {
              if (location.hash) history.go(-1);
            }
          },
          afterClose: function () {
            jQuery(document.body).trigger("sgsbqcv_close", [id]);
          },
        },
      },
      index
    );
  }

  jQuery(document.body).trigger("sgsbqcv_open", [id]);
}

function sgsbqcv_close() {
  jQuery("body").removeClass("sgsbqcv-open");
  jQuery(document.body).trigger("sgsbqcv_close");
}

function sgsbqcv_loading() {
  jQuery(".sgsbqcv-sidebar").addClass("sgsbqcv-loading");
}

function sgsbqcv_loaded() {
  jQuery(".sgsbqcv-sidebar").removeClass("sgsbqcv-loading");
}

function sgsbqcv_init_content(context) {
  if (context === "loaded") {
    sgsbqcv_thumbnails_zoom();
    sgsbqcv_thumbnails_slick();
    sgsbqcv_related_slick();
  }

  if (sgsbqcv_vars.view === "sidebar") {
    if (sgsbqcv_vars.scrollbar === "yes") {
      jQuery(".sgsbqcv-product")
        .perfectScrollbar("destroy")
        .perfectScrollbar({ theme: "wpc" });
    }
  } else {
    // fix for popup
    if (sgsbqcv_vars.scrollbar === "yes") {
      if (jQuery(window).width() < 1024) {
        jQuery(".sgsbqcv-product .summary-content").perfectScrollbar("destroy");
        jQuery(".sgsbqcv-product")
          .perfectScrollbar("destroy")
          .perfectScrollbar({ theme: "wpc" });
      } else {
        jQuery(".sgsbqcv-product").perfectScrollbar("destroy");
        jQuery(".sgsbqcv-product .summary-content")
          .perfectScrollbar("destroy")
          .perfectScrollbar({ theme: "wpc" });
      }
    }
  }
}

function sgsbqcv_get_key(array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }

  return -1;
}

function sgsbqcv_thumbnails_zoom() {
  if (sgsbqcv_vars.thumbnails_effect === "zoom") {
    jQuery("#sgsbqcv-popup .thumbnails .images .thumbnail").each(function () {
      var $this = jQuery(this);
      var zoom_params = JSON.parse(sgsbqcv_vars.thumbnails_zoom_params);

      zoom_params.url = $this.find("img").attr("data-src");

      // destroy first
      $this.trigger("zoom.destroy");
      $this.zoom(zoom_params);
    });
  }
}

function sgsbqcv_thumbnails_slick() {
  if (jQuery("#sgsbqcv-popup .thumbnails .images .thumbnail").length > 1) {
    if (
      jQuery("#sgsbqcv-popup .thumbnails .images").hasClass("slick-initialized")
    ) {
      // unslick first
      jQuery("#sgsbqcv-popup .thumbnails .images").slick("unslick");
    }

    jQuery("#sgsbqcv-popup .thumbnails .images").slick(
      JSON.parse(sgsbqcv_vars.thumbnails_slick_params)
    );
  }
}

function sgsbqcv_related_slick() {
  if (jQuery(".sgsbqcv-related-products").hasClass("slick-initialized")) {
    // unslick first
    jQuery(".sgsbqcv-related-products").slick("unslick");
  }

  if (jQuery(".sgsbqcv-related-product").length > 1) {
    jQuery(".sgsbqcv-related-products").slick(
      JSON.parse(sgsbqcv_vars.related_slick_params)
    );
  }
}
