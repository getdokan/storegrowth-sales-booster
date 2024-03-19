"use strict";

var sgsbqcv_ids = [],
  sgsbqcv_products = [];

function isMobileDevice() {
  return window.matchMedia("(max-width: 767px)").matches;
}

(function ($) {
  $(function () {
    if (isMobileDevice() && !sgsbqcv_vars.enable_in_mobile) {
      $(".sgsbqcv-btn").each(function () {
        $(this).remove();
      });
    }
  });
  $(function () {
    $(".sgsbqcv-btn, .sgsbqcv-link").each(function () {
      var id = $(this).attr("data-id");
      var pid = $(this).attr("data-pid");
      var product_id = $(this).attr("data-product_id");
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

  $(document).on("click touch", '[href*="#sgsbqcv-"]', function (e) {
    var $this = $(this);
    var href = $this.attr("href");
    var reg = /#sgsbqcv-([0-9]+)/g;
    var match = reg.exec(href);

    if (match[1] !== undefined) {
      var id = match[1];
      var effect = $this.attr("data-effect");
      var context = $this.attr("data-context");
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

  $(document).on("sgsbqcv_loaded", function () {
    var form_variation = $("#sgsbqcv-popup").find(".variations_form");

    form_variation.each(function () {
      $(this).wc_variation_form();
    });

    sgsbqcv_init_content("loaded");

    // add redirect
    if (!$("#sgsbqcv-popup .sgsbqcv-redirect").length) {
      if (
        sgsbqcv_vars.cart_redirect !== "shop-page-redirection" &&
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
    } else {
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
        showCloseBtn: sgsbqcv_vars?.enable_close_button,
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

function isFunctionDefined(func) {
  return typeof func === "function";
}

function isFunctionDefined(func) {
  return typeof func === "function";
}

function callIfDefined(func) {
  if (isFunctionDefined(func)) {
    try {
      func();
    } catch (error) {
      return;
    }
  }
}

function sgsbqcv_init_content(context) {
  if (context === "loaded") {
    // Call other methods even if they may not be defined initially

    sgsbqcv_thumbnails_zoom();
    sgsbqcv_thumbnails_slick();
    sgsbqcv_related_slick();

    if (sgsbqcv_vars.cart_redirect === "add-to-cart-ajax") {
      if (typeof sgsbqcv_add_to_cart_ajax_handler === "function") {
        callIfDefined(sgsbqcv_add_to_cart_ajax_handler);
      }
    }

    if (typeof sgsbDirectChecoutQuick !== "undefined") {
      sgsbDirectChecoutQuick.init();
    }
    if (typeof sgsb_countdown_timer_methods === "function") {
      callIfDefined(sgsb_countdown_timer_methods);
    }

    if (typeof sgsb_stockbar_jqmeter === "function") {
      callIfDefined(sgsb_stockbar_jqmeter);
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
  if (sgsbqcv_vars.thumbnails_effect) {
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
