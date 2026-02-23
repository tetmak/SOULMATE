/**
 * SOULNUM — Lip Sync Engine
 * Web Speech API (SpeechSynthesis) ile konuşma + dudak senkronizasyonu.
 * Konuşma sırasında karakter bazlı tahmini amplitüd → ağız durumu eşleştirmesi.
 */
(function() {
  'use strict';

  var synth = window.speechSynthesis || null;
  var isSpeaking = false;
  var mouthInterval = null;
  var currentUtterance = null;
  var onStartCallback = null;
  var onEndCallback = null;

  // Sesli harfler → ağız açık, sessizler → yarı açık, boşluk/noktalama → kapalı
  var VOWELS = /[aeıioöuüAEIİOÖUÜ]/;
  var CONSONANTS = /[bcçdfgğhjklmnprsştvyzBCÇDFGĞHJKLMNPRSŞTVYZ]/;

  // Karakter tabanlı dudak animasyonu
  function startMouthAnimation(text) {
    if (!window.AvatarRenderer) return;

    var chars = text.replace(/\s+/g, ' ').split('');
    var idx = 0;
    var totalDuration = estimateSpeechDuration(text);
    var charInterval = Math.max(50, totalDuration / chars.length);

    mouthInterval = setInterval(function() {
      if (idx >= chars.length) {
        stopMouthAnimation();
        return;
      }

      var ch = chars[idx];
      if (VOWELS.test(ch)) {
        window.AvatarRenderer.setMouth('open');
      } else if (CONSONANTS.test(ch)) {
        window.AvatarRenderer.setMouth('half');
      } else {
        window.AvatarRenderer.setMouth('closed');
      }

      idx++;
    }, charInterval);
  }

  function stopMouthAnimation() {
    if (mouthInterval) {
      clearInterval(mouthInterval);
      mouthInterval = null;
    }
    if (window.AvatarRenderer) {
      window.AvatarRenderer.setMouth('closed');
    }
  }

  // Tahmini konuşma süresi (ms) — Türkçe ortalama hız
  function estimateSpeechDuration(text) {
    // Ortalama 4.5 hece/saniye, her hece ~1.5 karakter
    var syllables = Math.ceil(text.length / 1.5);
    return (syllables / 4.5) * 1000;
  }

  // Türkçe ses seçimi
  function getTurkishVoice() {
    if (!synth) return null;
    var voices = synth.getVoices();
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang === 'tr-TR' || voices[i].lang.indexOf('tr') === 0) {
        return voices[i];
      }
    }
    return voices.length > 0 ? voices[0] : null;
  }

  // Public API
  var AvatarLipSync = {
    speak: function(text, callbacks) {
      if (!synth) {
        console.warn('[Avatar] SpeechSynthesis desteklenmiyor');
        if (callbacks && callbacks.onEnd) callbacks.onEnd();
        return;
      }

      // Önceki konuşmayı durdur
      this.stop();

      callbacks = callbacks || {};
      onStartCallback = callbacks.onStart || null;
      onEndCallback = callbacks.onEnd || null;

      // Utterance oluştur
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      var voice = getTurkishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = function() {
        isSpeaking = true;
        startMouthAnimation(text);
        if (onStartCallback) {
          try { onStartCallback(); } catch(e) {}
        }
      };

      utterance.onend = function() {
        isSpeaking = false;
        stopMouthAnimation();
        if (onEndCallback) {
          try { onEndCallback(); } catch(e) {}
        }
      };

      utterance.onerror = function() {
        isSpeaking = false;
        stopMouthAnimation();
        if (onEndCallback) {
          try { onEndCallback(); } catch(e) {}
        }
      };

      currentUtterance = utterance;

      // Voices yüklenmemiş olabilir
      if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = function() {
          var v = getTurkishVoice();
          if (v) utterance.voice = v;
          synth.speak(utterance);
        };
      } else {
        synth.speak(utterance);
      }
    },

    stop: function() {
      if (synth) {
        synth.cancel();
      }
      isSpeaking = false;
      stopMouthAnimation();
      currentUtterance = null;
    },

    isSpeaking: function() {
      return isSpeaking;
    }
  };

  window.AvatarLipSync = AvatarLipSync;
})();
