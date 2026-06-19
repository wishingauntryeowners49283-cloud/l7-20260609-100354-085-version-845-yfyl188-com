import { H as Hls } from "./hls-vendor-dru42stk.js";

const body = document.body;

function setupHeader() {
  const toggle = document.querySelector("[data-menu-toggle]");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    body.classList.toggle("menu-open");
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => body.classList.remove("menu-open"));
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  const show = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(activeIndex - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(activeIndex + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupPlayer() {
  const video = document.querySelector("#movie-player");
  const playButton = document.querySelector("[data-play-button]");

  if (!video || !playButton) {
    return;
  }

  const src = video.dataset.src;
  let hlsInstance = null;
  let isReady = false;

  const loadPlayer = () => {
    if (!src || isReady) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      isReady = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    playButton.querySelector("strong").textContent = "当前浏览器不支持 HLS";
  };

  const play = async () => {
    loadPlayer();
    playButton.classList.add("is-hidden");
    try {
      await video.play();
    } catch (error) {
      playButton.classList.remove("is-hidden");
      playButton.querySelector("strong").textContent = "点击继续播放";
    }
  };

  playButton.addEventListener("click", play);
  video.addEventListener("play", () => playButton.classList.add("is-hidden"));
  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) {
      playButton.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function setupListFilters() {
  const root = document.querySelector("[data-filter-root]");
  const list = document.querySelector("[data-card-list]");

  if (!root || !list) {
    return;
  }

  const input = root.querySelector("[data-filter-input]");
  const year = root.querySelector("[data-filter-year]");
  const type = root.querySelector("[data-filter-type]");
  const region = root.querySelector("[data-filter-region]");
  const count = root.querySelector("[data-filter-count]");
  const cards = Array.from(list.querySelectorAll("[data-card]"));

  const apply = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const selectedYear = year?.value || "";
    const selectedType = type?.value || "";
    const selectedRegion = region?.value || "";
    let visible = 0;

    cards.forEach((card) => {
      const matchesKeyword = !keyword || card.dataset.search.includes(keyword);
      const matchesYear = !selectedYear || card.dataset.year === selectedYear;
      const matchesType = !selectedType || card.dataset.type === selectedType;
      const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
      const shouldShow = matchesKeyword && matchesYear && matchesType && matchesRegion;

      card.classList.toggle("is-filtered-out", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  };

  [input, year, type, region].forEach((element) => {
    if (!element) {
      return;
    }

    element.addEventListener("input", apply);
    element.addEventListener("change", apply);
  });

  apply();
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

function movieCardTemplate(movie) {
  const tags = movie.tags
    .slice(0, 3)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="movie-card" data-card>
      <a class="poster-link" href="${movie.url}" aria-label="查看${escapeHtml(movie.title)}详情">
        <img class="poster-img" src="${movie.cover}" alt="${escapeHtml(movie.title)}封面" loading="lazy" data-cover onerror="this.classList.add('cover-missing')">
        <span class="poster-play">▶</span>
        <span class="score-badge">热度 ${movie.hotScore.toFixed(1)}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-row">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="card-tags">
          <span class="tag tag-primary">${escapeHtml(movie.category)}</span>
          ${tags}
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupSearchPage() {
  const page = document.querySelector("[data-search-page]");

  if (!page || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const input = page.querySelector("[data-search-input]");
  const type = page.querySelector("[data-search-type]");
  const year = page.querySelector("[data-search-year]");
  const region = page.querySelector("[data-search-region]");
  const count = page.querySelector("[data-search-count]");
  const results = page.querySelector("[data-search-results]");
  const data = window.MOVIE_SEARCH_DATA;
  const params = new URLSearchParams(window.location.search);

  const types = [...new Set(data.map((movie) => movie.type).filter(Boolean))].sort();
  const years = [...new Set(data.map((movie) => movie.year).filter(Boolean))].sort().reverse();
  const regions = [...new Set(data.map((movie) => movie.region).filter(Boolean))].sort();

  types.forEach((value) => type.appendChild(createOption(value)));
  years.slice(0, 40).forEach((value) => year.appendChild(createOption(value)));
  regions.slice(0, 60).forEach((value) => region.appendChild(createOption(value)));

  input.value = params.get("q") || "";
  type.value = params.get("type") || "";
  year.value = params.get("year") || "";
  region.value = params.get("region") || "";

  const apply = () => {
    const keyword = input.value.trim().toLowerCase();
    const selectedType = type.value;
    const selectedYear = year.value;
    const selectedRegion = region.value;

    const matched = data
      .filter((movie) => {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(" "),
          movie.oneLine,
        ].join(" ").toLowerCase();

        return (
          (!keyword || haystack.includes(keyword)) &&
          (!selectedType || movie.type === selectedType) &&
          (!selectedYear || movie.year === selectedYear) &&
          (!selectedRegion || movie.region === selectedRegion)
        );
      })
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 240);

    results.innerHTML = matched.map(movieCardTemplate).join("");
    count.textContent = String(matched.length);
  };

  [input, type, year, region].forEach((element) => {
    element.addEventListener("input", apply);
    element.addEventListener("change", apply);
  });

  apply();
}

setupHeader();
setupHero();
setupPlayer();
setupListFilters();
setupSearchPage();
