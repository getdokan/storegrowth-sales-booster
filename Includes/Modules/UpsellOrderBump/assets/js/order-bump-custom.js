function extraProducts(product_id, variation_id, check_status, offer_price) {
  var $ = jQuery;

  // Validate inputs
  if (!product_id) {
    console.error("Product ID is missing");
    return;
  }

  // Create a loading state
  var $checkbox = $("#test_" + product_id);
  var originalLabel = $checkbox.next("label").text();
  $checkbox.prop("disabled", true);
  $checkbox.next("label").text("Processing...");

  var passData = {
    offer_product_id: product_id,
    offer_variation_id: variation_id || 0, // Ensure valid value
    checked: check_status === "checked", // Convert to boolean
    bump_price: parseFloat(offer_price) || 0, // Ensure valid price
  };

  $.post(
    bump_save_url.ajax_url_for_front,
    {
      action: "upsell_offer_product_add_to_cart",
      data: passData,
      _ajax_nonce: bump_save_url.ajd_nonce,
    },
    function (data) {
      // Check if the response indicates success
      if (data && data.success) {
        location.reload();
      } else {
        // Revert checkbox state and show error
        $checkbox.prop("disabled", false);
        $checkbox.prop("checked", !passData.checked);
        $checkbox.next("label").text(originalLabel);
        console.error("Failed to update cart:", data);

        // Optionally show an error message to the user
        if (typeof wc_add_to_cart_params !== "undefined") {
          $(document.body).trigger("wc_fragments_refreshed");
        }
      }
    }
  ).fail(function (xhr, textStatus, errorThrown) {
    // Handle AJAX failure
    $checkbox.prop("disabled", false);
    $checkbox.prop("checked", !passData.checked);
    $checkbox.next("label").text(originalLabel);
    console.error("AJAX error:", textStatus, errorThrown);
  });
}
