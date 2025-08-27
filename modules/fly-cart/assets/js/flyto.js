/*!
 * jQuery lightweight Fly to
 * Author: @ElmahdiMahmoud
 * Licensed under the MIT license
 */

// self-invoking
;(function ($, window, document, undefined) {
    $.fn.flyto = function ( options ) {

    // Establish default settings

        var settings = $.extend({
            item      : '.flyto-item',
            target    : '.flyto-target',
            button    : '.flyto-btn',
            shake     : true
            }, options);


        return this.each(function () {
            var
                $this    = $(this),
                flybtn   = $this.find(settings.button),
                target   = $(settings.target),
                itemList = $this.find(settings.item);

        flybtn.on('click', function () {


            var iconwidth = $('.wfc-cart-icon span');
            var _this = $(this),
                eltoDrag = _this.parents('li.product').find("img").eq(0);
            if (eltoDrag) {
                var imgclone = eltoDrag
                    .clone()
                    .offset({
                    top: eltoDrag.offset().top,
                    left: eltoDrag.offset().left
                })
                .css({
                    'opacity': '0.5',
                    'position': 'absolute',
                    'height': eltoDrag.height(),
                    'width': eltoDrag.width(),
                    'z-index': '999'
            })
                .appendTo($('body'))
                .animate({
                    'top': target.offset().top - 130,
                    'left': target.offset().left + iconwidth.width() /3 - 5,
                    'margin-top': 50,
                    'height': 30,
                    'width': 30
            }, 1000)
            .animate({
                    'top': target.offset().top - 50,
                    'opacity': '0'
            }, 1200, 'easeInOutExpo');

            if (settings.shake) {
                setTimeout(function () {
                    target.effect("shake", {
                        times: 2
                    }, 200);
                }, 1800);
            }


            imgclone.animate({
                'width': 0,
                'height': 0
            }, function () {
                $(this).detach()
            });
        }
        });

        });
    }
})(jQuery, window, document);
