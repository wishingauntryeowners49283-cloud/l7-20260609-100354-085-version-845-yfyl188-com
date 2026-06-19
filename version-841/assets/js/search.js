(function () {
    var data = window.MovieSearchData || [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');

    if (!form || !input || !results) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function render(items, query) {
        if (!query) {
            items = data.slice(0, 24);
        }

        if (!items.length) {
            results.innerHTML = '<p class="empty-result">没有找到匹配内容。</p>';
            return;
        }

        results.innerHTML = items.slice(0, 80).map(function (item) {
            var tags = (item.tags || []).slice(0, 4).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="search-result-card">',
                '<a href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
                '<div>',
                '<div class="card-tags">' + tags + '</div>',
                '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
                '<p>' + escapeHtml(item.desc) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function search(query) {
        var keyword = normalize(query);

        if (!keyword) {
            render([], '');
            return;
        }

        var items = data.filter(function (item) {
            var haystack = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                (item.tags || []).join(' '),
                item.desc
            ].join(' '));

            return haystack.indexOf(keyword) !== -1;
        });

        render(items, keyword);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', url);
        search(query);
    });

    input.addEventListener('input', function () {
        search(input.value);
    });

    search(initialQuery);
}());
