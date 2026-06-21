(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.navbar').addClass('position-fixed bg-dark shadow-sm');
        } else {
            $('.navbar').removeClass('position-fixed bg-dark shadow-sm');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Newsletter modal
    $('#newsletterModal').on('show.bs.modal', function (event) {
        var trigger = $(event.relatedTarget);
        var images = (trigger.data('images') || '').split('|');
        var title = trigger.data('title') || 'Newsletter';
        var $body = $(this).find('.newsletter-modal-body');

        $('#newsletterModalLabel').text(title);
        $body.empty().removeClass('newsletter-modal-body--spread');

        if (images.length > 1) {
            $body.addClass('newsletter-modal-body--spread');
        }

        images.forEach(function (src) {
            if (src) {
                $body.append($('<img>', { src: src, alt: title }));
            }
        });
    });
    
})(jQuery);

