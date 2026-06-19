(function () {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('scrolled', window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  const filterTabs = document.querySelectorAll('[data-filter-group]');
  const filterCards = document.querySelectorAll('[data-region]');

  filterTabs.forEach(function (button) {
    button.addEventListener('click', function () {
      const group = button.getAttribute('data-filter-group');
      filterTabs.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards.forEach(function (card) {
        const matched = group === '全部' || card.getAttribute('data-region') === group;
        card.style.display = matched ? '' : 'none';
      });
    });
  });

  const heroInput = document.querySelector('#heroSearchInput');
  const heroButton = document.querySelector('#heroSearchButton');
  if (heroInput && heroButton) {
    function goSearch() {
      const value = heroInput.value.trim();
      const query = value ? '?q=' + encodeURIComponent(value) : '';
      window.location.href = 'search.html' + query;
    }
    heroButton.addEventListener('click', goSearch);
    heroInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        goSearch();
      }
    });
  }

  const searchInput = document.querySelector('#searchInput');
  const searchResults = document.querySelector('#searchResults');
  const searchButton = document.querySelector('#searchButton');

  function renderSearch() {
    if (!searchInput || !searchResults || typeof searchItems === 'undefined') {
      return;
    }
    const keyword = searchInput.value.trim().toLowerCase();
    const source = Array.isArray(searchItems) ? searchItems : [];
    const matched = keyword
      ? source.filter(function (item) {
          return (item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).toLowerCase().includes(keyword);
        }).slice(0, 60)
      : source.slice(0, 24);

    searchResults.innerHTML = matched.map(function (item) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-mark">▶</span>',
        '<span class="movie-type">' + escapeHtml(item.type) + '</span>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.line) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }

  if (searchInput && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');
    if (preset) {
      searchInput.value = preset;
    }
    renderSearch();
    searchInput.addEventListener('input', renderSearch);
    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-overlay');
    const message = shell.parentElement.querySelector('.player-message');
    let loaded = false;
    let hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      const source = video.getAttribute('data-stream');
      if (!source) {
        showMessage('播放加载失败，请稍后重试');
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          showMessage('');
          video.play().catch(function () {});
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放加载失败，请稍后重试');
          }
        });
        return;
      }
      showMessage('播放加载失败，请稍后重试');
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
