(function () {
  function getBasePath() {
    var parts = window.location.pathname.split('/');
    var filename = parts[parts.length - 1] || 'index.html';
    return filename.indexOf('movie-') === 0 ? '../' : '';
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      }, { once: true });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = panel.hasAttribute('hidden');
      if (opened) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function initSearchForms() {
    document.querySelectorAll('.site-search, .search-page-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var action = form.getAttribute('action') || (getBasePath() + 'search.html');
        if (query) {
          window.location.href = action + '?q=' + encodeURIComponent(query);
        } else {
          window.location.href = action;
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initSortAndView() {
    document.querySelectorAll('[data-sortable]').forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var select = section.querySelector('.sort-select');
      var buttons = section.querySelectorAll('.view-toggle');
      var original = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function sortCards(value) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        if (value === 'default') {
          cards = original.slice();
        } else {
          cards.sort(function (a, b) {
            var aValue = Number(a.getAttribute('data-' + value)) || 0;
            var bValue = Number(b.getAttribute('data-' + value)) || 0;
            return bValue - aValue;
          });
        }
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (select) {
        select.addEventListener('change', function () {
          sortCards(select.value);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          grid.classList.toggle('list-view', button.getAttribute('data-view') === 'list');
        });
      });
    });
  }

  function initPlayer() {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.watch-video');
      var cover = shell.querySelector('.play-cover');
      var message = shell.querySelector('.player-message');
      var url = shell.getAttribute('data-play-url');
      var initialized = false;
      var hls = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = false;
      }

      function hideCover() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      function load() {
        if (initialized || !video || !url) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请稍后重试');
            }
          });
          return;
        }
        showMessage('当前浏览器无法播放此视频');
      }

      function play() {
        load();
        hideCover();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showMessage('点击视频控件继续播放');
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', hideCover);
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="card-link">',
      '    <span class="poster-frame">',
      '      <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-label">' + escapeHtml(movie.type) + '</span>',
      '    </span>',
      '    <span class="card-body">',
      '      <strong>' + escapeHtml(movie.title) + '</strong>',
      '      <em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</em>',
      '      <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
      '      <span class="card-meta"><span>' + formatNumber(movie.views) + '观看</span><span>' + formatNumber(movie.likes) + '点赞</span></span>',
      '      <span class="card-tags">' + tags + '</span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function formatNumber(value) {
    var number = Number(value) || 0;
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + '万';
    }
    return String(number);
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var form = document.querySelector('.search-page-form');
    if (!results || !summary || typeof MovieSearchIndex === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = form ? form.querySelector('input[name="q"]') : null;
    if (input) {
      input.value = query;
    }

    function runSearch(text) {
      var keyword = text.trim().toLowerCase();
      if (!keyword) {
        summary.textContent = '热门标签';
        results.innerHTML = '';
        return;
      }
      var matches = MovieSearchIndex.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 80);
      summary.textContent = matches.length ? '找到 ' + matches.length + ' 个相关结果' : '未找到相关结果';
      results.innerHTML = matches.map(createResultCard).join('');
      initImages();
    }

    document.querySelectorAll('[data-search-tag]').forEach(function (button) {
      button.addEventListener('click', function () {
        var tag = button.getAttribute('data-search-tag') || '';
        window.location.href = 'search.html?q=' + encodeURIComponent(tag);
      });
    });

    runSearch(query);
  }

  ready(function () {
    initImages();
    initMobileMenu();
    initSearchForms();
    initHero();
    initSortAndView();
    initPlayer();
    initSearchPage();
  });
}());
