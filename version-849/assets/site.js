(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        var header = document.querySelector("[data-header]");
        var menuButton = document.querySelector("[data-menu-button]");

        function updateHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 18) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (menuButton && header) {
            menuButton.addEventListener("click", function () {
                header.classList.toggle("menu-active");
                document.body.classList.toggle("menu-open", header.classList.contains("menu-active"));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var currentSlide = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentSlide);
                slide.setAttribute("aria-hidden", slideIndex === currentSlide ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
            });
        }

        function startSlides() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(currentSlide + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startSlides();
            });
        });
        showSlide(0);
        startSlides();

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
            var scope = document.querySelector(input.getAttribute("data-filter-scope")) || document;
            var empty = document.querySelector(input.getAttribute("data-filter-empty"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                var visibleCount = 0;
                Array.prototype.slice.call(scope.querySelectorAll(".movie-card")).forEach(function (card) {
                    var text = [card.getAttribute("data-title") || "", card.getAttribute("data-tags") || "", card.getAttribute("data-year") || "", card.getAttribute("data-region") || "", card.textContent || ""].join(" ").toLowerCase();
                    var visible = !query || text.indexOf(query) !== -1;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            });
        });

        var searchInput = document.querySelector("[data-global-search]");
        var searchResults = document.querySelector("[data-search-results]");
        if (searchInput && searchResults && typeof SITE_MOVIES !== "undefined") {
            var params = new URLSearchParams(window.location.search);
            if (params.get("q")) {
                searchInput.value = params.get("q");
            }
            var renderResults = function () {
                var query = searchInput.value.trim().toLowerCase();
                if (!query) {
                    searchResults.innerHTML = "";
                    return;
                }
                var result = SITE_MOVIES.filter(function (movie) {
                    var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
                    return text.indexOf(query) !== -1;
                }).slice(0, 80);
                if (!result.length) {
                    searchResults.innerHTML = '<div class="no-results is-visible">没有找到匹配内容</div>';
                    return;
                }
                searchResults.innerHTML = result.map(function (movie) {
                    var tags = movie.tags.slice(0, 3).map(function (tag) {
                        return '<span>' + escapeHtml(tag) + '</span>';
                    }).join("");
                    return '<article class="movie-card"><a href="' + escapeHtml(movie.file) + '" class="movie-card-link"><div class="movie-thumb"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-mark">▶</span><span class="type-badge">' + escapeHtml(movie.type) + '</span></div><div class="movie-card-body"><div class="movie-tags">' + tags + '</div><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div></a></article>';
                }).join("");
            };
            searchInput.addEventListener("input", renderResults);
            renderResults();
        }
    });

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var message = document.querySelector("[data-player-message]");
        var initialized = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add("is-visible");
            }
        }

        function setup() {
            if (!video || initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else {
                        showMessage("视频加载失败，请稍后重试");
                    }
                });
                return;
            }
            video.src = source;
        }

        function playVideo() {
            if (!video) {
                return;
            }
            setup();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
})();
