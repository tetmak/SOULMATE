/**
 * NUMERAEL — Lip Sync & Animation Controller
 * Bridges TTS amplitude/phoneme data to avatar mouth and face animation.
 * Supports amplitude-based and phoneme-based modes.
 *
 * Exports: window.AvatarLipSync
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
    // Amplitude-to-mouth mapping
    amplitudeMin: 0.05,        // below this = mouth closed
    amplitudeMax: 0.6,         // above this = fully open
    smoothing: 0.35,           // lerp factor (0-1, higher = more responsive)
    // Viseme timing
    visemeDuration: 80,        // ms per viseme
    // Idle animation
    idleMicroMovement: true,   // subtle mouth twitches when idle
  };

  // Turkish phoneme-to-viseme mapping (simplified)
  // Viseme values: 0 = closed, 0.2 = slightly open, 0.5 = mid, 0.8 = wide, 1.0 = fully open
  var TURKISH_VISEMES = {
    // Vowels
    'a': 0.85, 'e': 0.7, 'ı': 0.3, 'i': 0.35,
    'o': 0.75, 'ö': 0.65, 'u': 0.5, 'ü': 0.45,
    // Consonants - grouped by mouth shape
    'b': 0.05, 'p': 0.05, 'm': 0.05,     // bilabial (lips together)
    'f': 0.15, 'v': 0.15,                 // labiodental
    'd': 0.25, 't': 0.25, 'n': 0.25,     // alveolar
    's': 0.2, 'z': 0.2, 'c': 0.2,        // sibilant
    'ş': 0.3, 'ç': 0.3, 'j': 0.3,       // post-alveolar
    'k': 0.2, 'g': 0.2, 'ğ': 0.15,      // velar
    'h': 0.4, 'r': 0.3, 'l': 0.25,       // other
    'y': 0.3, 'w': 0.4,
    ' ': 0.0, ',': 0.0, '.': 0.0         // silence
  };

  var state = {
    active: false,
    currentMouthOpen: 0,
    targetMouthOpen: 0,
    lastAmplitude: 0,
    visemeQueue: [],
    visemeTimer: null,
    renderer: null,      // reference to AvatarRenderer
    mode: 'amplitude',   // 'amplitude' | 'phoneme'
    microTimer: null
  };

  // ═══════════════════════════════════════════════════════════
  // AMPLITUDE-BASED LIP SYNC
  // ═══════════════════════════════════════════════════════════

  /**
   * Called by TTS onAmplitude callback with values 0-1
   */
  function processAmplitude(amplitude) {
    if (!state.active) return;

    // Normalize amplitude to mouth range
    var normalized = (amplitude - CONFIG.amplitudeMin) / (CONFIG.amplitudeMax - CONFIG.amplitudeMin);
    normalized = Math.max(0, Math.min(1, normalized));

    // Add some natural variation
    normalized *= (0.85 + Math.random() * 0.3);
    normalized = Math.min(1, normalized);

    state.targetMouthOpen = normalized;

    // Smooth interpolation
    state.currentMouthOpen += (state.targetMouthOpen - state.currentMouthOpen) * CONFIG.smoothing;

    // Send to renderer
    if (state.renderer) {
      state.renderer.setMouthOpen(state.currentMouthOpen);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PHONEME-BASED LIP SYNC
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate viseme sequence from text
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
        // Pause
        var pauseDuration = ch === '.' ? 200 : (ch === ',' ? 120 : 60);
        visemes.push({ char: ch, value: 0, duration: pauseDuration });
      }
    }
    return visemes;
  }

  /**
   * Play viseme sequence
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

    // Smooth update
    state.currentMouthOpen += (state.targetMouthOpen - state.currentMouthOpen) * CONFIG.smoothing;
    if (state.renderer) {
      state.renderer.setMouthOpen(state.currentMouthOpen);
    }

    state.visemeTimer = setTimeout(processNextViseme, viseme.duration);
  }

  // ═══════════════════════════════════════════════════════════
  // IDLE MICRO-MOVEMENT
  // ═══════════════════════════════════════════════════════════

  function startIdleMicro() {
    if (!CONFIG.idleMicroMovement) return;
    function tick() {
      if (state.active) return; // don't interfere during speech
      // Very subtle mouth movement (breathing, micro-expressions)
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
  // PUBLIC API
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
    // In amplitude mode, processAmplitude is called externally
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
    state.mode = mode; // 'amplitude' or 'phoneme'
  }

  function getAmplitudeHandler() {
    return processAmplitude;
  }

  function destroy() {
    stopSpeaking();
    stopIdleMicro();
    state.renderer = null;
  }

  // ─── Export ───
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
