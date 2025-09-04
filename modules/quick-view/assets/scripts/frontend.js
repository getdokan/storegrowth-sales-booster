"use strict";

var spsgqcv_ids = [],
  spsgqcv_products = [];

function isMobileDevice() {
  return window.matchMedia("(max-width: 767px)").matches;
}

(function ($) {
  $(function () {
    if (isMobileDevice() && !spsgqcv_vars.enable_in_mobile) {
      $(".spsgqcv-btn").each(function () {
        $(this).remove();
      });
    }
  });
  $(function () {
    $(".spsgqcv-btn, .spsgqcv-link").each(function () {
      var id = $(this).attr("data-id");
      var pid = $(this).attr("data-pid");
      var product_id = $(this).attr("data-product_id");
      if (typeof pid !== typeof undefined && pid !== false) {
        id = pid;
      }

      if (typeof product_id !== typeof undefined && product_id !== false) {
        id = product_id;
      }

      if (-1 === $.inArray(id, spsgqcv_ids)) {
        spsgqcv_ids.push(id);
        spsgqcv_products.push({
          src: spsgqcv_vars.ajax_url + "?product_id=" + id,
        });
      }
    });
    // quick view
    if (spsgqcv_vars.quick_view > 0) {
      setTimeout(function () {
        spsgqcv_open(spsgqcv_vars.quick_view);
      }, 1000);
    }
  });

  $(document).on("click touch", '[href*="#spsgqcv-"]', function (e) {
    var $this = $(this);
    var href = $this.attr("href");
    var reg = /#spsgqcv-([0-9]+)/g;
    var match = reg.exec(href);

    if (match[1] !== undefined) {
      var id = match[1];
      var effect = $this.attr("data-effect");
      var context = $this.attr("data-context");
      spsgqcv_open(id, effect, context);
      e.preventDefault();
    }
  });

  $(document).on("click touch", ".spsgqcv-btn, .spsgqcv-link", function (e) {
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

    spsgqcv_open(id, effect, context);
  });

  $(document).on("spsgqcv_loaded", function () {
    var form_variation = $("#spsgqcv-popup").find(".variations_form");

    form_variation.each(function () {
      $(this).wc_variation_form();
    });

    spsgqcv_init_content("loaded");

    // add redirect
    if (!$("#spsgqcv-popup .spsgqcv-redirect").length) {
      if (
        spsgqcv_vars.cart_redirect !== "shop-page-redirection" &&
        spsgqcv_vars.cart_url !== ""
      ) {
        $("#spsgqcv-popup form").prepend(
          '<input class="spsgqcv-redirect" name="spsgqcv-redirect" type="hidden" value="' +
            spsgqcv_vars.cart_url +
            '"/>'
        );
      } else {
        $("#spsgqcv-popup form").prepend(
          '<input class="spsgqcv-redirect" name="spsgqcv-redirect" type="hidden" value="' +
            window.location.href +
            '"/>'
        );
      }
    }
  });

  $(window).on("resize", function () {
    spsgqcv_init_content("resize");
  });

  $(document).on("found_variation", function (e, t) {
    if (
      !$(e["target"]).closest(".woosb-product").length &&
      !$(e["target"]).closest(".woosg-product").length &&
      !$(e["target"]).closest(".woobt-product").length &&
      !$(e["target"]).closest(".woofs-product").length &&
      $(e["target"]).closest("#spsgqcv-popup").length
    ) {
      if (t["image_id"] !== undefined) {
        if ($("#spsgqcv-popup .thumbnails .thumbnail").length > 1) {
          var $thumb = $(
            '.thumbnail:not(.slick-cloned)[data-id="' + t["image_id"] + '"]'
          );

          if ($thumb.length) {
            var pos = $("#spsgqcv-popup .thumbnails .thumbnail").index($thumb);
            var $images = $("#spsgqcv-popup .thumbnails .images");

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
    if ($(e["target"]).closest("#spsgqcv-popup").length) {
      if (
        $("#spsgqcv-popup .thumbnails .thumbnail").length > 1 &&
        $("#spsgqcv-popup .thumbnails .images").hasClass("slick-initialized")
      ) {
        $("#spsgqcv-popup .thumbnails .images").slick("slickGoTo", 0);
      }
    }
  });

  if (spsgqcv_vars.hashchange === "yes") {
    $(window).on("hashchange", function () {
      if (location.href.indexOf("#spsgqcv") < 0) {
        if (spsgqcv_vars.view === "popup") {
          $.magnificPopup.close();
        }

        spsgqcv_close();
      }
    });
  }

  $(document).on(
    "click touch",
    ".spsgqcv-overlay, .spsgqcv-close",
    function () {
      spsgqcv_close();
    }
  );
})(jQuery);

function spsgqcv_open(id, effect, context) {
  jQuery("body").addClass("spsgqcv-open");

  if (spsgqcv_vars.view === "sidebar") {
    // sidebar
    spsgqcv_loading();

    var data = {
      action: "spsgqcv_quickview",
      product_id: id,
      nonce: spsgqcv_vars.nonce,
    };

    jQuery.post(spsgqcv_vars.ajax_url, data, function (response) {
      jQuery(".spsgqcv-sidebar").html(response);
      spsgqcv_loaded();
      jQuery(document.body).trigger("spsgqcv_loaded", [id]);
    });
  } else {
    // popup
    if (-1 === jQuery.inArray(id, spsgqcv_ids)) {
      spsgqcv_ids.push(id);
      spsgqcv_products.push({
        src: spsgqcv_vars.ajax_url + "?product_id=" + id,
      });
    }

    var index = spsgqcv_get_key(
      spsgqcv_products,
      "src",
      spsgqcv_vars.ajax_url + "?product_id=" + id
    );
    var main_class = "mfp-spsgqcv";

    if (typeof context !== typeof undefined && context !== false) {
      main_class = main_class + " mfp-spsgqcv-" + context;
    }

    if (typeof effect !== typeof undefined && effect !== false) {
      main_class = main_class + " " + effect;
    } else {
      main_class = main_class + " " + spsgqcv_vars.effect;
    }

    jQuery.magnificPopup.open(
      {
        items: spsgqcv_products,
        type: "ajax",
        mainClass: main_class,
        removalDelay: 160,
        overflowY: "scroll",
        fixedContentPos: true,
        tClose: spsgqcv_vars.close,
        showCloseBtn: spsgqcv_vars?.enable_close_button,
        gallery: {
          tPrev: spsgqcv_vars.prev,
          tNext: spsgqcv_vars.next,
          enabled: spsgqcv_vars.next_prev === "yes",
        },
        ajax: {
          settings: {
            type: "GET",
            data: {
              action: "spsgqcv_quickview",
              nonce: spsgqcv_vars.nonce,
            },
          },
        },
        callbacks: {
          open: function () {
            if (spsgqcv_vars.hashchange === "yes") {
              location.href = location.href.split("#")[0] + "#spsgqcv";
            }
          },
          ajaxContentAdded: function () {
            jQuery(document.body).trigger("spsgqcv_loaded", [id]);
          },
          close: function () {
            if (spsgqcv_vars.hashchange === "yes") {
              if (location.hash) history.go(-1);
            }
          },
          afterClose: function () {
            jQuery(document.body).trigger("spsgqcv_close", [id]);
          },
        },
      },
      index
    );
  }

  jQuery(document.body).trigger("spsgqcv_open", [id]);
}

function spsgqcv_close() {
  jQuery("body").removeClass("spsgqcv-open");
  jQuery(document.body).trigger("spsgqcv_close");
}

function spsgqcv_loading() {
  jQuery(".spsgqcv-sidebar").addClass("spsgqcv-loading");
}

function spsgqcv_loaded() {
  jQuery(".spsgqcv-sidebar").removeClass("spsgqcv-loading");
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

function spsgqcv_init_content(context) {
  if (context === "loaded") {
    // Call other methods even if they may not be defined initially

    spsgqcv_thumbnails_zoom();
    spsgqcv_thumbnails_slick();
    spsgqcv_related_slick();

    if (spsgqcv_vars.cart_redirect === "add-to-cart-ajax") {
      if (typeof spsgqcv_add_to_cart_ajax_handler === "function") {
        callIfDefined(spsgqcv_add_to_cart_ajax_handler);
      }
    }

    if (typeof spsgDirectChecoutQuick !== "undefined") {
      spsgDirectChecoutQuick.init();
    }
    if (typeof spsg_countdown_timer_methods === "function") {
      callIfDefined(spsg_countdown_timer_methods);
    }

    if (typeof spsg_stockbar_jqmeter === "function") {
      callIfDefined(spsg_stockbar_jqmeter);
    }
  }
}

function spsgqcv_get_key(array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }

  return -1;
}

function spsgqcv_thumbnails_zoom() {
  if (spsgqcv_vars.thumbnails_effect) {
    jQuery("#spsgqcv-popup .thumbnails .images .thumbnail").each(function () {
      var $this = jQuery(this);
      var zoom_params = JSON.parse(spsgqcv_vars.thumbnails_zoom_params);

      zoom_params.url = $this.find("img").attr("data-src");

      // destroy first
      $this.trigger("zoom.destroy");
      $this.zoom(zoom_params);
    });
  }
}

function spsgqcv_thumbnails_slick() {
  if (jQuery("#spsgqcv-popup .thumbnails .images .thumbnail").length > 1) {
    if (
      jQuery("#spsgqcv-popup .thumbnails .images").hasClass("slick-initialized")
    ) {
      // unslick first
      jQuery("#spsgqcv-popup .thumbnails .images").slick("unslick");
    }

    jQuery("#spsgqcv-popup .thumbnails .images").slick(
      JSON.parse(spsgqcv_vars.thumbnails_slick_params)
    );
  }
}

function spsgqcv_related_slick() {
  if (jQuery(".spsgqcv-related-products").hasClass("slick-initialized")) {
    // unslick first
    jQuery(".spsgqcv-related-products").slick("unslick");
  }

  if (jQuery(".spsgqcv-related-product").length > 1) {
    jQuery(".spsgqcv-related-products").slick(
      JSON.parse(spsgqcv_vars.related_slick_params)
    );
  }
}
