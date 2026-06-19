(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var list = scope.parentElement.querySelector('[data-filter-list]');
    var textInput = scope.querySelector('[data-filter-text]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function matches(card) {
      var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (type && card.getAttribute('data-type') !== type) {
        return false;
      }

      if (year && card.getAttribute('data-year') !== year) {
        return false;
      }

      return true;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.hidden = !matches(card);
      });
    }

    [textInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
