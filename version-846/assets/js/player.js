(function () {
  function attachStream(video, url) {
    if (!video || !url) {
      return null;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return hls;
    }
    return null;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var hls = null;
      var loaded = false;

      function play() {
        if (!video || !button) {
          return;
        }
        var url = button.getAttribute('data-stream-url') || '';
        if (!loaded) {
          hls = attachStream(video, url);
          loaded = true;
        }
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('error', function () {
          player.classList.remove('is-playing');
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayers);
})();
