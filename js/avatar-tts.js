/**
 * NUMERAEL — TTS Soyutlama Katmanı
 * Sağlayıcıdan bağımsız Metinden Konuşmaya (TTS) servisi, SSML desteğiyle.
 * Desteklenenler: Web Speech API (varsayılan), OpenAI TTS (sunucu proxy), özel sağlayıcılar.
 *
 * Dışa aktarım: window.AvatarTTS
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
  // YAPILANDIRMA
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
    provider: 'webspeech',   // 'webspeech' | 'openai' | 'custom'
    lang: 'tr-TR',
    rate: 0.92,
    pitch: 1.0,
    volume: 0.85,
    // OpenAI TTS ayarları
    openaiModel: 'tts-1',
    openaiVoice: 'nova',     // sakin, sıcak ses
    // Geri çağırmalar
    onStart: null,
    onEnd: null,
    onBoundary: null,        // kelime sınırı olayları
    onAmplitude: null        // dudak senkronu için genlik verisi
  };

  var _speaking = false;
  var _utterance = null;
  var _audioCtx = null;
  var _analyser = null;
  var _audioSource = null;
  var _currentAudio = null;
  var _amplitudeInterval = null;
  var _subtitleCallback = null;

  // ═══════════════════════════════════════════════════════════
  // SSML İŞLEME
  // ═══════════════════════════════════════════════════════════

  /**
   * SSML biçimli metni Web Speech API için düz metne çevirir.
   * Duraklama niyetini virgül/nokta ekleyerek korur.
   */
  function ssmlToPlainText(ssml) {
    if (!ssml) return '';
    var text = ssml;
    // <speak> sarmalayıcısını kaldır
    text = text.replace(/<\/?speak>/gi, '');
    // <break> etiketlerini duraklamalara çevir (virgül)
    text = text.replace(/<break[^>]*time=["'](\d+)ms["'][^>]*\/?\s*>/gi, function(_, ms) {
      return parseInt(ms) > 300 ? '. ' : ', ';
    });
    text = text.replace(/<break[^>]*\/?\s*>/gi, ', ');
    // <emphasis> — iç metni koru
    text = text.replace(/<emphasis[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1');
    // <prosody> — iç metni koru
    text = text.replace(/<prosody[^>]*>([\s\S]*?)<\/prosody>/gi, '$1');
    // Kalan etiketleri kaldır
    text = text.replace(/<[^>]+>/g, '');
    // Boşlukları temizle
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  /**
   * Metinden seçeneklerle SSML dizesi oluşturur
   */
  function buildSSML(text, options) {
    var ssml = '<speak>';
    if (options && options.soft) {
      ssml += '<prosody rate="slow" pitch="-2st" volume="soft">';
    }
    // Cümlelerden sonra duraklama ekle
    var sentences = text.split(/(?<=[.!?])\s+/);
    for (var i = 0; i < sentences.length; i++) {
      ssml += sentences[i];
      if (i < sentences.length - 1) {
        ssml += ' <break time="400ms"/> ';
      }
    }
    if (options && options.soft) {
      ssml += '</prosody>';
    }
    ssml += '</speak>';
    return ssml;
  }

  // ═══════════════════════════════════════════════════════════
  // WEB SPEECH API SAĞLAYICISI
  // ═══════════════════════════════════════════════════════════

  function speakWebSpeech(text, callbacks) {
    if (!window.speechSynthesis) {
      console.warn('[AvatarTTS] Web Speech API kullanılamıyor');
      if (callbacks.onEnd) callbacks.onEnd();
      return;
    }

    // Devam eden konuşmayı iptal et
    window.speechSynthesis.cancel();

    var plainText = ssmlToPlainText(text);
    _utterance = new SpeechSynthesisUtterance(plainText);
    _utterance.lang = CONFIG.lang;
    _utterance.rate = CONFIG.rate;
    _utterance.pitch = CONFIG.pitch;
    _utterance.volume = CONFIG.volume;

    // Türkçe ses bulmaya çalış
    var voices = window.speechSynthesis.getVoices();
    var trVoice = null;
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.indexOf('tr') === 0) {
        trVoice = voices[i];
        break;
      }
    }
    if (trVoice) _utterance.voice = trVoice;

    // Altyazı için kelime takibi
    var words = plainText.split(/\s+/);
    var wordIndex = 0;

    _utterance.onstart = function() {
      _speaking = true;
      if (callbacks.onStart) callbacks.onStart();
      if (_subtitleCallback) _subtitleCallback(plainText, 0);
      // Web Speech için genlik simülasyonu başlat (gerçek ses analizi yok)
      startAmplitudeSimulation(callbacks.onAmplitude);
    };

    _utterance.onboundary = function(e) {
      if (e.name === 'word') {
        wordIndex++;
        if (callbacks.onBoundary) callbacks.onBoundary(e, wordIndex, words.length);
        if (_subtitleCallback) _subtitleCallback(plainText, wordIndex);
      }
    };

    _utterance.onend = function() {
      _speaking = false;
      stopAmplitudeSimulation();
      if (callbacks.onEnd) callbacks.onEnd();
    };

    _utterance.onerror = function(e) {
      console.warn('[AvatarTTS] Konuşma hatası:', e.error);
      _speaking = false;
      stopAmplitudeSimulation();
      if (callbacks.onEnd) callbacks.onEnd();
    };

    window.speechSynthesis.speak(_utterance);
  }

  // ═══════════════════════════════════════════════════════════
  // OPENAI TTS SAĞLAYICISI (sunucu proxy üzerinden)
  // ═══════════════════════════════════════════════════════════

  function speakOpenAI(text, callbacks) {
    var plainText = ssmlToPlainText(text);

    fetch(API_BASE + '/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.openaiModel,
        voice: CONFIG.openaiVoice,
        input: plainText,
        response_format: 'mp3'
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('TTS API hatası: ' + res.status);
      return res.arrayBuffer();
    })
    .then(function(buffer) {
      playAudioBuffer(buffer, plainText, callbacks);
    })
    .catch(function(err) {
      console.warn('[AvatarTTS] OpenAI TTS başarısız, Web Speech\'e geri dönülüyor:', err);
      speakWebSpeech(text, callbacks);
    });
  }

  function playAudioBuffer(buffer, text, callbacks) {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    _audioCtx.decodeAudioData(buffer.slice(0), function(audioBuffer) {
      // Kaynak oluştur
      _audioSource = _audioCtx.createBufferSource();
      _audioSource.buffer = audioBuffer;

      // Genlik için analizör oluştur
      _analyser = _audioCtx.createAnalyser();
      _analyser.fftSize = 256;
      _analyser.smoothingTimeConstant = 0.7;

      _audioSource.connect(_analyser);
      _analyser.connect(_audioCtx.destination);

      _audioSource.onended = function() {
        _speaking = false;
        stopAmplitudeAnalysis();
        if (callbacks.onEnd) callbacks.onEnd();
      };

      _speaking = true;
      if (callbacks.onStart) callbacks.onStart();
      if (_subtitleCallback) _subtitleCallback(text, 0);

      _audioSource.start(0);

      // Gerçek genlik analizi başlat
      startAmplitudeAnalysis(callbacks.onAmplitude);

      // Süreye göre kelime sınırlarını simüle et
      simulateWordBoundaries(text, audioBuffer.duration, callbacks.onBoundary);
    }, function(err) {
      console.warn('[AvatarTTS] Ses çözme hatası:', err);
      if (callbacks.onEnd) callbacks.onEnd();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GENLİK ANALİZİ
  // ═══════════════════════════════════════════════════════════

  function startAmplitudeAnalysis(onAmplitude) {
    if (!_analyser || !onAmplitude) return;
    var dataArray = new Uint8Array(_analyser.frequencyBinCount);

    function tick() {
      if (!_speaking) return;
      _analyser.getByteFrequencyData(dataArray);
      // Ortalama genliği hesapla
      var sum = 0;
      for (var i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      var avg = sum / dataArray.length / 255; // 0-1 normalize
      onAmplitude(avg);
      _amplitudeInterval = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopAmplitudeAnalysis() {
    if (_amplitudeInterval) {
      cancelAnimationFrame(_amplitudeInterval);
      _amplitudeInterval = null;
    }
  }

  /**
   * Web Speech API için genlik simülasyonu (doğrudan ses erişimi yok)
   */
  function startAmplitudeSimulation(onAmplitude) {
    if (!onAmplitude) return;
    var phase = 0;
    function tick() {
      if (!_speaking) {
        onAmplitude(0);
        return;
      }
      phase += 0.15;
      // Doğal genlik varyasyonu üret
      var amp = 0.3 + Math.sin(phase) * 0.15 +
                Math.sin(phase * 2.7) * 0.1 +
                Math.sin(phase * 0.5) * 0.1 +
                Math.random() * 0.15;
      amp = Math.max(0, Math.min(1, amp));
      onAmplitude(amp);
      _amplitudeInterval = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopAmplitudeSimulation() {
    stopAmplitudeAnalysis(); // aynı temizlik
  }

  /**
   * Ses süresine göre kelime sınırlarını simüle et
   */
  function simulateWordBoundaries(text, duration, onBoundary) {
    var words = text.split(/\s+/);
    if (words.length === 0 || !onBoundary) return;
    var interval = (duration * 1000) / words.length;
    var idx = 0;
    function nextWord() {
      if (!_speaking || idx >= words.length) return;
      onBoundary({ name: 'word', charIndex: 0 }, idx, words.length);
      if (_subtitleCallback) _subtitleCallback(text, idx);
      idx++;
      setTimeout(nextWord, interval);
    }
    setTimeout(nextWord, interval * 0.5);
  }

  // ═══════════════════════════════════════════════════════════
  // GENEL API
  // ═══════════════════════════════════════════════════════════

  function speak(text, options) {
    if (_speaking) stop();

    var opts = options || {};
    var callbacks = {
      onStart: opts.onStart || CONFIG.onStart,
      onEnd: opts.onEnd || CONFIG.onEnd,
      onBoundary: opts.onBoundary || CONFIG.onBoundary,
      onAmplitude: opts.onAmplitude || CONFIG.onAmplitude
    };

    var provider = opts.provider || CONFIG.provider;

    if (provider === 'openai') {
      speakOpenAI(text, callbacks);
    } else {
      speakWebSpeech(text, callbacks);
    }
  }

  function stop() {
    _speaking = false;
    stopAmplitudeSimulation();

    // Web Speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Ses kaynağı
    if (_audioSource) {
      try { _audioSource.stop(); } catch(e) {}
      _audioSource = null;
    }

    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio = null;
    }
  }

  function isSpeaking() {
    return _speaking;
  }

  function setConfig(overrides) {
    for (var key in overrides) {
      if (CONFIG.hasOwnProperty(key)) {
        CONFIG[key] = overrides[key];
      }
    }
  }

  function setSubtitleCallback(fn) {
    _subtitleCallback = fn;
  }

  function getConfig() {
    return {
      provider: CONFIG.provider,
      lang: CONFIG.lang,
      rate: CONFIG.rate,
      pitch: CONFIG.pitch
    };
  }

  // Web Speech için sesleri ön yükle
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
      };
    }
  }

  // ─── Dışa Aktarım ───
  window.AvatarTTS = {
    speak: speak,
    stop: stop,
    isSpeaking: isSpeaking,
    setConfig: setConfig,
    getConfig: getConfig,
    setSubtitleCallback: setSubtitleCallback,
    buildSSML: buildSSML,
    ssmlToPlainText: ssmlToPlainText
  };

})();
