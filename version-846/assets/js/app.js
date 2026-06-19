(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    qsa('[data-filter-scope]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = qs('[data-filter-input]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var grid = qs('[data-filter-grid]', scope);
      var empty = qs('[data-filter-empty]', panel);
      if (!grid) {
        return;
      }
      var cards = qsa('[data-card]', grid);

      function matchYear(value, selected) {
        if (!selected) {
          return true;
        }
        var yearNumber = parseInt(value, 10);
        if (selected === '2010') {
          return yearNumber && yearNumber < 2010;
        }
        return value.indexOf(selected) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedType = type ? type.value.trim() : '';
        var selectedYear = year ? year.value.trim() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (selectedType && cardType.indexOf(selectedType) === -1) {
            ok = false;
          }
          if (!matchYear(cardYear, selectedYear)) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function searchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var background = "background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.68)), url('" + escapeHtml(movie.cover) + "');";
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '">',
      '<div class="poster" style="' + background + '">',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-mark">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<div class="card-foot"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.categoryName) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');
    if (!page || !window.MOVIES_DATA) {
      return;
    }
    var input = qs('#searchInput', page);
    var category = qs('#categoryFilter', page);
    var type = qs('#typeFilter', page);
    var year = qs('#yearFilter', page);
    var results = qs('#searchResults', page);
    var empty = qs('#searchEmpty', page);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function matchYear(value, selected) {
      if (!selected) {
        return true;
      }
      var yearNumber = parseInt(value, 10);
      if (selected === '2010') {
        return yearNumber && yearNumber < 2010;
      }
      return value.indexOf(selected) !== -1;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var filtered = window.MOVIES_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' '),
          movie.categoryName
        ].join(' ').toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (selectedCategory && movie.categoryId !== selectedCategory) {
          return false;
        }
        if (selectedType && String(movie.type || '').indexOf(selectedType) === -1) {
          return false;
        }
        if (!matchYear(String(movie.year || ''), selectedYear)) {
          return false;
        }
        return true;
      });
      results.innerHTML = filtered.map(searchCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', filtered.length === 0);
      }
    }

    [input, category, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', render);
        field.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
