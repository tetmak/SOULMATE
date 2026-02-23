/**
 * NUMERAEL — Dudak Senkronu ve Animasyon Kontrolcüsü
 * TTS genlik/fonem verisini avatar ağız ve yüz animasyonuna bağlar.
 * Genlik tabanlı ve fonem tabanlı modları destekler.
 *
 * Dışa aktarım: window.AvatarLipSync
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // YAPILANDIRMA
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
    // Genlik-ağız eşlemesi
    amplitudeMin: 0.05,        // bunun altında = ağız kapalı
    amplitudeMax: 0.6,         // bunun üstünde = tamamen açık
    smoothing: 0.35,           // geçiş faktörü (0-1, yüksek = daha duyarlı)
    // Vizem zamanlaması
    visemeDuration: 80,        // vizem başına ms
    // Bekleme animasyonu
    idleMicroMovement: true,   // beklemedeyken hafif ağız kıpırdanması
  };

  // Türkçe fonem-vizem eşlemesi (basitleştirilmiş)
  // Vizem değerleri: 0 = kapalı, 0.2 = hafif açık, 0.5 = orta, 0.8 = geniş, 1.0 = tamamen açık
  var TURKISH_VISEMES = {
    // Ünlüler
    'a': 0.85, 'e': 0.7, 'ı': 0.3, 'i': 0.35,
    'o': 0.75, 'ö': 0.65, 'u': 0.5, 'ü': 0.45,
    // Ünsüzler — ağız şekline göre gruplandırılmış
    'b': 0.05, 'p': 0.05, 'm': 0.05,     // çift dudak (dudaklar birleşik)
    'f': 0.15, 'v': 0.15,                 // dudak-diş
    'd': 0.25, 't': 0.25, 'n': 0.25,     // diş eti
    's': 0.2, 'z': 0.2, 'c': 0.2,        // ıslıklı
    'ş': 0.3, 'ç': 0.3, 'j': 0.3,       // art diş eti
    'k': 0.2, 'g': 0.2, 'ğ': 0.15,      // art damak
    'h': 0.4, 'r': 0.3, 'l': 0.25,       // diğer
    'y': 0.3, 'w': 0.4,
    ' ': 0.0, ',': 0.0, '.': 0.0         // sessizlik
  };

  var state = {
    active: false,
    currentMouthOpen: 0,
    targetMouthOpen: 0,
    lastAmplitude: 0,
    visemeQueue: [],
    visemeTimer: null,
    renderer: null,      // AvatarRenderer referansı
    mode: 'amplitude',   // 'amplitude' | 'phoneme'
    microTimer: null
  };

  // ═══════════════════════════════════════════════════════════
  // GENLİK TABANLI DUDAK SENKRONU
  // ═══════════════════════════════════════════════════════════

  /**
   * TTS onAmplitude geri çağırması tarafından 0-1 değerlerle çağrılır
   */
  function processAmplitude(amplitude) {
    if (!state.active) return;

    // Genliği ağız aralığına normalize et
    var normalized = (amplitude - CONFIG.amplitudeMin) / (CONFIG.amplitudeMax - CONFIG.amplitudeMin);
    normalized = Math.max(0, Math.min(1, normalized));

    // Doğal varyasyon ekle
    normalized *= (0.85 + Math.random() * 0.3);
    normalized = Math.min(1, normalized);

    state.targetMouthOpen = normalized;

    // Yumuşak geçiş
    state.currentMouthOpen += (state.targetMouthOpen - state.currentMouthOpen) * CONFIG.smoothing;

    // Görüntü motoruna gönder
    if (state.renderer) {
      state.renderer.setMouthOpen(state.currentMouthOpen);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FONEM TABANLI DUDAK SENKRONU
  // ═══════════════════════════════════════════════════════════

  /**
   * Metinden vizem dizisi üret
   */
  function textToVisemes(text) {
    var visemes = [];
    var lower = text.toLowerCase();
    for (var i = 0; i < lower.length; i++) {
      var ch = lower[i];
      var value = TURKISH_VISEMES[ch];
      if (value !== undefined) {
        visemes.push({ char: ch, value: value, duration: CONFIG.visemeDuration });
      } else if (ch === ' ' || ch === '.' || ch === ',') {
        // Duraklama
        var pauseDuration = ch === '.' ? 200 : (ch === ',' ? 120 : 60);
        visemes.push({ char: ch, value: 0, duration: pauseDuration });
      }
    }
    return visemes;
  }

  /**
   * Vizem dizisini oynat
   */
  function playVisemes(visemes) {
    state.visemeQueue = visemes.slice();
    processNextViseme();
  }

  function processNextViseme() {
    if (!state.active || state.visemeQueue.length === 0) {
      if (state.renderer) state.renderer.setMouthOpen(0);
      return;
    }

    var viseme = state.visemeQueue.shift();
    state.targetMouthOpen = viseme.value;

    // Yumuşak güncelleme
    state.currentMouthOpen += (state.targetMouthOpen - state.currentMouthOpen) * CONFIG.smoothing;
    if (state.renderer) {
      state.renderer.setMouthOpen(state.currentMouthOpen);
    }

    state.visemeTimer = setTimeout(processNextViseme, viseme.duration);
  }

  // ═══════════════════════════════════════════════════════════
  // BEKLEME MİKRO HAREKETİ
  // ═══════════════════════════════════════════════════════════

  function startIdleMicro() {
    if (!CONFIG.idleMicroMovement) return;
    function tick() {
      if (state.active) return; // konuşma sırasında karışma
      // Çok hafif ağız hareketi (nefes, mikro ifadeler)
      var micro = Math.sin(Date.now() * 0.001) * 0.02 + Math.random() * 0.01;
      if (state.renderer) {
        state.renderer.setMouthOpen(Math.max(0, micro));
      }
      state.microTimer = setTimeout(tick, 200 + Math.random() * 300);
    }
    tick();
  }

  function stopIdleMicro() {
    if (state.microTimer) {
      clearTimeout(state.microTimer);
      state.microTimer = null;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GENEL API
  // ═══════════════════════════════════════════════════════════

  function init(renderer) {
    state.renderer = renderer;
    startIdleMicro();
  }

  function startSpeaking(text) {
    state.active = true;
    stopIdleMicro();

    if (state.renderer) {
      state.renderer.setSpeaking(true);
    }

    if (state.mode === 'phoneme' && text) {
      var visemes = textToVisemes(text);
      playVisemes(visemes);
    }
    // Genlik modunda processAmplitude dışarıdan çağrılır
  }

  function stopSpeaking() {
    state.active = false;
    state.currentMouthOpen = 0;
    state.targetMouthOpen = 0;

    if (state.visemeTimer) {
      clearTimeout(state.visemeTimer);
      state.visemeTimer = null;
    }
    state.visemeQueue = [];

    if (state.renderer) {
      state.renderer.setMouthOpen(0);
      state.renderer.setSpeaking(false);
    }

    startIdleMicro();
  }

  function setMode(mode) {
    state.mode = mode; // 'amplitude' veya 'phoneme'
  }

  function getAmplitudeHandler() {
    return processAmplitude;
  }

  function destroy() {
    stopSpeaking();
    stopIdleMicro();
    state.renderer = null;
  }

  // ─── Dışa Aktarım ───
  window.AvatarLipSync = {
    init: init,
    startSpeaking: startSpeaking,
    stopSpeaking: stopSpeaking,
    processAmplitude: processAmplitude,
    setMode: setMode,
    getAmplitudeHandler: getAmplitudeHandler,
    textToVisemes: textToVisemes,
    destroy: destroy
  };

})();
