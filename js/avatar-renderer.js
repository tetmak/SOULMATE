/**
 * SOULNUM — Avatar Render Engine
 * HTML Canvas üzerinde 2D avatar render eder.
 * Yüz + ağız katmanları, otomatik göz kırpma.
 */
(function() {
  'use strict';

  var ASSET_PATH = 'public/avatar/';
  var BLINK_INTERVAL_MIN = 4000; // ms
  var BLINK_INTERVAL_MAX = 6000;
  var BLINK_DURATION = 120; // ms

  var canvas = null;
  var ctx = null;
  var images = {};
  var currentFace = 'idle';   // 'idle' | 'blink'
  var currentMouth = 'closed'; // 'closed' | 'half' | 'open'
  var blinkTimer = null;
  var isReady = false;
  var renderRAF = null;

  // Asset yükleme
  function loadImage(name, src, cb) {
    var img = new Image();
    img.onload = function() {
      images[name] = img;
      cb(null);
    };
    img.onerror = function() {
      console.warn('[Avatar] Asset yüklenemedi: ' + src);
      cb('err');
    };
    img.src = src;
  }

  function loadAllAssets(callback) {
    var assets = [
      { name: 'face_idle', src: ASSET_PATH + 'face_idle.png' },
      { name: 'face_blink', src: ASSET_PATH + 'face_blink.png' },
      { name: 'mouth_closed', src: ASSET_PATH + 'mouth_closed.png' },
      { name: 'mouth_half', src: ASSET_PATH + 'mouth_half.png' },
      { name: 'mouth_open', src: ASSET_PATH + 'mouth_open.png' }
    ];
    var loaded = 0;
    var total = assets.length;
    var hasError = false;

    for (var i = 0; i < assets.length; i++) {
      loadImage(assets[i].name, assets[i].src, function(err) {
        if (err) hasError = true;
        loaded++;
        if (loaded === total) {
          callback(hasError ? 'Bazı asset yüklenemedi' : null);
        }
      });
    }
  }

  // Render döngüsü
  function render() {
    if (!ctx || !isReady) return;

    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Yüz katmanı
    var faceImg = currentFace === 'blink' ? images.face_blink : images.face_idle;
    if (faceImg) {
      ctx.drawImage(faceImg, 0, 0, w, h);
    }

    // Ağız katmanı
    var mouthKey = 'mouth_' + currentMouth;
    var mouthImg = images[mouthKey];
    if (mouthImg) {
      ctx.drawImage(mouthImg, 0, 0, w, h);
    }

    renderRAF = requestAnimationFrame(render);
  }

  // Göz kırpma zamanlayıcısı
  function scheduleBlink() {
    var delay = BLINK_INTERVAL_MIN + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
    blinkTimer = setTimeout(function() {
      if (!isReady) return;
      currentFace = 'blink';
      setTimeout(function() {
        currentFace = 'idle';
        scheduleBlink();
      }, BLINK_DURATION);
    }, delay);
  }

  function stopBlink() {
    if (blinkTimer) {
      clearTimeout(blinkTimer);
      blinkTimer = null;
    }
  }

  // Public API
  var AvatarRenderer = {
    init: function(canvasEl) {
      if (!canvasEl) {
        console.warn('[Avatar] Canvas element bulunamadı');
        return;
      }
      canvas = canvasEl;
      ctx = canvas.getContext('2d');

      loadAllAssets(function(err) {
        if (err) {
          console.warn('[Avatar] ' + err);
        }
        isReady = true;
        currentFace = 'idle';
        currentMouth = 'closed';
        render();
        scheduleBlink();
        console.log('[Avatar] Renderer hazır');
      });
    },

    setFace: function(state) {
      if (state === 'idle' || state === 'blink') {
        currentFace = state;
      }
    },

    setMouth: function(state) {
      if (state === 'closed' || state === 'half' || state === 'open') {
        currentMouth = state;
      }
    },

    isReady: function() {
      return isReady;
    },

    destroy: function() {
      isReady = false;
      stopBlink();
      if (renderRAF) {
        cancelAnimationFrame(renderRAF);
        renderRAF = null;
      }
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas = null;
      ctx = null;
    }
  };

  window.AvatarRenderer = AvatarRenderer;
})();
