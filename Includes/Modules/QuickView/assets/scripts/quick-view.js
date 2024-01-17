"use strict";

jQuery(document).ready(function ($) {
  $(".sgsb_quick_view_button").on("click", function (event) {
    event.preventDefault();
    // Your additional JavaScript code for handling the click event goes here
    var productId = $(this).data("id");
    console.log("Quick View button clicked for product ID: " + productId);
    // Add your Quick View functionality here

    // AJAX request to load modal template
    $.ajax({
      url: ajax_object.ajax_url,
      type: "post",
      data: {
        action: "load_modal_template",
      },
      success: function (template) {
        // Append the loaded template to the body
        console.log(template);
        $("body").append(template);

        // Open Bootstrap modal and insert the loaded template
        $("#quickViewModal .modal-content").html(template);

        // AJAX request to fetch product data
        $.ajax({
          url: ajax_object.ajax_url,
          type: "post",
          data: {
            action: "get_product_data",
            product_id: productId,
          },
          success: function (productData) {
            // Parse the JSON response
            var data = JSON.parse(productData);

            // Insert product data into the modal body
            $("#quickViewModal .modal-body .content-placeholder").html(
              "<p>Name: " +
                data.name +
                "</p>" +
                "<p>Price: " +
                data.price +
                "</p>"
              // Add more data fields as needed
            );

            $("#quickViewModal").modal("show");
          },
          error: function (error) {
            console.log(error);
          },
        });
      },
      error: function (error) {
        console.log(error);
      },
    });
  });
});
