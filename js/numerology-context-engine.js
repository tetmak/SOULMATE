/**
 * KADER — Numerology Context Engine v1.0
 * Context-aware weighting + modular interpretation assembly
 *
 * Mevcut hesaplamaları DEĞİŞTİRMEZ. Üstüne bağlam katmanı ekler.
 * Aynı sayılar, farklı zaman bağlamı ve karmik durumda farklı yorumlar üretir.
 *
 * Kullanım:
 *   var ctx = NumerologyContext.buildContext({ life_path, expression_number, ... })
 *   var interp = await NumerologyContext.getInterpretation(ctx)
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // SAYI TEMA HARİTASI
  // ═══════════════════════════════════════════════════════════
  var NUMBER_THEMES = {
    1:  { core: ['leadership', 'independence', 'initiative'],      tension: ['isolation', 'stubbornness'],    element: 'fire' },
    2:  { core: ['diplomacy', 'sensitivity', 'cooperation'],       tension: ['indecision', 'dependency'],     element: 'water' },
    3:  { core: ['creativity', 'expression', 'joy'],               tension: ['scattered_energy', 'superficiality'], element: 'air' },
    4:  { core: ['discipline', 'structure', 'reliability'],        tension: ['rigidity', 'overwork'],         element: 'earth' },
    5:  { core: ['freedom', 'adventure', 'change'],                tension: ['restlessness', 'excess'],       element: 'air' },
    6:  { core: ['responsibility', 'nurturing', 'harmony'],        tension: ['control', 'self_sacrifice'],    element: 'earth' },
    7:  { core: ['analysis', 'intuition', 'introspection'],         tension: ['withdrawal', 'overthinking'],   element: 'water' },
    8:  { core: ['power', 'ambition', 'material_mastery'],         tension: ['domination', 'workaholism'],    element: 'earth' },
    9:  { core: ['compassion', 'wisdom', 'completion'],             tension: ['martyrdom', 'aloofness'],       element: 'fire' },
    11: { core: ['intuition', 'illumination', 'analytical_bridge'], tension: ['anxiety', 'nervous_energy'],    element: 'ether' },
    22: { core: ['master_building', 'vision', 'large_scale'],      tension: ['overwhelm', 'impracticality'],  element: 'ether' },
    33: { core: ['master_teaching', 'pure_love', 'guidance'],      tension: ['emotional_burden', 'martyrdom'],element: 'ether' }
  };

  // ═══════════════════════════════════════════════════════════
  // KARMİK BORÇ TEMA ETKİSİ
  // ═══════════════════════════════════════════════════════════
  var KARMIC_OVERLAYS = {
    13: { themes: ['discipline', 'persistence', 'hard_work'],      pressure: ['laziness', 'shortcuts'],            weight: 0.3 },
    14: { themes: ['moderation', 'self_control', 'balance'],       pressure: ['addiction', 'excess', 'instability'], weight: 0.3 },
    16: { themes: ['humility', 'personal_growth', 'surrender'],    pressure: ['ego', 'arrogance', 'fall_from_grace'], weight: 0.3 },
    19: { themes: ['shared_leadership', 'asking_help', 'service'], pressure: ['power_abuse', 'isolation', 'tyranny'], weight: 0.3 }
  };

  // ═══════════════════════════════════════════════════════════
  // KİŞİSEL YIL / AY / GÜN HESABI
  // ═══════════════════════════════════════════════════════════
  function reduce(n) {
    if (n === 11 || n === 22 || n === 33) return n;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function(a, d) { return a + parseInt(d); }, 0);
    }
    return n;
  }

  /**
   * Kişisel yıl: Doğum günü + Doğum ayı + Mevcut yıl rakamları toplamı
   */
  function calcPersonalYear(birthDate, referenceDate) {
    if (!birthDate) return null;
    var ref = referenceDate || new Date();
    var parts = birthDate.replace(/\D/g, '');
    if (parts.length < 4) return null;

    // birthDate format: YYYY-MM-DD veya YYYYMMDD
    var bParts = birthDate.split('-');
    var birthMonth, birthDay;
    if (bParts.length === 3) {
      birthMonth = parseInt(bParts[1]);
      birthDay = parseInt(bParts[2]);
    } else {
      birthMonth = parseInt(parts.substring(4, 6));
      birthDay = parseInt(parts.substring(6, 8));
    }

    var currentYear = ref.getFullYear();
    // Doğum günü + Doğum ayı + Mevcut yıl rakamları topla
    var sum = birthDay + birthMonth;
    var yearDigits = String(currentYear).split('');
    for (var i = 0; i < yearDigits.length; i++) sum += parseInt(yearDigits[i]);
    return reduce(sum);
  }

  /**
   * Kişisel ay: Kişisel yıl + Mevcut ay
   */
  function calcPersonalMonth(birthDate, referenceDate) {
    var ref = referenceDate || new Date();
    var py = calcPersonalYear(birthDate, ref);
    if (!py) return null;
    var currentMonth = ref.getMonth() + 1;
    return reduce(py + currentMonth);
  }

  /**
   * Kişisel gün: Kişisel ay + Mevcut gün
   */
  function calcPersonalDay(birthDate, referenceDate) {
    var ref = referenceDate || new Date();
    var pm = calcPersonalMonth(birthDate, ref);
    if (!pm) return null;
    var currentDay = ref.getDate();
    return reduce(pm + currentDay);
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 1: CONTEXT WEIGHTING LAYER
  // ═══════════════════════════════════════════════════════════

  /**
   * buildContext — Mevcut hesaplanmış sayıları alır, üzerine bağlam katmanı ekler.
   * Hesaplamaya DOKUNMAZ, sadece ağırlıklı bağlam nesnesi üretir.
   *
   * @param {Object} input
   *   - life_path {number}
   *   - personality_number {number}
   *   - expression_number {number}
   *   - soul_urge {number}
   *   - karmic_debt {number|null}  (13, 14, 16, 19 veya null)
   *   - birthDate {string}         (YYYY-MM-DD)
   * @returns {Object} weighted context
   */
  function buildContext(input) {
    var lp = input.life_path;
    var pers = input.personality_number;
    var expr = input.expression_number;
    var soul = input.soul_urge;
    var karmic = input.karmic_debt || null;
    var birthDate = input.birthDate || null;

    // Kişisel dönem sayıları
    var now = new Date();
    var personalYear = birthDate ? calcPersonalYear(birthDate, now) : null;
    var personalMonth = birthDate ? calcPersonalMonth(birthDate, now) : null;
    var personalDay = birthDate ? calcPersonalDay(birthDate, now) : null;

    // --- Tema toplama ---
    var lpThemes = NUMBER_THEMES[lp] || NUMBER_THEMES[1];
    var soulThemes = NUMBER_THEMES[soul] || NUMBER_THEMES[1];
    var exprThemes = NUMBER_THEMES[expr] || NUMBER_THEMES[1];
    var persThemes = NUMBER_THEMES[pers] || NUMBER_THEMES[1];

    // Base dominant themes — Life Path ağırlıklı
    var dominant_themes = lpThemes.core.slice();
    var tension_areas = lpThemes.tension.slice();
    var growth_keys = [];

    // Soul Urge ve Expression etkisi
    soulThemes.core.forEach(function(t) { if (dominant_themes.indexOf(t) === -1) dominant_themes.push(t); });
    exprThemes.tension.forEach(function(t) { if (tension_areas.indexOf(t) === -1) tension_areas.push(t); });

    // --- Intensity hesabı ---
    var intensity = 1.0;

    // Master number kontrolü — intensity artır, tema DEĞİŞMEZ
    if (lp === 11 || lp === 22 || lp === 33) intensity += 0.4;
    if (soul === 11 || soul === 22 || soul === 33) intensity += 0.2;
    if (expr === 11 || expr === 22 || expr === 33) intensity += 0.2;

    // Karmic debt etkisi — +0.3 ağırlık + ilgili temalar
    var karmic_layer = null;
    if (karmic && KARMIC_OVERLAYS[karmic]) {
      var overlay = KARMIC_OVERLAYS[karmic];
      intensity += overlay.weight;
      overlay.themes.forEach(function(t) {
        if (dominant_themes.indexOf(t) === -1) dominant_themes.push(t);
        growth_keys.push(t);
      });
      overlay.pressure.forEach(function(t) {
        if (tension_areas.indexOf(t) === -1) tension_areas.push(t);
      });
      karmic_layer = {
        debt: karmic,
        label: karmic + '/' + reduce(karmic),
        themes: overlay.themes,
        pressure: overlay.pressure
      };
    }

    // Kişisel yıl etkisi
    var period_emphasis = null;
    if (personalYear) {
      var yearThemes = NUMBER_THEMES[personalYear] || NUMBER_THEMES[1];
      period_emphasis = {
        personal_year: personalYear,
        personal_month: personalMonth,
        personal_day: personalDay,
        year_themes: yearThemes.core,
        year_tension: yearThemes.tension
      };

      // Yıl bazlı intensity ayarı
      if (personalYear === 1 || personalYear === 9) {
        // Başlangıç/bitiş yılları — yüksek enerji
        intensity += 0.4;
      } else if (personalYear === 8) {
        // Güç ve maddi gerçekleşme yılı
        intensity += 0.3;
      } else if (personalYear === 11 || personalYear === 22) {
        // Master yıl — spiritüel yoğunluk
        intensity += 0.35;
      } else {
        intensity += 0.2;
      }

      // Yıl temaları ile ana temaların örtüşmesi
      yearThemes.core.forEach(function(t) {
        if (dominant_themes.indexOf(t) !== -1) {
          // Aynı tema hem doğumda hem dönemde → güçlenir
          intensity += 0.1;
        }
      });
    }

    // Growth keys oluştur — tension'dan türet
    if (growth_keys.length === 0) {
      // LP tension alanlarının tersi
      if (tension_areas.indexOf('rigidity') !== -1) growth_keys.push('flexibility');
      if (tension_areas.indexOf('isolation') !== -1) growth_keys.push('connection');
      if (tension_areas.indexOf('excess') !== -1) growth_keys.push('moderation');
      if (tension_areas.indexOf('control') !== -1) growth_keys.push('letting_go');
      if (tension_areas.indexOf('overthinking') !== -1) growth_keys.push('trust_intuition');
      if (tension_areas.indexOf('dependency') !== -1) growth_keys.push('self_reliance');
      if (tension_areas.indexOf('scattered_energy') !== -1) growth_keys.push('focused_creation');
      if (tension_areas.indexOf('restlessness') !== -1) growth_keys.push('grounded_freedom');
      if (tension_areas.indexOf('domination') !== -1) growth_keys.push('balanced_leadership');
      if (tension_areas.indexOf('martyrdom') !== -1) growth_keys.push('healthy_boundaries');
      if (tension_areas.indexOf('anxiety') !== -1) growth_keys.push('channeled_sensitivity');
      if (tension_areas.indexOf('overwhelm') !== -1) growth_keys.push('step_by_step');
      if (tension_areas.indexOf('emotional_burden') !== -1) growth_keys.push('self_compassion');
      if (tension_areas.indexOf('workaholism') !== -1) growth_keys.push('work_life_balance');
      if (tension_areas.indexOf('superficiality') !== -1) growth_keys.push('depth');
      if (tension_areas.indexOf('self_sacrifice') !== -1) growth_keys.push('self_care');
      if (tension_areas.indexOf('stubbornness') !== -1) growth_keys.push('openness');
      if (tension_areas.indexOf('aloofness') !== -1) growth_keys.push('engagement');
      if (tension_areas.indexOf('withdrawal') !== -1) growth_keys.push('sharing_wisdom');
      if (tension_areas.indexOf('impracticality') !== -1) growth_keys.push('grounded_vision');
      if (tension_areas.indexOf('nervous_energy') !== -1) growth_keys.push('channeled_sensitivity');
    }
    if (growth_keys.length === 0) growth_keys.push('self_awareness');

    // Intensity cap
    intensity = Math.round(Math.min(intensity, 2.5) * 100) / 100;

    return {
      // Orijinal sayılar (dokunulmamış)
      numbers: {
        life_path: lp,
        expression: expr,
        soul_urge: soul,
        personality: pers,
        karmic_debt: karmic
      },
      // Dönemsel sayılar (yeni hesaplanan)
      period: period_emphasis,
      // Ağırlıklı bağlam
      dominant_themes: dominant_themes.slice(0, 7),
      intensity: intensity,
      tension_areas: tension_areas.slice(0, 5),
      growth_keys: growth_keys.slice(0, 4),
      karmic_layer: karmic_layer,
      // Meta
      is_master_path: (lp === 11 || lp === 22 || lp === 33),
      timestamp: new Date().toISOString()
    };
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2: MODULAR INTERPRETATION ASSEMBLY
  // ═══════════════════════════════════════════════════════════

  // Native app API base
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  var CONTEXT_SYSTEM_PROMPT =
    'Sen bir Numeroloji Bağlam Analiz Uzmanısın. Pisagor sistemini kullanıyorsun.\n\n' +
    'KURALLAR:\n' +
    '- Türkçe yaz. Doğrudan "sen" diye hitap et.\n' +
    '- Nötr, ayakları yere basan, mistik olmayan ton.\n' +
    '- "Evren diyor ki" veya "Özelsin" gibi klişe kullanma.\n' +
    '- Her cümlede sayısal bir neden göster (örn: "4 baskın olduğu için…").\n' +
    '- Her modül en fazla 3-4 cümle.\n' +
    '- Başlık ekleme. Sadece düz paragraflar yaz.\n' +
    '- İstenen modülü yaz, diğerlerine bulaşma.';

  /**
   * Tek bir modül için AI çağrısı yapar
   */
  async function fetchModule(modulePrompt) {
    try {
      var res = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: CONTEXT_SYSTEM_PROMPT },
            { role: 'user', content: modulePrompt }
          ],
          temperature: 0.75,
          max_tokens: 250
        })
      });
      var data = await res.json();
      return (data.choices && data.choices[0]) ? data.choices[0].message.content.trim() : null;
    } catch(e) {
      console.error('[ContextEngine] Module fetch error:', e);
      return null;
    }
  }

  /**
   * Modüler prompt oluşturucular — her biri bağımsız, bağlam nesnesine dayalı
   */
  function buildModulePrompts(ctx, name) {
    var n = ctx.numbers;
    var p = ctx.period;

    // Module 1: Core Personality (zamansız, sabit)
    var corePrompt =
      name + ' için Temel Kişilik modülü.\n\n' +
      'Sayılar: Kader Yolu=' + n.life_path + ', İfade=' + n.expression +
      ', Ruh Güdüsü=' + n.soul_urge + ', Kişilik=' + n.personality + '.\n' +
      'Baskın temalar: ' + ctx.dominant_themes.join(', ') + '.\n' +
      'Yoğunluk: ' + ctx.intensity + '/2.5.\n' +
      (ctx.is_master_path ? 'UYARI: Kader Yolu ' + n.life_path + ' bir Üstat Sayıdır — yoğunluğu artır, temayı değiştirme.\n' : '') +
      '\nBu kişinin değişmeyen temel karakterini, doğuştan gelen eğilimlerini ve hayatının ana eksenini yaz. ' +
      'Her cümlede hangi sayının neden bu etkiyi yarattığını açıkla. 3-4 cümle, sade ve somut.';

    // Module 2: Current Period Influence (dönemsel)
    var periodPrompt = null;
    if (p) {
      periodPrompt =
        name + ' için Güncel Dönem Etkisi modülü.\n\n' +
        'Temel: Kader Yolu=' + n.life_path + ', İfade=' + n.expression + '.\n' +
        'Dönemsel: Kişisel Yıl=' + p.personal_year +
        ', Kişisel Ay=' + p.personal_month +
        ', Kişisel Gün=' + p.personal_day + '.\n' +
        'Yıl temaları: ' + p.year_themes.join(', ') + '.\n' +
        'Yıl gerilimleri: ' + p.year_tension.join(', ') + '.\n' +
        '\nBu kişinin ŞU ANKİ dönemini analiz et. ' +
        'Kişisel Yıl ' + p.personal_year + ' enerjisinin hayatına ne getirdiğini, ' +
        'bugünkü Kişisel Gün ' + p.personal_day + ' ile nasıl kesiştiğini anlat. ' +
        'Kader Yolu ' + n.life_path + ' ile dönemsel sayıların çatışma veya uyum noktalarını göster. ' +
        '3-4 cümle, pratik ve zamana özgü.';
    }

    // Module 3: Karmic Pressure (sadece karmik borç varsa)
    var karmicPrompt = null;
    if (ctx.karmic_layer) {
      var kl = ctx.karmic_layer;
      karmicPrompt =
        name + ' için Karmik Baskı modülü.\n\n' +
        'Karmik Borç: ' + kl.label + '.\n' +
        'Kader Yolu: ' + n.life_path + '.\n' +
        'Karmik temalar: ' + kl.themes.join(', ') + '.\n' +
        'Karmik baskı alanları: ' + kl.pressure.join(', ') + '.\n' +
        (p ? 'Kişisel Yıl: ' + p.personal_year + '.\n' : '') +
        '\nBu karmik borcun ' + name + '\'in günlük hayatında nasıl hissedildiğini yaz. ' +
        kl.label + ' borcunun spesifik olarak hangi kalıpları tetiklediğini, ' +
        'Kader Yolu ' + n.life_path + ' ile nasıl etkileştiğini açıkla. ' +
        (p ? 'Kişisel Yıl ' + p.personal_year + ' döneminde bu borcun şiddetlenip şiddetlenmediğini belirt. ' : '') +
        '3-4 cümle, keskin ve pratik.';
    }

    // Module 4: Conscious Use Advice (pratik rehber)
    var guidancePrompt =
      name + ' için Bilinçli Kullanım Rehberi modülü.\n\n' +
      'Sayılar: Kader Yolu=' + n.life_path + ', İfade=' + n.expression +
      ', Ruh Güdüsü=' + n.soul_urge + '.\n' +
      'Gerilim alanları: ' + ctx.tension_areas.join(', ') + '.\n' +
      'Gelişim anahtarları: ' + ctx.growth_keys.join(', ') + '.\n' +
      (ctx.karmic_layer ? 'Karmik borç: ' + ctx.karmic_layer.label + '.\n' : '') +
      (p ? 'Kişisel Yıl: ' + p.personal_year + '.\n' : '') +
      '\nBu kişiye somut, uygulanabilir tavsiyeler ver. ' +
      'Gerilim alanlarını nasıl dengeleyeceğini, gelişim anahtarlarını günlük hayatta nasıl kullanacağını anlat. ' +
      '"Şunu yap" formatında, doğrudan ve pratik. Vaaz verme. ' +
      '3-4 cümle.';

    return {
      core: corePrompt,
      period: periodPrompt,
      karmic: karmicPrompt,
      guidance: guidancePrompt
    };
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3: OUTPUT CONTRACT
  // ═══════════════════════════════════════════════════════════

  /**
   * getInterpretation — Tüm modülleri paralel çağırır, output contract'a uygun döner.
   *
   * @param {Object} weightedContext — buildContext()'ten dönen nesne
   * @param {string} name — Kullanıcı adı
   * @returns {Object} { calculations, interpretation }
   */
  async function getInterpretation(weightedContext, name) {
    var prompts = buildModulePrompts(weightedContext, name);

    // Tüm modülleri paralel çağır
    var promises = [
      fetchModule(prompts.core),
      prompts.period ? fetchModule(prompts.period) : Promise.resolve(null),
      prompts.karmic ? fetchModule(prompts.karmic) : Promise.resolve(null),
      fetchModule(prompts.guidance)
    ];

    var results = await Promise.all(promises);

    return {
      // calculations dokunulmamış — mevcut transparency output'u korunur
      calculations: weightedContext.numbers,
      context: {
        dominant_themes: weightedContext.dominant_themes,
        intensity: weightedContext.intensity,
        tension_areas: weightedContext.tension_areas,
        growth_keys: weightedContext.growth_keys,
        period: weightedContext.period,
        karmic_layer: weightedContext.karmic_layer
      },
      interpretation: {
        core_personality: results[0],
        current_period: results[1],
        karmic_layer: results[2],
        guidance: results[3]
      }
    };
  }

  /**
   * Kısa yol: Tüm input'lardan tek seferde sonuç üret
   */
  async function analyze(input, name) {
    var ctx = buildContext(input);
    return getInterpretation(ctx, name);
  }

  // ═══════════════════════════════════════════════════════════
  // CACHE
  // ═══════════════════════════════════════════════════════════
  var CACHE_PREFIX = 'kader_ctx_';

  function getCacheKey(input) {
    var d = new Date();
    // Gün bazlı cache — personal_day her gün değişir
    return CACHE_PREFIX + input.life_path + '_' + input.soul_urge + '_' +
           input.expression_number + '_' + input.personality_number + '_' +
           (input.karmic_debt || 0) + '_' + d.getFullYear() + d.getMonth() + d.getDate();
  }

  async function analyzeWithCache(input, name) {
    var key = getCacheKey(input);
    try {
      var cached = localStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    } catch(e) {}

    var result = await analyze(input, name);

    try {
      localStorage.setItem(key, JSON.stringify(result));
      // Eski cache'leri temizle
      cleanOldCache();
    } catch(e) {}

    return result;
  }

  function cleanOldCache() {
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(CACHE_PREFIX) === 0) {
          var d = new Date();
          var todayPart = '' + d.getFullYear() + d.getMonth() + d.getDate();
          if (keys[i].indexOf(todayPart) === -1) {
            localStorage.removeItem(keys[i]);
          }
        }
      }
    } catch(e) {}
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL EXPORT
  // ═══════════════════════════════════════════════════════════
  window.NumerologyContext = {
    // Step 1: Context Weighting
    buildContext: buildContext,

    // Step 2 & 3: Interpretation
    getInterpretation: getInterpretation,

    // Kısa yol
    analyze: analyze,
    analyzeWithCache: analyzeWithCache,

    // Personal period calculators (bağımsız kullanılabilir)
    calcPersonalYear: calcPersonalYear,
    calcPersonalMonth: calcPersonalMonth,
    calcPersonalDay: calcPersonalDay,

    // Tema haritası (read-only referans)
    NUMBER_THEMES: NUMBER_THEMES,
    KARMIC_OVERLAYS: KARMIC_OVERLAYS
  };

})();
