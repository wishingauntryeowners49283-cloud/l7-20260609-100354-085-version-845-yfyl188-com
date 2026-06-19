function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function card(movie) {
  const search = [
    movie.title,
    movie.region,
    movie.type,
    movie.year,
    movie.genreRaw,
    movie.tagsRaw,
    movie.oneLine
  ].join(' ');

  return `
    <article class="movie-card" data-movie-card data-search="${escapeHtml(search)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}">
      <a href="movie/${escapeHtml(movie.id)}.html" aria-label="观看 ${escapeHtml(movie.title)}">
        <div class="poster-wrap">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}">
          <span class="badge">${escapeHtml(movie.type)}</span>
          <span class="poster-overlay">播放</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(movie.title)}</h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="card-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderSearch() {
  const movies = window.MOVIE_DATA || [];
  const query = getQuery();
  const input = document.querySelector('[data-search-page-input]');
  const grid = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');
  const summary = document.querySelector('[data-search-summary]');

  if (input) {
    input.value = query;
  }

  const terms = normalize(query).split(/\s+/).filter(Boolean);
  let results = movies;

  if (terms.length > 0) {
    results = movies.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genreRaw,
        movie.tagsRaw,
        movie.oneLine,
        movie.summary
      ].join(' '));
      return terms.every((term) => haystack.includes(term));
    });
  } else {
    results = movies.slice(0, 96);
  }

  if (title) {
    title.textContent = query ? `搜索：${query}` : '影片搜索';
  }

  if (summary) {
    summary.textContent = query ? `共找到 ${results.length} 部相关影片` : '输入片名、类型、地区、年份或标签，快速检索全站片库。';
  }

  if (grid) {
    grid.innerHTML = results.slice(0, 240).map(card).join('');
  }
}

document.addEventListener('DOMContentLoaded', renderSearch);
