/**
 * NUMERAEL — Avatar Rehber Orkestratörü
 * Tüm avatar alt sistemlerini birbirine bağlar: Renderer, TTS, LipSync, Safety, Widget.
 * Uygulamanın geri kalanı için avatar konuşmasını tetikleyecek tek API sağlar.
 *
 * Akış:
 *   Metin → Güvenlik Filtresi → TTS → Dudak Senkronu → Görüntü Motoru → Widget
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
  // DURUM DEĞİŞKENLERİ
  // ═══════════════════════════════════════════════════════════
  var _initialized = false;
  var _speaking = false;
  var _queue = [];        // sıralı mesajlar için konuşma kuyruğu
  var _processing = false;

  // ═══════════════════════════════════════════════════════════
  // BAŞLATMA
  // ═══════════════════════════════════════════════════════════

  function init() {
    if (_initialized) return;

    // Widget'ın hazır olmasını bekle
    if (!window.AvatarWidget || !window.AvatarWidget.getFaceContainer()) {
      setTimeout(init, 200);
      return;
    }

    var container = window.AvatarWidget.getFaceContainer();
    if (!container) {
      console.warn('[AvatarGuide] Yüz kapsayıcısı bulunamadı');
      return;
    }

    // Görüntü motorunu başlat
    if (window.AvatarRenderer) {
      window.AvatarRenderer.start(container);
    }

    // Dudak senkronunu görüntü motoruyla başlat
    if (window.AvatarLipSync && window.AvatarRenderer) {
      window.AvatarLipSync.init(window.AvatarRenderer);
    }

    // TTS altyazı geri çağırmasını ayarla
    if (window.AvatarTTS) {
      window.AvatarTTS.setSubtitleCallback(function(text, wordIndex) {
        if (window.AvatarWidget) {
          window.AvatarWidget.showSubtitle(text, wordIndex);
        }
      });
    }

    _initialized = true;
    console.log('[AvatarGuide] Başlatıldı');
  }

  // ═══════════════════════════════════════════════════════════
  // ANA KONUŞMA AKIŞI
  // ═══════════════════════════════════════════════════════════

  /**
   * Avatar üzerinden metin konuştur.
   * Tam akış: Güvenlik → TTS → DudakSenkronu → Render → Widget
   *
   * @param {string} text - Konuşulacak ham metin (veya SSML)
   * @param {object} [options] - { immediate: bool, onComplete: fn }
   */
  function speak(text, options) {
    if (!text || typeof text !== 'string') return;

    var opts = options || {};

    if (opts.immediate) {
      stopSpeaking();
      _queue = [];
      executeSpeech(text, opts);
    } else {
      _queue.push({ text: text, options: opts });
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

    // Sessiz kontrolü
    if (window.AvatarWidget && window.AvatarWidget.isMuted()) {
      // Sessizde bile altyazıyı göster
      showSubtitleOnly(rawText, opts);
      return;
    }

    // Adım 1: Güvenlik filtresi
    var safeText = rawText;
    if (window.AvatarSafety) {
      safeText = window.AvatarSafety.prepareForSpeech(rawText);
    }

    _speaking = true;

    // Adım 2: Widget'ı bilgilendir
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechStart();
    }

    // Adım 3: Dudak senkronunu başlat
    if (window.AvatarLipSync) {
      window.AvatarLipSync.startSpeaking(safeText);
    }

    // Adım 4: Dudak senkronu için genlik geri çağırmasıyla TTS
    if (window.AvatarTTS) {
      window.AvatarTTS.speak(safeText, {
        onStart: function() {
          // Yukarıda zaten işlendi
        },
        onAmplitude: function(amplitude) {
          if (window.AvatarLipSync) {
            window.AvatarLipSync.processAmplitude(amplitude);
          }
        },
        onBoundary: function(event, wordIndex, totalWords) {
          // Kelime takibi TTS altyazı geri çağırmasıyla yapılıyor
        },
        onEnd: function() {
          onSpeechComplete(opts);
        }
      });
    } else {
      // TTS mevcut değil — sadece metni göster
      showSubtitleOnly(safeText, opts);
    }
  }

  function showSubtitleOnly(text, opts) {
    var safeText = text;
    if (window.AvatarSafety) {
      safeText = window.AvatarSafety.prepareForSpeech(text);
    }

    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechStart();
      window.AvatarWidget.showSubtitle(safeText, -1);
    }

    // Okuma süresinden sonra otomatik gizle
    var readTime = Math.max(3000, safeText.length * 60);
    setTimeout(function() {
      onSpeechComplete(opts);
    }, readTime);
  }

  function onSpeechComplete(opts) {
    _speaking = false;

    // Dudak senkronunu durdur
    if (window.AvatarLipSync) {
      window.AvatarLipSync.stopSpeaking();
    }

    // Widget'ı bilgilendir
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechEnd();
    }

    _processing = false;

    // Geri çağırma
    if (opts && opts.onComplete) {
      opts.onComplete();
    }

    // Kuyruktaki sonrakini işle
    processQueue();
  }

  // ═══════════════════════════════════════════════════════════
  // DURDUR
  // ═══════════════════════════════════════════════════════════

  function stopSpeaking() {
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
  // Olaylar gerçekleştiğinde diğer modüller tarafından çağrılır.
  // ═══════════════════════════════════════════════════════════

  /**
   * Numeroloji/karar sonucu döndüğünde çağrılır.
   * Rehberlik metni üretir ve avatar ile konuşturur.
   */
  function onResultReady(resultData) {
    var text = buildResultNarration(resultData);
    if (text) speak(text);
  }

  /**
   * Sayfa bölümü için AI içeriği üretildiğinde çağrılır.
   * Avatar isteğe bağlı olarak önemli AI görüşlerini anlatabilir.
   */
  function onAIContentReady(content, pageContext) {
    // Sadece önemli içerik için konuş, her bölüm için değil
    if (!pageContext || !pageContext.primary) return;
    var trimmed = content;
    if (trimmed.length > 200) {
      // Konuşma için özetle — ilk 2 cümleyi al
      var sentences = trimmed.split(/[.!?]+/).filter(function(s) { return s.trim().length > 10; });
      trimmed = sentences.slice(0, 2).join('. ') + '.';
    }
    speak(trimmed);
  }

  /**
   * Kullanıcı Decision Sphere'de soru/karar gönderdiğinde çağrılır.
   * Avatar kabul eder ve sonucu konuşur.
   */
  function onDecisionSubmit(action, result) {
    if (!result) return;

    var text = '';
    var score = result.score || 0;

    if (score >= 70) {
      text = 'Bugünün enerjisi bu adımı destekliyor görünüyor. Skor: yüzde ' + score + '. ';
    } else if (score >= 40) {
      text = 'Bu konuda karışık sinyaller var. Skor yüzde ' + score + ' civarında. ';
    } else {
      text = 'Bugün bu konuda dikkatli olmak faydalı olabilir. Skor: yüzde ' + score + '. ';
    }

    if (result.rationale) {
      text += result.rationale;
    }

    text += ' Nihai karar her zaman sana ait.';

    speak(text);
  }

  /**
   * Uyumluluk analizi sonuçları için çağrılır.
   */
  function onCompatibilityResult(score, names) {
    var text = '';
    var n = names || 'iki ruh';

    if (score >= 80) {
      text = n + ' arasında güçlü bir kozmik bağ görünüyor. Uyum skoru yüzde ' + score + '. Bu birliktelik zengin bir enerji taşıyor.';
    } else if (score >= 50) {
      text = n + ' arasındaki uyum yüzde ' + score + '. Hem uyum hem de büyüme alanları mevcut.';
    } else {
      text = n + ' arasındaki uyum yüzde ' + score + '. Farklı enerjiler bir arada. Bu bir fırsat da olabilir, bir uyarı da.';
    }

    text += ' Bu sadece sayıların perspektifi.';
    speak(text);
  }

  // ═══════════════════════════════════════════════════════════
  // ANLATI OLUŞTURUCU
  // ═══════════════════════════════════════════════════════════

  function buildResultNarration(data) {
    if (!data) return null;

    if (data.type === 'decision' && data.score !== undefined) {
      return onDecisionSubmitText(data.action, data);
    }

    if (data.type === 'compatibility' && data.score !== undefined) {
      return buildCompatNarration(data.score, data.names);
    }

    if (data.type === 'daily' && data.message) {
      return data.message;
    }

    if (data.text) {
      return data.text;
    }

    return null;
  }

  function onDecisionSubmitText(action, result) {
    var score = result.score || 0;
    var text = '';

    if (score >= 70) {
      text = 'Bugünün enerjisi bu adımı destekliyor görünüyor. ';
    } else if (score >= 40) {
      text = 'Bu konuda karışık sinyaller var. ';
    } else {
      text = 'Bugün bu konuda dikkatli olmak faydalı olabilir. ';
    }

    if (result.rationale) {
      text += result.rationale + ' ';
    }

    text += 'Nihai karar her zaman sana ait.';
    return text;
  }

  function buildCompatNarration(score, names) {
    var n = names || 'İki ruh';
    var text = n + ' arasındaki uyum yüzde ' + score + '. ';

    if (score >= 80) {
      text += 'Güçlü bir kozmik bağ görünüyor.';
    } else if (score >= 50) {
      text += 'Hem uyum hem de büyüme alanları mevcut.';
    } else {
      text += 'Farklı enerjiler bir arada. Bu bir fırsat da olabilir.';
    }

    text += ' Bu sadece sayıların perspektifi.';
    return text;
  }

  // ═══════════════════════════════════════════════════════════
  // LLM ENTEGRASYONU — AI ile avatar konuşması üret
  // ═══════════════════════════════════════════════════════════

  /**
   * LLM'den verilen bağlam için avatar konuşması üretmesini iste.
   * Güvenlik korumalı sistem prompt kullanır.
   */
  function generateAndSpeak(context, userPrompt) {
    var systemPrompt = [
      'Sen Numerael uygulamasının kozmik rehberisin.',
      'Sakin, bilge ve yargılayıcı olmayan bir tonda konuş.',
      'Kısa ve öz tut — 2-3 cümle yeterli.',
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
        max_tokens: 150,
        temperature: 0.7
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var text = data.choices && data.choices[0] ? data.choices[0].message.content : null;
      if (text) speak(text);
    })
    .catch(function(err) {
      console.warn('[AvatarGuide] LLM üretimi başarısız:', err);
    });
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

  // Otomatik başlatma
  function autoInit() {
    // Tüm bağımlılıkların hazır olmasını bekle
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
    generateAndSpeak: generateAndSpeak,
    destroy: destroy
  };

})();
