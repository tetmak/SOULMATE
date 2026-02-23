/**
 * NUMERAEL — TTS Abstraction Layer
 * Provider-agnostic Text-to-Speech with SSML support.
 * Supports: Web Speech API (default), OpenAI TTS (via server proxy), custom providers.
 *
 * Exports: window.AvatarTTS
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
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
    provider: 'webspeech',   // 'webspeech' | 'openai' | 'custom'
    lang: 'tr-TR',
    rate: 0.92,
    pitch: 1.0,
    volume: 0.85,
    // OpenAI TTS settings
    openaiModel: 'tts-1',
    openaiVoice: 'nova',     // calm, warm voice
    // Callbacks
    onStart: null,
    onEnd: null,
    onBoundary: null,        // word boundary events
    onAmplitude: null        // amplitude data for lip sync
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
  // SSML PROCESSING
  // ═══════════════════════════════════════════════════════════

  /**
   * Convert SSML-like markup to plain text for Web Speech API.
   * Preserves pause intent by inserting commas/periods.
   */
  function ssmlToPlainText(ssml) {
    if (!ssml) return '';
    var text = ssml;
    // Remove <speak> wrapper
    text = text.replace(/<\/?speak>/gi, '');
    // Convert <break> to pauses (commas)
    text = text.replace(/<break[^>]*time=["'](\d+)ms["'][^>]*\/?\s*>/gi, function(_, ms) {
      return parseInt(ms) > 300 ? '. ' : ', ';
    });
    text = text.replace(/<break[^>]*\/?\s*>/gi, ', ');
    // Convert <emphasis> — keep inner text
    text = text.replace(/<emphasis[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1');
    // Convert <prosody> — keep inner text
    text = text.replace(/<prosody[^>]*>([\s\S]*?)<\/prosody>/gi, '$1');
    // Remove any remaining tags
    text = text.replace(/<[^>]+>/g, '');
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  /**
   * Build SSML string from text with options
   */
  function buildSSML(text, options) {
    var ssml = '<speak>';
    if (options && options.soft) {
      ssml += '<prosody rate="slow" pitch="-2st" volume="soft">';
    }
    // Add pauses after sentences
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
  // WEB SPEECH API PROVIDER
  // ═══════════════════════════════════════════════════════════

  function speakWebSpeech(text, callbacks) {
    if (!window.speechSynthesis) {
      console.warn('[AvatarTTS] Web Speech API not available');
      if (callbacks.onEnd) callbacks.onEnd();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    var plainText = ssmlToPlainText(text);
    _utterance = new SpeechSynthesisUtterance(plainText);
    _utterance.lang = CONFIG.lang;
    _utterance.rate = CONFIG.rate;
    _utterance.pitch = CONFIG.pitch;
    _utterance.volume = CONFIG.volume;

    // Try to find a Turkish voice
    var voices = window.speechSynthesis.getVoices();
    var trVoice = null;
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.indexOf('tr') === 0) {
        trVoice = voices[i];
        break;
      }
    }
    if (trVoice) _utterance.voice = trVoice;

    // Word tracking for subtitles
    var words = plainText.split(/\s+/);
    var wordIndex = 0;

    _utterance.onstart = function() {
      _speaking = true;
      if (callbacks.onStart) callbacks.onStart();
      if (_subtitleCallback) _subtitleCallback(plainText, 0);
      // Start amplitude simulation for Web Speech (no actual audio analysis)
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
      console.warn('[AvatarTTS] Speech error:', e.error);
      _speaking = false;
      stopAmplitudeSimulation();
      if (callbacks.onEnd) callbacks.onEnd();
    };

    window.speechSynthesis.speak(_utterance);
  }

  // ═══════════════════════════════════════════════════════════
  // OPENAI TTS PROVIDER (via server proxy)
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
      if (!res.ok) throw new Error('TTS API error: ' + res.status);
      return res.arrayBuffer();
    })
    .then(function(buffer) {
      playAudioBuffer(buffer, plainText, callbacks);
    })
    .catch(function(err) {
      console.warn('[AvatarTTS] OpenAI TTS failed, falling back to Web Speech:', err);
      speakWebSpeech(text, callbacks);
    });
  }

  function playAudioBuffer(buffer, text, callbacks) {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    _audioCtx.decodeAudioData(buffer.slice(0), function(audioBuffer) {
      // Create source
      _audioSource = _audioCtx.createBufferSource();
      _audioSource.buffer = audioBuffer;

      // Create analyser for amplitude
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

      // Start real amplitude analysis
      startAmplitudeAnalysis(callbacks.onAmplitude);

      // Simulate word boundaries based on duration
      simulateWordBoundaries(text, audioBuffer.duration, callbacks.onBoundary);
    }, function(err) {
      console.warn('[AvatarTTS] Audio decode error:', err);
      if (callbacks.onEnd) callbacks.onEnd();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // AMPLITUDE ANALYSIS
  // ═══════════════════════════════════════════════════════════

  function startAmplitudeAnalysis(onAmplitude) {
    if (!_analyser || !onAmplitude) return;
    var dataArray = new Uint8Array(_analyser.frequencyBinCount);

    function tick() {
      if (!_speaking) return;
      _analyser.getByteFrequencyData(dataArray);
      // Calculate average amplitude
      var sum = 0;
      for (var i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      var avg = sum / dataArray.length / 255; // 0-1 normalized
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
   * Simulate amplitude for Web Speech API (no direct audio access)
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
      // Generate naturalistic amplitude variation
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
    stopAmplitudeAnalysis(); // same cleanup
  }

  /**
   * Simulate word boundaries based on audio duration
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
  // PUBLIC API
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

    // Audio source
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

  // Pre-load voices for Web Speech
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
      };
    }
  }

  // ─── Export ───
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
