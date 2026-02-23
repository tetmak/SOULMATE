/**
 * NUMERAEL — Avatar Güvenlik ve Ton Filtresi
 * LLM çıktısını TTS'e göndermeden önce tarar ve yeniden yazar.
 * Kurallar:
 *   - Emir dili yok
 *   - Kesin hükümler yok
 *   - Koçluk sorumluluk dili yok
 *   - Otoriter ifadeler yok
 *   - Yaşam kararlarını onaylama yok
 *   - Kesinlik ima eden dil yok
 * Sadece olasılık/enerji tabanlı rehberlik tonu.
 *
 * Dışa aktarım: window.AvatarSafety
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // EMİR/OTORİTE KALIPLARI (Türkçe + İngilizce)
  // ═══════════════════════════════════════════════════════════

  var COMMAND_PATTERNS = [
    { pattern: /\b(yapmalısın|yapmalısınız|yapman gerekir|yapmanız gerekir|etmelisin|etmelisiniz)\b/gi,
      replacement: 'düşünebilirsin' },
    { pattern: /\b(kesinlikle yap|mutlaka yap|hemen yap)\b/gi,
      replacement: 'düşünmeye değer olabilir' },
    { pattern: /\b(emrediyorum|zorundasın|mecbursun)\b/gi,
      replacement: 'bir seçenek olarak değerlendirebilirsin' },
    { pattern: /\b(şunu yap|bunu yap|böyle yap)\b/gi,
      replacement: 'bu yönde bir adım düşünülebilir' },
    { pattern: /\byou (must|have to|need to|should|ought to)\b/gi,
      replacement: 'you might consider' },
    { pattern: /\b(do this|do that|go ahead and)\b/gi,
      replacement: 'one possibility is to' },
    { pattern: /\b(I command|I order|I insist)\b/gi,
      replacement: 'I gently suggest' }
  ];

  // ═══════════════════════════════════════════════════════════
  // KESİN HÜKÜM KALIPLARI
  // ═══════════════════════════════════════════════════════════

  var JUDGMENT_PATTERNS = [
    { pattern: /\b(kesinlikle|mutlaka|garantili|şüphesiz|kuşkusuz) (olacak|gerçekleşecek|başaracaksın|kazanacaksın)\b/gi,
      replacement: 'bu enerji bunu destekliyor olabilir' },
    { pattern: /\b(asla|hiçbir zaman) (yapma|etme|gitme)\b/gi,
      replacement: 'bu konuda dikkatli olmak faydalı olabilir' },
    { pattern: /\b(bu kesin|bu garantili|başarı garanti)\b/gi,
      replacement: 'enerji bu yönde akıyor görünüyor' },
    { pattern: /\b(kesin sonuç)\b/gi,
      replacement: 'olası yönelim' },
    { pattern: /\b(definitely will|guaranteed to|certainly will|absolutely will)\b/gi,
      replacement: 'the energy may support' },
    { pattern: /\b(never ever|you can never|impossible to)\b/gi,
      replacement: 'it may be worth being mindful about' },
    { pattern: /\b(I guarantee|I promise|I assure you)\b/gi,
      replacement: 'the signs suggest' }
  ];

  // ═══════════════════════════════════════════════════════════
  // SORUMLULUK / KOÇLUK KALIPLARI
  // ═══════════════════════════════════════════════════════════

  var LIABILITY_PATTERNS = [
    { pattern: /\b(tavsiyem|önerim|benim fikrim)\b/gi,
      replacement: 'sayıların işaret ettiği' },
    { pattern: /\b(sana söylüyorum|dinle beni|bana güven)\b/gi,
      replacement: 'bu perspektiften bakıldığında' },
    { pattern: /\b(doktor|avukat|terapist|psikolog) olarak\b/gi,
      replacement: 'kozmik rehberlik açısından' },
    { pattern: /\b(my advice is|I recommend|I suggest you)\b/gi,
      replacement: 'the numbers indicate' },
    { pattern: /\b(listen to me|trust me|I'm telling you)\b/gi,
      replacement: 'from this perspective' },
    { pattern: /\b(as a (doctor|lawyer|therapist|counselor))\b/gi,
      replacement: 'from a cosmic guidance perspective' }
  ];

  // ═══════════════════════════════════════════════════════════
  // OTORİTE / KESİNLİK İFADELERİ (EK SERTLEŞTİRME)
  // ═══════════════════════════════════════════════════════════

  var AUTHORITY_PATTERNS = [
    { pattern: /\ben doğrusu\b/gi,
      replacement: 'bir perspektife göre' },
    { pattern: /\bbunu seçmelisin\b/gi,
      replacement: 'bu seçenek öne çıkıyor' },
    { pattern: /\bsenin için en iyi\b/gi,
      replacement: 'enerji açısından uyumlu görünüyor' },
    { pattern: /\bbu karar seni\b/gi,
      replacement: 'bu yönelim' },
    { pattern: /\b(en doğru|tek doğru|doğru olan)\b/gi,
      replacement: 'destekleyici olabilir' },
    { pattern: /\b(en iyi seçim|en iyi karar|en iyi yol)\b/gi,
      replacement: 'uyumlu bir seçenek' },
    { pattern: /\b(seni mutlu eder|seni başarılı yapar|hayatını değiştirir)\b/gi,
      replacement: 'destekleyici bir enerji taşıyor olabilir' },
    { pattern: /\b(the best choice|the right decision|you should choose)\b/gi,
      replacement: 'this option appears aligned' },
    { pattern: /\b(will make you happy|will change your life|will bring success)\b/gi,
      replacement: 'may carry supportive energy' }
  ];

  // ═══════════════════════════════════════════════════════════
  // REHBERLİK SON EKİ
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
      p.pattern.lastIndex = 0;
    }
    return { text: result, modified: modified };
  }

  function filter(text) {
    if (!text || typeof text !== 'string') {
      return { text: '', modified: false, issues: [] };
    }

    var issues = [];
    var result = text;
    var wasModified = false;

    var r1 = applyPatterns(result, COMMAND_PATTERNS);
    if (r1.modified) { issues.push('command_language'); wasModified = true; }
    result = r1.text;

    var r2 = applyPatterns(result, JUDGMENT_PATTERNS);
    if (r2.modified) { issues.push('definitive_judgment'); wasModified = true; }
    result = r2.text;

    var r3 = applyPatterns(result, LIABILITY_PATTERNS);
    if (r3.modified) { issues.push('liability_language'); wasModified = true; }
    result = r3.text;

    var r4 = applyPatterns(result, AUTHORITY_PATTERNS);
    if (r4.modified) { issues.push('authority_language'); wasModified = true; }
    result = r4.text;

    if (wasModified) {
      var lang = detectLanguage(result);
      var suffixes = lang === 'tr' ? GUIDANCE_SUFFIXES_TR : GUIDANCE_SUFFIXES_EN;
      var suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      if (result.indexOf('son karar') === -1 && result.indexOf('final choice') === -1) {
        result = result.trimRight();
        if (result[result.length - 1] !== '.') result += '.';
        result += suffix;
      }
    }

    return { text: result, modified: wasModified, issues: issues };
  }

  function prepareForSpeech(text) {
    var filtered = filter(text);
    return filtered.text;
  }

  function getSystemPromptGuard() {
    return [
      'ÖNEMLİ TON KURALLARI:',
      '- Asla emir kipi kullanma (yapmalısın, etmelisin, must, should).',
      '- Asla kesin tahminlerde bulunma (kesinlikle olacak, garanti, will definitely).',
      '- Asla "en doğrusu", "bunu seçmelisin", "senin için en iyi", "kesin sonuç" gibi ifadeler kullanma.',
      '- Asla "bu karar seni ... yapar" gibi nedensellik belirtme.',
      '- Her zaman olasılık dili kullan: "destekleyici olabilir", "öne çıkıyor", "uyumlu görünüyor".',
      '- Her zaman enerji tabanlı çerçevele: "enerji bu yönde akıyor", "kozmik bağ destekliyor".',
      '- Seçimin kullanıcıya ait olduğunu hatırlat.',
      '- Asla talimat verme, asla yaşam kararlarını onaylama, asla otorite veya kesinlik ima etme.',
      '- Sen bir rehbersin, otorite değil. Sakin bilgelikle konuş.',
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
