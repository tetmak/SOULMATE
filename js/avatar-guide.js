/**
 * SOULNUM — Avatar Guide Orchestrator
 * Text → TTS → Lip Sync → Renderer pipeline.
 * Ana API: AvatarGuide.speak(text)
 */
(function() {
  'use strict';

  var isInitialized = false;
  var speechQueue = [];
  var isBusy = false;

  // HTML tag'lerini temizle
  function stripHTML(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Uzun metinleri kısalt (TTS için makul uzunluk)
  function truncateForSpeech(text, maxLen) {
    maxLen = maxLen || 300;
    if (text.length <= maxLen) return text;
    // En yakın cümle sonunda kes
    var cut = text.substring(0, maxLen);
    var lastDot = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
    if (lastDot > maxLen * 0.5) {
      return cut.substring(0, lastDot + 1);
    }
    return cut + '...';
  }

  // Sıradaki metni konuş
  function processQueue() {
    if (isBusy || speechQueue.length === 0) return;

    isBusy = true;
    var text = speechQueue.shift();

    // Widget'ı genişlet
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeakStart();
    }

    // Lip sync ile konuş
    if (window.AvatarLipSync) {
      window.AvatarLipSync.speak(text, {
        onStart: function() {
          // Konuşma başladı
        },
        onEnd: function() {
          isBusy = false;
          if (window.AvatarWidget) {
            window.AvatarWidget.onSpeakEnd();
          }
          // Sırada başka metin varsa devam et
          processQueue();
        }
      });
    } else {
      // LipSync yoksa 2 saniye bekle, kapat
      setTimeout(function() {
        isBusy = false;
        if (window.AvatarWidget) {
          window.AvatarWidget.onSpeakEnd();
        }
        processQueue();
      }, 2000);
    }
  }

  // Sayfa yüklendiğinde otomatik başlat
  function autoInit() {
    if (isInitialized) return;
    isInitialized = true;

    // Widget başlat
    if (window.AvatarWidget) {
      window.AvatarWidget.init();
    }

    console.log('[Avatar] Guide hazır');
  }

  // DOMContentLoaded'da init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Public API
  var AvatarGuide = {
    speak: function(text) {
      if (!text) return;

      // HTML temizle
      var clean = stripHTML(text).trim();
      if (!clean) return;

      // TTS için kısalt
      clean = truncateForSpeech(clean);

      // Kuyruğa ekle
      speechQueue.push(clean);
      processQueue();
    },

    onDecisionResult: function(text) {
      this.speak(text);
    },

    onCompatibilityResult: function(text) {
      this.speak(text);
    },

    stop: function() {
      speechQueue = [];
      isBusy = false;
      if (window.AvatarLipSync) {
        window.AvatarLipSync.stop();
      }
      if (window.AvatarWidget) {
        window.AvatarWidget.onSpeakEnd();
      }
    },

    isReady: function() {
      return isInitialized;
    }
  };

  window.AvatarGuide = AvatarGuide;
})();
