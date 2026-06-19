function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('play-cover');
  var wrap = video ? video.closest('.player-wrap') : null;
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function activate() {
    if (!loaded) {
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    if (wrap) {
      wrap.classList.add('player-active');
    }

    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', activate);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      activate();
    }
  });

  video.addEventListener('play', function () {
    if (wrap) {
      wrap.classList.add('player-active');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
