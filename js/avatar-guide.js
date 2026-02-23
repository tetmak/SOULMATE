/**
 * NUMERAEL — Avatar Rehber Orkestratörü
 * Tüm avatar alt sistemlerini birbirine bağlar: Renderer, TTS, LipSync, Safety, Widget.
 * Uygulamanın geri kalanı için avatar konuşmasını tetikleyecek tek API sağlar.
 *
 * Konuşma Politikası:
 *   1. Decision Sphere nihai sonucu (kullanıcı açıkça kategori seçtikten sonra)
 *   2. Uyumluluk sonucu SADECE skor >= 70 ise
 *   3. İlk kez kullanıcı günlük rehberi (YALNIZCA BİR KEZ)
 *   Bunlar dışında avatar konuşmaz.
 *
 * Dışa aktarım: window.AvatarGuide
 */
(function() {
  'use strict';

  var isNative = window.location.protocol === 'capacitor:' ||
                 window.location.protocol === 'ionic:' ||
                 window.location.hostname === 'localhost' ||
                 window.location.protocol === 'file:' ||
                 (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ═══════════════════════════════════════════════════════════
  // SABİTLER
  // ═══════════════════════════════════════════════════════════
  var COMPAT_MIN_SCORE = 70;
  var MAX_SENTENCES = 2;
  var MAX_SPEECH_DURATION_MS = 20000;
  var FIRST_USE_KEY = 'numerael_avatar_first_spoken';
  var EXPAND_DELAY_MS = 350;

  // ═══════════════════════════════════════════════════════════
  // DURUM DEĞİŞKENLERİ
  // ═══════════════════════════════════════════════════════════
  var _initialized = false;
  var _speaking = false;
  var _queue = [];
  var _processing = false;
  var _speechTimer = null;

  // ═══════════════════════════════════════════════════════════
  // İLK KULLANIM VE SESSİZ DURUMU
  // ═══════════════════════════════════════════════════════════

  function hasSpokenBefore() {
    try { return localStorage.getItem(FIRST_USE_KEY) === '1'; } catch(e) { return false; }
  }

  function markFirstSpoken() {
    try { localStorage.setItem(FIRST_USE_KEY, '1'); } catch(e) {}
  }

  function isDefaultMuted() {
    return hasSpokenBefore();
  }

  // ═══════════════════════════════════════════════════════════
  // PREMİUM KONTROL
  // ═══════════════════════════════════════════════════════════

  function isPremiumUser() {
    return window.premium && typeof window.premium.isPremium === 'function' && window.premium.isPremium();
  }

  // ═══════════════════════════════════════════════════════════
  // METİN KISLAMA — maks 2 cümle, premium/free farkı
  // ═══════════════════════════════════════════════════════════

  function truncateToSentences(text, maxSentences) {
    if (!text) return '';
    var sentences = text.split(/(?<=[.!?])\s+/).filter(function(s) { return s.trim().length > 0; });
    if (sentences.length <= maxSentences) return text;
    return sentences.slice(0, maxSentences).join(' ');
  }

  function prepareText(rawText) {
    if (!rawText) return '';
    var maxSentences = isPremiumUser() ? MAX_SENTENCES : 1;
    return truncateToSentences(rawText, maxSentences);
  }

  // ═══════════════════════════════════════════════════════════
  // BAŞLATMA
  // ═══════════════════════════════════════════════════════════

  function init() {
    if (_initialized) return;

    if (!window.AvatarWidget || !window.AvatarWidget.getFaceContainer()) {
      setTimeout(init, 200);
      return;
    }

    var container = window.AvatarWidget.getFaceContainer();
    if (!container) return;

    if (window.AvatarRenderer) {
      window.AvatarRenderer.start(container);
    }

    if (window.AvatarLipSync && window.AvatarRenderer) {
      window.AvatarLipSync.init(window.AvatarRenderer);
    }

    if (window.AvatarTTS) {
      window.AvatarTTS.setSubtitleCallback(function(text, wordIndex) {
        if (window.AvatarWidget) {
          window.AvatarWidget.showSubtitle(text, wordIndex);
        }
      });
    }

    if (isDefaultMuted() && window.AvatarWidget) {
      window.AvatarWidget.setMuted(true);
    }

    _initialized = true;
  }

  // ═══════════════════════════════════════════════════════════
  // ANA KONUŞMA AKIŞI
  // ═══════════════════════════════════════════════════════════

  function speak(text, options) {
    if (!text || typeof text !== 'string') return;

    var opts = options || {};
    var prepared = prepareText(text);
    if (!prepared) return;

    if (opts.immediate) {
      stopSpeaking();
      _queue = [];
      executeSpeech(prepared, opts);
    } else {
      _queue.push({ text: prepared, options: opts });
      processQueue();
    }
  }

  function processQueue() {
    if (_processing || _queue.length === 0) return;
    _processing = true;
    var item = _queue.shift();
    executeSpeech(item.text, item.options);
  }

  function executeSpeech(rawText, opts) {
    if (!_initialized) {
      init();
      setTimeout(function() { executeSpeech(rawText, opts); }, 500);
      return;
    }

    if (window.AvatarWidget && window.AvatarWidget.isMuted()) {
      showSubtitleOnly(rawText, opts);
      return;
    }

    var safeText = rawText;
    if (window.AvatarSafety) {
      safeText = window.AvatarSafety.prepareForSpeech(rawText);
    }

    safeText = prepareText(safeText);
    if (!safeText) {
      _processing = false;
      processQueue();
      return;
    }

    _speaking = true;

    if (!hasSpokenBefore()) {
      markFirstSpoken();
    }

    // Widget'ı gecikmeli genişlet
    if (window.AvatarWidget) {
      setTimeout(function() {
        if (_speaking && window.AvatarWidget) {
          window.AvatarWidget.onSpeechStart();
        }
      }, EXPAND_DELAY_MS);
    }

    if (window.AvatarLipSync) {
      window.AvatarLipSync.startSpeaking(safeText);
    }

    // Maksimum süre güvenlik zamanlayıcısı
    if (_speechTimer) clearTimeout(_speechTimer);
    _speechTimer = setTimeout(function() {
      if (_speaking) stopSpeaking();
    }, MAX_SPEECH_DURATION_MS);

    if (window.AvatarTTS) {
      window.AvatarTTS.speak(safeText, {
        onStart: function() {},
        onAmplitude: function(amplitude) {
          if (window.AvatarLipSync) {
            window.AvatarLipSync.processAmplitude(amplitude);
          }
        },
        onBoundary: function() {},
        onEnd: function() {
          onSpeechComplete(opts);
        }
      });
    } else {
      showSubtitleOnly(safeText, opts);
    }
  }

  function showSubtitleOnly(text, opts) {
    var safeText = text;
    if (window.AvatarSafety) {
      safeText = window.AvatarSafety.prepareForSpeech(text);
    }
    safeText = prepareText(safeText);

    if (window.AvatarWidget) {
      setTimeout(function() {
        if (window.AvatarWidget) {
          window.AvatarWidget.onSpeechStart();
          window.AvatarWidget.showSubtitle(safeText, -1);
        }
      }, EXPAND_DELAY_MS);
    }

    var readTime = Math.min(Math.max(3000, safeText.length * 60), MAX_SPEECH_DURATION_MS);
    setTimeout(function() {
      onSpeechComplete(opts);
    }, readTime);
  }

  function onSpeechComplete(opts) {
    _speaking = false;

    if (_speechTimer) {
      clearTimeout(_speechTimer);
      _speechTimer = null;
    }

    if (window.AvatarLipSync) {
      window.AvatarLipSync.stopSpeaking();
    }

    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechEnd();
    }

    _processing = false;

    if (opts && opts.onComplete) {
      opts.onComplete();
    }

    processQueue();
  }

  // ═══════════════════════════════════════════════════════════
  // DURDUR
  // ═══════════════════════════════════════════════════════════

  function stopSpeaking() {
    if (_speechTimer) {
      clearTimeout(_speechTimer);
      _speechTimer = null;
    }
    if (window.AvatarTTS) window.AvatarTTS.stop();
    if (window.AvatarLipSync) window.AvatarLipSync.stopSpeaking();
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechEnd();
      window.AvatarWidget.hideSubtitle();
    }
    _speaking = false;
    _processing = false;
  }

  // ═══════════════════════════════════════════════════════════
  // ÜST DÜZEY TETİKLEYİCİLER
  // Sadece izin verilen 3 durum:
  //   1. Decision Sphere nihai sonucu
  //   2. Uyumluluk sonucu (skor >= 70)
  //   3. İlk kez günlük rehber
  // ═══════════════════════════════════════════════════════════

  function onResultReady() {
    // Pasif içerik render'ı — avatar konuşmaz
  }

  function onAIContentReady() {
    // Pasif içerik — avatar konuşmaz
  }

  /**
   * Decision Sphere nihai sonucu — avatar konuşabilir
   */
  function onDecisionSubmit(action, result) {
    if (!result) return;

    var score = result.score || 0;
    var text = '';

    if (score >= 70) {
      text = 'Bugünün enerjisi bu adımı destekliyor görünüyor.';
    } else if (score >= 40) {
      text = 'Bu konuda karışık sinyaller var, dikkatli ilerlemek uyumlu görünüyor.';
    } else {
      text = 'Bugün bu konuda dikkatli olmak faydalı olabilir.';
    }

    text += ' Nihai karar her zaman sana ait.';
    speak(text);
  }

  /**
   * Uyumluluk sonucu — SADECE skor >= 70 ise konuş
   */
  function onCompatibilityResult(score, names) {
    if (score < COMPAT_MIN_SCORE) return;

    var n = names || 'iki ruh';
    var text = '';

    if (score >= 80) {
      text = n + ' arasında güçlü bir kozmik bağ öne çıkıyor. Bu birliktelik zengin bir enerji taşıyor olabilir.';
    } else {
      text = n + ' arasındaki uyum destekleyici görünüyor. Hem uyum hem de büyüme alanları mevcut.';
    }

    speak(text);
  }

  /**
   * İlk kez günlük rehber — SADECE ilk kullanımda, BİR KEZ
   */
  function onDailyGuideFirstTime(insightText) {
    if (hasSpokenBefore()) return;
    if (!insightText) return;
    speak(insightText);
  }

  // ═══════════════════════════════════════════════════════════
  // LLM ENTEGRASYONU
  // ═══════════════════════════════════════════════════════════

  function generateAndSpeak(context, userPrompt) {
    var systemPrompt = [
      'Sen Numerael uygulamasının kozmik rehberisin.',
      'Sakin, bilge ve yargılayıcı olmayan bir tonda konuş.',
      'Maksimum 2 kısa cümle söyle.',
      'Olasılık dili kullan: "destekleyici olabilir", "öne çıkıyor", "uyumlu görünüyor".',
      'Asla emir verme, asla kesinlik belirtme.',
      'Türkçe konuş.',
      window.AvatarSafety ? window.AvatarSafety.getSystemPromptGuard() : ''
    ].join('\n');

    var prompt = context ? (context + '\n\n' + userPrompt) : userPrompt;

    fetch(API_BASE + '/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var text = data.choices && data.choices[0] ? data.choices[0].message.content : null;
      if (text) speak(text);
    })
    .catch(function() {});
  }

  // ═══════════════════════════════════════════════════════════
  // YAŞAM DÖNGÜSÜ
  // ═══════════════════════════════════════════════════════════

  function destroy() {
    stopSpeaking();
    _queue = [];
    if (window.AvatarRenderer) window.AvatarRenderer.stop();
    if (window.AvatarLipSync) window.AvatarLipSync.destroy();
    if (window.AvatarWidget) window.AvatarWidget.destroy();
    _initialized = false;
  }

  function isSpeaking() {
    return _speaking;
  }

  function isReady() {
    return _initialized;
  }

  function autoInit() {
    if (!window.AvatarRenderer || !window.AvatarTTS || !window.AvatarLipSync || !window.AvatarWidget || !window.AvatarSafety) {
      setTimeout(autoInit, 300);
      return;
    }
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 200);
    });
  } else {
    setTimeout(autoInit, 200);
  }

  // ─── Dışa Aktarım ───
  window.AvatarGuide = {
    init: init,
    speak: speak,
    stopSpeaking: stopSpeaking,
    isSpeaking: isSpeaking,
    isReady: isReady,
    onResultReady: onResultReady,
    onAIContentReady: onAIContentReady,
    onDecisionSubmit: onDecisionSubmit,
    onCompatibilityResult: onCompatibilityResult,
    onDailyGuideFirstTime: onDailyGuideFirstTime,
    generateAndSpeak: generateAndSpeak,
    destroy: destroy
  };

})();
