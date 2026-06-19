(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dotsWrap = carousel.querySelector('[data-hero-dots]');
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, idx) {
                    dot.classList.toggle('is-active', idx === current);
                });
            }
        }

        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        if (slides.length > 1 && dotsWrap) {
            slides.forEach(function (_, idx) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换焦点影片');
                dot.addEventListener('click', function () {
                    activate(idx);
                    start();
                });
                dotsWrap.appendChild(dot);
            });
            activate(0);
            start();
            carousel.addEventListener('mouseenter', function () {
                if (timer) {
                    clearInterval(timer);
                }
            });
            carousel.addEventListener('mouseleave', start);
        }
    });

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
        var input = box.querySelector('[data-filter-input]');
        var clearButton = box.querySelector('[data-filter-clear]');
        var scope = document.querySelector('[data-filter-scope]');
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.children);

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', applyFilter);
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                applyFilter();
                input.focus();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
            applyFilter();
        }
    });

    var hlsLoader = null;

    function loadHls(done) {
        if (window.Hls) {
            done();
            return;
        }
        if (!hlsLoader) {
            hlsLoader = document.createElement('script');
            hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            hlsLoader.async = true;
            document.head.appendChild(hlsLoader);
        }
        hlsLoader.addEventListener('load', done, { once: true });
        hlsLoader.addEventListener('error', done, { once: true });
    }

    function tryPlay(video) {
        if (!video) {
            return;
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    function attachStream(video, stream, done) {
        if (!video || !stream) {
            return;
        }
        if (video.dataset.ready === '1') {
            done();
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            done();
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    done();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    done();
                });
                video._hls = hls;
            } else {
                video.src = stream;
                done();
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var source = video ? video.querySelector('source') : null;
        var stream = source ? source.getAttribute('src') : '';
        var mask = shell.querySelector('.play-mask');

        function play() {
            shell.classList.add('is-playing');
            attachStream(video, stream, function () {
                tryPlay(video);
            });
        }

        if (mask) {
            mask.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                attachStream(video, stream, function () {});
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });
    });
})();
