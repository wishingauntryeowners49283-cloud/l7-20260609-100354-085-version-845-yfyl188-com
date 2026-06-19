(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var cardList = document.querySelector('[data-card-list]');
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var sortSelect = document.querySelector('[data-sort-cards]');

    if (cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

        function getCardText(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-genre') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }

        function matchesYear(card, yearValue) {
            if (!yearValue) {
                return true;
            }

            var year = parseInt(card.getAttribute('data-year'), 10);

            if (!year) {
                return false;
            }

            if (yearValue === '1990') {
                return year >= 1990 && year <= 1999;
            }

            if (yearValue === '1980') {
                return year >= 1980 && year <= 1989;
            }

            return String(year) === yearValue;
        }

        function filterCards() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var yearValue = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var visible = (!keyword || getCardText(card).indexOf(keyword) !== -1) && matchesYear(card, yearValue);
                card.style.display = visible ? '' : 'none';
            });
        }

        function sortCards() {
            if (!sortSelect) {
                return;
            }

            var mode = sortSelect.value;
            var sorted = cards.slice();

            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
                });
            }

            if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return (parseInt(a.getAttribute('data-year'), 10) || 0) - (parseInt(b.getAttribute('data-year'), 10) || 0);
                });
            }

            if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            }

            sorted.forEach(function (card) {
                cardList.appendChild(card);
            });
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', filterCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                sortCards();
                filterCards();
            });
        }
    }
}());
