import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupMobileNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.setAttribute('aria-pressed', String(dotIndex === current));
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupGridFilter() {
  const filter = document.querySelector('[data-grid-filter]');

  if (!filter) {
    return;
  }

  const input = filter.querySelector('[data-filter-text]');
  const year = filter.querySelector('[data-filter-year]');
  const region = filter.querySelector('[data-filter-region]');
  const type = filter.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const empty = document.querySelector('[data-filter-empty]');
  const count = document.querySelector('[data-filter-count]');

  function valueOf(element) {
    return element ? String(element.value || '').trim().toLowerCase() : '';
  }

  function apply() {
    const query = valueOf(input);
    const selectedYear = valueOf(year);
    const selectedRegion = valueOf(region);
    const selectedType = valueOf(type);
    let visible = 0;

    cards.forEach((card) => {
      const text = String(card.dataset.search || '').toLowerCase();
      const cardYear = String(card.dataset.year || '').toLowerCase();
      const cardRegion = String(card.dataset.region || '').toLowerCase();
      const cardType = String(card.dataset.type || '').toLowerCase();
      const matchQuery = !query || text.includes(query);
      const matchYear = !selectedYear || cardYear === selectedYear;
      const matchRegion = !selectedRegion || cardRegion.includes(selectedRegion);
      const matchType = !selectedType || cardType.includes(selectedType);
      const shouldShow = matchQuery && matchYear && matchRegion && matchType;
      card.classList.toggle('hidden-by-filter', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible === 0 ? 'block' : 'none';
    }

    if (count) {
      count.textContent = String(visible);
    }
  }

  [input, year, region, type].filter(Boolean).forEach((element) => {
    element.addEventListener('input', apply);
    element.addEventListener('change', apply);
  });

  apply();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const source = player.dataset.src;
    let attached = false;

    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player._hls = hls;
      } else {
        video.src = source;
      }

      attached = true;
    }

    function play() {
      attachSource();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (!attached) {
        play();
      }
    });
  });
}

ready(() => {
  setupMobileNavigation();
  setupHeroCarousel();
  setupGridFilter();
  setupPlayers();
});
