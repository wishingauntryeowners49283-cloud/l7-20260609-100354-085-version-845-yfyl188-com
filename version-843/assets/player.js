(function () {
  window.initializePlayer = function (videoId, overlayId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hls = hls;
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    if (button) {
      button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  };
})();
