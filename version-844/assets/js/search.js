(function () {
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var hot = document.querySelector('[data-search-hot]');
  var index = window.MovieSearchIndex || [];

  if (input) {
    input.value = initial;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function card(movie) {
    return '<article class="movie-card">' +
      '<a class="poster" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '在线观看" loading="lazy" width="360" height="520">' +
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function search(query) {
    var q = String(query || '').trim().toLowerCase();

    if (!q) {
      if (results) {
        results.innerHTML = '';
      }
      if (summary) {
        summary.textContent = '输入关键词后查看匹配影片。';
      }
      if (hot) {
        hot.hidden = false;
      }
      return;
    }

    var words = q.split(/\s+/).filter(Boolean);
    var matched = index.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (results) {
      results.innerHTML = matched.map(card).join('');
    }

    if (summary) {
      summary.textContent = matched.length ? '已找到相关影片，点击卡片进入详情页。' : '未找到匹配影片，可以尝试更换关键词。';
    }

    if (hot) {
      hot.hidden = Boolean(matched.length);
    }
  }

  if (input) {
    input.addEventListener('input', function () {
      search(input.value);
    });
  }

  search(initial);
})();
