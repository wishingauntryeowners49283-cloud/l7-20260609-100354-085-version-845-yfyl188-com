(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var ready = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function setupPlayer() {
        if (!video || !source || ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('播放暂时不可用，请稍后重试。');
                }
            });
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        setupPlayer();
        setMessage('');

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}());
