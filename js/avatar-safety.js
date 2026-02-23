/**
 * NUMERAEL — Avatar Güvenlik ve Ton Filtresi
 * LLM çıktısını TTS'e göndermeden önce tarar ve yeniden yazar:
 * - Emir dili yok ("yapmalısın", "şunu yap", "you must")
 * - Kesin hükümler yok ("kesinlikle olacak", "garanti", "guaranteed")
 * - Koçluk sorumluluk dili yok ("tavsiyem", "bana güven", "I recommend")
 * - Sadece rehberlik tonu, otoriter olmayan
 *
 * Dışa aktarım: window.AvatarSafety
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // EMİR/OTORİTE KALIPLARİ (Türkçe + İngilizce)
  // ═══════════════════════════════════════════════════════════

  var COMMAND_PATTERNS = [
    // Türkçe emir kalıpları
    { pattern: /\b(yapmalısın|yapmalısınız|yapman gerekir|yapmanız gerekir|etmelisin|etmelisiniz)\b/gi,
      replacement: 'düşünebilirsin' },
    { pattern: /\b(kesinlikle yap|mutlaka yap|hemen yap)\b/gi,
      replacement: 'düşünmeye değer olabilir' },
    { pattern: /\b(emrediyorum|zorundasın|mecbursun)\b/gi,
      replacement: 'bir seçenek olarak değerlendirebilirsin' },
    { pattern: /\b(şunu yap|bunu yap|böyle yap)\b/gi,
      replacement: 'bu yönde bir adım düşünülebilir' },

    // İngilizce emir kalıpları
    { pattern: /\byou (must|have to|need to|should|ought to)\b/gi,
      replacement: 'you might consider' },
    { pattern: /\b(do this|do that|go ahead and)\b/gi,
      replacement: 'one possibility is to' },
    { pattern: /\b(I command|I order|I insist)\b/gi,
      replacement: 'I gently suggest' }
  ];

  var JUDGMENT_PATTERNS = [
    // Türkçe kesin hüküm ifadeleri
    { pattern: /\b(kesinlikle|mutlaka|garantili|şüphesiz|kuşkusuz) (olacak|gerçekleşecek|başaracaksın|kazanacaksın)\b/gi,
      replacement: 'bu enerji bunu destekliyor olabilir' },
    { pattern: /\b(asla|hiçbir zaman) (yapma|etme|gitme)\b/gi,
      replacement: 'bu konuda dikkatli olmak faydalı olabilir' },
    { pattern: /\b(bu kesin|bu garantili|başarı garanti)\b/gi,
      replacement: 'enerji bu yönde akıyor görünüyor' },

    // İngilizce kesin hüküm ifadeleri
    { pattern: /\b(definitely will|guaranteed to|certainly will|absolutely will)\b/gi,
      replacement: 'the energy may support' },
    { pattern: /\b(never ever|you can never|impossible to)\b/gi,
      replacement: 'it may be worth being mindful about' },
    { pattern: /\b(I guarantee|I promise|I assure you)\b/gi,
      replacement: 'the signs suggest' }
  ];

  var LIABILITY_PATTERNS = [
    // Türkçe koçluk/tavsiye kalıpları
    { pattern: /\b(tavsiyem|önerim|benim fikrim)\b/gi,
      replacement: 'sayıların işaret ettiği' },
    { pattern: /\b(sana söylüyorum|dinle beni|bana güven)\b/gi,
      replacement: 'bu perspektiften bakıldığında' },
    { pattern: /\b(doktor|avukat|terapist|psikolog) olarak\b/gi,
      replacement: 'kozmik rehberlik açısından' },

    // İngilizce koçluk kalıpları
    { pattern: /\b(my advice is|I recommend|I suggest you)\b/gi,
      replacement: 'the numbers indicate' },
    { pattern: /\b(listen to me|trust me|I'm telling you)\b/gi,
      replacement: 'from this perspective' },
    { pattern: /\b(as a (doctor|lawyer|therapist|counselor))\b/gi,
      replacement: 'from a cosmic guidance perspective' }
  ];

  // ═══════════════════════════════════════════════════════════
  // REHBERLİK SON EKİ — otoriter ton algılandığında eklenir
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
  // ANA FİLTRELEME
  // ═══════════════════════════════════════════════════════════

  function detectLanguage(text) {
    // Basit sezgisel: Türkçe karakter kontrolü
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
      // Regex lastIndex sıfırla (global flag)
      p.pattern.lastIndex = 0;
    }
    return { text: result, modified: modified };
  }

  /**
   * Ana filtre fonksiyonu.
   * Döndürür: { text: filtrelenmisMeyin, modified: bool, issues: string[] }
   */
  function filter(text) {
    if (!text || typeof text !== 'string') {
      return { text: '', modified: false, issues: [] };
    }

    var issues = [];
    var result = text;
    var wasModified = false;

    // Emir kalıplarını uygula
    var r1 = applyPatterns(result, COMMAND_PATTERNS);
    if (r1.modified) {
      issues.push('command_language');
      wasModified = true;
    }
    result = r1.text;

    // Hüküm kalıplarını uygula
    var r2 = applyPatterns(result, JUDGMENT_PATTERNS);
    if (r2.modified) {
      issues.push('definitive_judgment');
      wasModified = true;
    }
    result = r2.text;

    // Sorumluluk kalıplarını uygula
    var r3 = applyPatterns(result, LIABILITY_PATTERNS);
    if (r3.modified) {
      issues.push('liability_language');
      wasModified = true;
    }
    result = r3.text;

    // Metin değiştirildiyse rehberlik son eki ekle
    if (wasModified) {
      var lang = detectLanguage(result);
      var suffixes = lang === 'tr' ? GUIDANCE_SUFFIXES_TR : GUIDANCE_SUFFIXES_EN;
      var suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      // Benzer ifadeyle zaten bitmiyorsa ekle
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
   * Avatar konuşması için metni hazırla — filtre uygula ve TTS için biçimlendir
   */
  function prepareForSpeech(text) {
    var filtered = filter(text);
    return filtered.text;
  }

  /**
   * LLM için güvenli sistem prompt öneki oluştur
   */
  function getSystemPromptGuard() {
    return [
      'ÖNEMLİ TON KURALLARI:',
      '- Asla emir kipi kullanma (yapmalısın, etmelisin, must, should).',
      '- Asla kesin tahminlerde bulunma (kesinlikle olacak, garanti, will definitely).',
      '- Her zaman rehberlik olarak çerçevele: "enerji bunu destekliyor", "bir perspektif şu ki".',
      '- Seçimin kullanıcıya ait olduğunu hatırlat.',
      '- Sen bir rehbersin, otorite değil. Sakin bilgelikle konuş, talimatla değil.',
      '- Ton: sıcak, nötr, yargılayıcı olmayan, kozmik.'
    ].join('\n');
  }

  // ─── Dışa Aktarım ───
  window.AvatarSafety = {
    filter: filter,
    prepareForSpeech: prepareForSpeech,
    getSystemPromptGuard: getSystemPromptGuard
  };

})();
