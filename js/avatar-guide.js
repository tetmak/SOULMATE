/**
 * NUMERAEL — Avatar Guide Orchestrator
 * Connects all avatar subsystems: Renderer, TTS, LipSync, Safety, Widget.
 * Provides a single API for the rest of the app to trigger avatar speech.
 *
 * Pipeline:
 *   Text → Safety Filter → TTS → LipSync → Renderer → Widget
 *
 * Exports: window.AvatarGuide
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
  // STATE
  // ═══════════════════════════════════════════════════════════
  var _initialized = false;
  var _speaking = false;
  var _queue = [];        // speech queue for sequential messages
  var _processing = false;

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  function init() {
    if (_initialized) return;

    // Wait for widget to be ready
    if (!window.AvatarWidget || !window.AvatarWidget.getFaceContainer()) {
      setTimeout(init, 200);
      return;
    }

    var container = window.AvatarWidget.getFaceContainer();
    if (!container) {
      console.warn('[AvatarGuide] No face container found');
      return;
    }

    // Start the renderer
    if (window.AvatarRenderer) {
      window.AvatarRenderer.start(container);
    }

    // Initialize lip sync with renderer
    if (window.AvatarLipSync && window.AvatarRenderer) {
      window.AvatarLipSync.init(window.AvatarRenderer);
    }

    // Set up TTS subtitle callback
    if (window.AvatarTTS) {
      window.AvatarTTS.setSubtitleCallback(function(text, wordIndex) {
        if (window.AvatarWidget) {
          window.AvatarWidget.showSubtitle(text, wordIndex);
        }
      });
    }

    _initialized = true;
    console.log('[AvatarGuide] Initialized');
  }

  // ═══════════════════════════════════════════════════════════
  // CORE SPEECH PIPELINE
  // ═══════════════════════════════════════════════════════════

  /**
   * Speak text through the avatar.
   * Full pipeline: Safety → TTS → LipSync → Render → Widget
   *
   * @param {string} text - Raw text (or SSML) to speak
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

    // Check mute
    if (window.AvatarWidget && window.AvatarWidget.isMuted()) {
      // Still show subtitle even when muted
      showSubtitleOnly(rawText, opts);
      return;
    }

    // Step 1: Safety filter
    var safeText = rawText;
    if (window.AvatarSafety) {
      safeText = window.AvatarSafety.prepareForSpeech(rawText);
    }

    _speaking = true;

    // Step 2: Notify widget
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechStart();
    }

    // Step 3: Start lip sync
    if (window.AvatarLipSync) {
      window.AvatarLipSync.startSpeaking(safeText);
    }

    // Step 4: TTS with amplitude callback for lip sync
    if (window.AvatarTTS) {
      window.AvatarTTS.speak(safeText, {
        onStart: function() {
          // Already handled above
        },
        onAmplitude: function(amplitude) {
          if (window.AvatarLipSync) {
            window.AvatarLipSync.processAmplitude(amplitude);
          }
        },
        onBoundary: function(event, wordIndex, totalWords) {
          // Word tracking handled by TTS subtitle callback
        },
        onEnd: function() {
          onSpeechComplete(opts);
        }
      });
    } else {
      // No TTS available — just show text
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

    // Auto-hide after reading time
    var readTime = Math.max(3000, safeText.length * 60);
    setTimeout(function() {
      onSpeechComplete(opts);
    }, readTime);
  }

  function onSpeechComplete(opts) {
    _speaking = false;

    // Stop lip sync
    if (window.AvatarLipSync) {
      window.AvatarLipSync.stopSpeaking();
    }

    // Notify widget
    if (window.AvatarWidget) {
      window.AvatarWidget.onSpeechEnd();
    }

    _processing = false;

    // Callback
    if (opts && opts.onComplete) {
      opts.onComplete();
    }

    // Process next in queue
    processQueue();
  }

  // ═══════════════════════════════════════════════════════════
  // STOP
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
  // HIGH-LEVEL TRIGGERS
  // These are called by other modules when events occur.
  // ═══════════════════════════════════════════════════════════

  /**
   * Called when a numerology/decision result is returned.
   * Generates guidance text and speaks it through the avatar.
   */
  function onResultReady(resultData) {
    var text = buildResultNarration(resultData);
    if (text) speak(text);
  }

  /**
   * Called when AI content is generated for a page section.
   * Avatar can optionally narrate key AI insights.
   */
  function onAIContentReady(content, pageContext) {
    // Only speak for significant content, not every section
    if (!pageContext || !pageContext.primary) return;
    var trimmed = content;
    if (trimmed.length > 200) {
      // Summarize for speech — take first 2 sentences
      var sentences = trimmed.split(/[.!?]+/).filter(function(s) { return s.trim().length > 10; });
      trimmed = sentences.slice(0, 2).join('. ') + '.';
    }
    speak(trimmed);
  }

  /**
   * Called when user submits a question/decision in Decision Sphere.
   * Avatar acknowledges and then speaks the result.
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
   * Called for compatibility analysis results.
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
  // NARRATION BUILDER
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
  // LLM INTEGRATION — Generate avatar speech via AI
  // ═══════════════════════════════════════════════════════════

  /**
   * Ask the LLM to generate avatar speech for a given context.
   * Uses safety-guarded system prompt.
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
      console.warn('[AvatarGuide] LLM generation failed:', err);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // LIFECYCLE
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

  // Auto-init
  function autoInit() {
    // Wait for all dependencies
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

  // ─── Export ───
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
