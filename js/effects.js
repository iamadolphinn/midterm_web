$(function () {
  
  $('.accordion-button').on('click', function () {
    const $button = $(this);
    const $panel = $('#' + $button.attr('aria-controls'));
    const isOpen = $button.attr('aria-expanded') === 'true';

    $('.accordion-button').not($button).addClass('collapsed').attr('aria-expanded', 'false');
    $('.accordion-collapse').not($panel).stop(true, true).slideUp(250);

    if (isOpen) {
      $button.addClass('collapsed').attr('aria-expanded', 'false');
      $panel.stop(true, true).slideUp(250);
    } else {
      $button.removeClass('collapsed').attr('aria-expanded', 'true');
      $panel.stop(true, true).slideDown(250);
    }
  });

  
  $('a[href^="#"]').on('click', function (event) {
    const hash = this.getAttribute('href');
    const $target = hash === '#' ? $() : $(hash);

    if (hash !== '#' && $target.length === 0) {
      return;
    }

    event.preventDefault();
    const top = hash === '#' ? 0 : $target.offset().top - $('.navbar').outerHeight();
    $('html, body').stop(true).animate({ scrollTop: top }, 500);
  });
});