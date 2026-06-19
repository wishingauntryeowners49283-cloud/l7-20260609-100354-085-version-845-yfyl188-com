(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });

    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var filters = { type: "", year: "" };

      function applyFilters() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var type = normalize(card.getAttribute("data-type"));
          var year = normalize(card.getAttribute("data-year"));
          var ok = true;
          if (query && text.indexOf(query) === -1) ok = false;
          if (filters.type && type !== normalize(filters.type)) ok = false;
          if (filters.year && year !== normalize(filters.year)) ok = false;
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle("show", visible === 0);
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      scope.querySelectorAll("[data-filter-field]").forEach(function (button) {
        button.addEventListener("click", function () {
          var field = button.getAttribute("data-filter-field");
          var value = button.getAttribute("data-filter-value") || "";
          filters[field] = value;
          scope.querySelectorAll('[data-filter-field="' + field + '"]').forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          applyFilters();
        });
      });
    });

    var searchInput = document.querySelector("[data-search-page-input]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchTitle = document.querySelector("[data-search-title]");
    var searchHint = document.querySelector("[data-search-hint]");
    var searchEmpty = document.querySelector("[data-search-empty]");
    if (searchInput && searchResults && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function card(movie) {
        var tags = movie.tags.slice(0, 4).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return '<article class="movie-card" data-search="' + escapeHtml(movie.search) + '">' +
          '<a href="./' + movie.file + '" class="poster-link" aria-label="' + escapeHtml(movie.title) + '">' +
          '<span class="poster-frame"><img src="' + movie.cover + '" alt="" loading="lazy"></span></a>' +
          '<div class="movie-card-body"><div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '<h2><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-list">' + tags + '</div></div></article>';
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
          }[char];
        });
      }

      function renderSearch() {
        var query = normalize(searchInput.value);
        if (!query) {
          if (searchTitle) searchTitle.textContent = "推荐影片";
          if (searchHint) searchHint.textContent = "可通过搜索框查找更多片名、类型、地区与年份";
          if (searchEmpty) searchEmpty.classList.remove("show");
          return;
        }
        var results = window.SEARCH_MOVIES.filter(function (movie) {
          return normalize(movie.search).indexOf(query) !== -1;
        }).slice(0, 120);
        searchResults.innerHTML = results.map(card).join("");
        searchResults.querySelectorAll("img").forEach(function (img) {
          img.addEventListener("error", function () {
            img.classList.add("image-hidden");
          });
        });
        if (searchTitle) searchTitle.textContent = "搜索结果";
        if (searchHint) searchHint.textContent = "点击片名进入详情页观看";
        if (searchEmpty) searchEmpty.classList.toggle("show", results.length === 0);
      }

      searchInput.addEventListener("input", renderSearch);
      var form = document.querySelector("[data-search-page-form]");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var query = searchInput.value.trim();
          history.replaceState(null, "", query ? "?q=" + encodeURIComponent(query) : location.pathname);
          renderSearch();
        });
      }
      renderSearch();
    }
  });
})();
