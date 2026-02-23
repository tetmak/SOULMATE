/**
 * NUMERAEL — Avatar Safety & Tone Filter
 * Scans and rewrites LLM output before TTS to ensure:
 * - No commands ("you must", "you should", "do this")
 * - No definitive judgments ("this will definitely", "guaranteed")
 * - No coaching liability language ("I recommend", "my advice")
 * - Guidance-only, non-authoritative tone
 *
 * Exports: window.AvatarSafety
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // COMMAND/AUTHORITY PATTERNS (Turkish + English)
  // ═══════════════════════════════════════════════════════════

  var COMMAND_PATTERNS = [
    // Turkish command forms
    { pattern: /\b(yapmalısın|yapmalısınız|yapman gerekir|yapmanız gerekir|etmelisin|etmelisiniz)\b/gi,
      replacement: 'düşünebilirsin' },
    { pattern: /\b(kesinlikle yap|mutlaka yap|hemen yap)\b/gi,
      replacement: 'düşünmeye değer olabilir' },
    { pattern: /\b(emrediyorum|zorundasın|mecbursun)\b/gi,
      replacement: 'bir seçenek olarak değerlendirebilirsin' },
    { pattern: /\b(şunu yap|bunu yap|böyle yap)\b/gi,
      replacement: 'bu yönde bir adım düşünülebilir' },

    // English command forms
    { pattern: /\byou (must|have to|need to|should|ought to)\b/gi,
      replacement: 'you might consider' },
    { pattern: /\b(do this|do that|go ahead and)\b/gi,
      replacement: 'one possibility is to' },
    { pattern: /\b(I command|I order|I insist)\b/gi,
      replacement: 'I gently suggest' }
  ];

  var JUDGMENT_PATTERNS = [
    // Turkish definitive statements
    { pattern: /\b(kesinlikle|mutlaka|garantili|şüphesiz|kuşkusuz) (olacak|gerçekleşecek|başaracaksın|kazanacaksın)\b/gi,
      replacement: 'bu enerji bunu destekliyor olabilir' },
    { pattern: /\b(asla|hiçbir zaman) (yapma|etme|gitme)\b/gi,
      replacement: 'bu konuda dikkatli olmak faydalı olabilir' },
    { pattern: /\b(bu kesin|bu garantili|başarı garanti)\b/gi,
      replacement: 'enerji bu yönde akıyor görünüyor' },

    // English definitive statements
    { pattern: /\b(definitely will|guaranteed to|certainly will|absolutely will)\b/gi,
      replacement: 'the energy may support' },
    { pattern: /\b(never ever|you can never|impossible to)\b/gi,
      replacement: 'it may be worth being mindful about' },
    { pattern: /\b(I guarantee|I promise|I assure you)\b/gi,
      replacement: 'the signs suggest' }
  ];

  var LIABILITY_PATTERNS = [
    // Turkish coaching/advice patterns
    { pattern: /\b(tavsiyem|önerim|benim fikrim)\b/gi,
      replacement: 'sayıların işaret ettiği' },
    { pattern: /\b(sana söylüyorum|dinle beni|bana güven)\b/gi,
      replacement: 'bu perspektiften bakıldığında' },
    { pattern: /\b(doktor|avukat|terapist|psikolog) olarak\b/gi,
      replacement: 'kozmik rehberlik açısından' },

    // English coaching patterns
    { pattern: /\b(my advice is|I recommend|I suggest you)\b/gi,
      replacement: 'the numbers indicate' },
    { pattern: /\b(listen to me|trust me|I'm telling you)\b/gi,
      replacement: 'from this perspective' },
    { pattern: /\b(as a (doctor|lawyer|therapist|counselor))\b/gi,
      replacement: 'from a cosmic guidance perspective' }
  ];

  // ═══════════════════════════════════════════════════════════
  // GUIDANCE SUFFIX — appended when authoritative tone detected
  // ═══════════════════════════════════════════════════════════
  var GUIDANCE_SUFFIXES_TR = [
    ' Son karar her zaman sana ait.',
    ' Bu bir rehberlik, kesin bir yönerge değil.',
    ' Kendi iç sesini de dinlemeyi unutma.',
    ' Bu bilgiyi kendi sezginle harmanla.'
  ];

  var GUIDANCE_SUFFIXES_EN = [
    ' The final choice remains yours.',
    ' This is guidance, not a directive.',
    ' Trust your own intuition as well.',
    ' Blend this with your inner knowing.'
  ];

  // ═══════════════════════════════════════════════════════════
  // CORE FILTERING
  // ═══════════════════════════════════════════════════════════

  function detectLanguage(text) {
    // Simple heuristic: check for Turkish characters
    var trChars = /[çğıöşüÇĞİÖŞÜ]/;
    return trChars.test(text) ? 'tr' : 'en';
  }

  function applyPatterns(text, patterns) {
    var modified = false;
    var result = text;
    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      if (p.pattern.test(result)) {
        modified = true;
        result = result.replace(p.pattern, p.replacement);
      }
      // Reset regex lastIndex (global flag)
      p.pattern.lastIndex = 0;
    }
    return { text: result, modified: modified };
  }

  /**
   * Main filter function.
   * Returns { text: filteredText, modified: bool, issues: string[] }
   */
  function filter(text) {
    if (!text || typeof text !== 'string') {
      return { text: '', modified: false, issues: [] };
    }

    var issues = [];
    var result = text;
    var wasModified = false;

    // Apply command patterns
    var r1 = applyPatterns(result, COMMAND_PATTERNS);
    if (r1.modified) {
      issues.push('command_language');
      wasModified = true;
    }
    result = r1.text;

    // Apply judgment patterns
    var r2 = applyPatterns(result, JUDGMENT_PATTERNS);
    if (r2.modified) {
      issues.push('definitive_judgment');
      wasModified = true;
    }
    result = r2.text;

    // Apply liability patterns
    var r3 = applyPatterns(result, LIABILITY_PATTERNS);
    if (r3.modified) {
      issues.push('liability_language');
      wasModified = true;
    }
    result = r3.text;

    // If text was modified, append a guidance suffix
    if (wasModified) {
      var lang = detectLanguage(result);
      var suffixes = lang === 'tr' ? GUIDANCE_SUFFIXES_TR : GUIDANCE_SUFFIXES_EN;
      var suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      // Only append if the text doesn't already end with a similar phrase
      if (result.indexOf('son karar') === -1 && result.indexOf('final choice') === -1) {
        result = result.trimRight();
        if (result[result.length - 1] !== '.') result += '.';
        result += suffix;
      }
    }

    return {
      text: result,
      modified: wasModified,
      issues: issues
    };
  }

  /**
   * Wrap text for avatar speech — applies filter and formats for TTS
   */
  function prepareForSpeech(text) {
    var filtered = filter(text);
    return filtered.text;
  }

  /**
   * Build a safe system prompt prefix for the LLM
   */
  function getSystemPromptGuard() {
    return [
      'IMPORTANT TONE RULES:',
      '- Never use commands (must, should, have to, yapmalısın, etmelisin).',
      '- Never make definitive predictions (will definitely, guaranteed, kesinlikle olacak).',
      '- Always frame as guidance: "the energy suggests", "one perspective is", "enerji bunu destekliyor".',
      '- End with reminding the user that the choice is theirs.',
      '- You are a guide, not an authority. Speak with calm wisdom, not instruction.',
      '- Tone: warm, neutral, non-judgmental, cosmic.'
    ].join('\n');
  }

  // ─── Export ───
  window.AvatarSafety = {
    filter: filter,
    prepareForSpeech: prepareForSpeech,
    getSystemPromptGuard: getSystemPromptGuard
  };

})();
