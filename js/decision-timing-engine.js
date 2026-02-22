/**
 * NUMERAEL — Decision Timing Engine v1.0
 * Deterministik karar zamanlama motoru.
 * Aynı giriş HER ZAMAN aynı çıkışı üretir. Rastgelelik yok.
 *
 * Kullanım:
 *   var result = DecisionTiming.decide({
 *     action_type: 'job',
 *     personal_day: 8,
 *     personal_month: 4,
 *     personal_year: 1
 *   });
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // SABIT KURALLAR — DEĞİŞTİRİLEMEZ
  // ═══════════════════════════════════════════════════════════

  var VALID_ACTIONS = ['job', 'money', 'relationship', 'start', 'signature'];

  // Kişisel Gün etki tablosu (birincil faktör)
  // Format: { action_type: score_modifier }
  var DAY_RULES = {
    1:  { start: 15, job: 15, money: 0, relationship: -5, signature: 5 },
    2:  { start: -5, job: 0, money: 0, relationship: 15, signature: 0 },
    3:  { start: 5, job: 5, money: 0, relationship: 5, signature: -5 },
    4:  { start: 0, job: 5, money: 5, relationship: 0, signature: 15 },
    5:  { start: 5, job: 0, money: 10, relationship: 0, signature: -10 },
    6:  { start: 0, job: 0, money: 0, relationship: 10, signature: 5 },
    7:  { start: -15, job: -5, money: -5, relationship: 0, signature: -15 },
    8:  { start: 5, job: 20, money: 20, relationship: 0, signature: 10 },
    9:  { start: -10, job: 0, money: 0, relationship: 5, signature: 0 },
    11: { start: 5, job: 5, money: 0, relationship: 10, signature: 0 },
    22: { start: 5, job: 10, money: 5, relationship: 0, signature: 5 }
  };

  // Kişisel Yıl etki tablosu (bağlam modifiyeri)
  var YEAR_RULES = {
    1:  { start: 10, job: 5, money: 5, relationship: 0, signature: 5 },
    2:  { start: 0, job: 0, money: 0, relationship: 5, signature: 0 },
    3:  { start: 5, job: 0, money: 0, relationship: 3, signature: 0 },
    4:  { start: 0, job: 5, money: 3, relationship: 0, signature: 5 },
    5:  { start: 5, job: 0, money: 5, relationship: 0, signature: -5 },
    6:  { start: 0, job: 0, money: 0, relationship: 5, signature: 3 },
    7:  { start: -5, job: 0, money: -3, relationship: -3, signature: -5 },
    8:  { start: 5, job: 15, money: 15, relationship: 0, signature: 10 },
    9:  { start: -15, job: -5, money: 0, relationship: 5, signature: -5 },
    11: { start: 3, job: 3, money: 0, relationship: 5, signature: 0 },
    22: { start: 5, job: 5, money: 5, relationship: 0, signature: 3 }
  };

  // Aksiyon türü Türkçe etiketleri
  var ACTION_LABELS = {
    job: 'iş/kariyer',
    money: 'finansal karar',
    relationship: 'ilişki kararı',
    start: 'yeni başlangıç',
    signature: 'imza/sözleşme'
  };

  // Neden açıklama şablonları — sayısal referanslı
  var REASON_TEMPLATES = {
    day_positive: function(day, action) {
      return 'Kişisel Gün ' + day + ', ' + ACTION_LABELS[action] + ' için destekleyici bir sayısal etki taşıyor.';
    },
    day_negative: function(day, action) {
      return 'Kişisel Gün ' + day + ', ' + ACTION_LABELS[action] + ' için zorlu bir sayısal kombinasyon oluşturuyor.';
    },
    day_neutral: function(day, action) {
      return 'Kişisel Gün ' + day + ', ' + ACTION_LABELS[action] + ' konusunda belirgin bir yönlendirme yapmıyor.';
    },
    year_boost: function(year, action) {
      return ' Kişisel Yıl ' + year + ' bu alanda ek destek sağlıyor.';
    },
    year_resist: function(year, action) {
      return ' Kişisel Yıl ' + year + ' bu alanda ek direnç oluşturuyor.';
    },
    month_sync: function(month, day) {
      return ' Ay (' + month + ') ve Gün (' + day + ') senkronize — etki güçleniyor.';
    },
    month_conflict: function(month, day) {
      return ' Ay (' + month + ') ve Gün (' + day + ') çatışıyor — karışık sinyaller.';
    },
    master_intensity: function(num) {
      return ' Üstat sayı ' + num + ' yoğunluğu artırıyor.';
    }
  };

  // Uyarı şablonları
  var WARNING_TEMPLATES = {
    7: function(action) {
      if (action === 'start' || action === 'signature')
        return 'Gün 7 içe dönük analiz eğilimi taşır. Dışa dönük aksiyonlar için uygun değil.';
      return null;
    },
    9: function(action) {
      if (action === 'start')
        return 'Gün 9 sonlandırma eğilimi taşır. Yeni başlangıçlar yerine mevcut süreçleri kapatmak için daha uygun.';
      return null;
    },
    5: function(action) {
      if (action === 'signature')
        return 'Gün 5 değişkenlik eğilimi taşır. Bağlayıcı kararlar için istikrarsız bir zemin.';
      return null;
    },
    year_9_start: function() {
      return 'Kişisel Yıl 9, kapanış dönemidir. Yeni girişimler bu yılda zorlanabilir.';
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ANA FONKSİYON — DETERMİNİSTİK, SAF
  // ═══════════════════════════════════════════════════════════

  /**
   * decideTiming — Karar zamanlama hesabı.
   * AYNI GİRİŞ HER ZAMAN AYNI ÇIKIŞI ÜRETİR.
   *
   * @param {Object} input
   *   - action_type {string}  "job" | "money" | "relationship" | "start" | "signature"
   *   - personal_day {number}  1-9, 11, 22
   *   - personal_month {number} 1-9, 11, 22
   *   - personal_year {number}  1-9, 11, 22
   * @returns {Object} { score, label, risk_level, main_reason, warning }
   */
  function decideTiming(input) {
    var action = input.action_type;
    var day = input.personal_day;
    var month = input.personal_month;
    var year = input.personal_year;

    // Validasyon
    if (VALID_ACTIONS.indexOf(action) === -1) {
      return {
        score: 50,
        label: 'nötr',
        risk_level: 'orta',
        main_reason: 'Tanınmayan aksiyon türü: ' + action,
        warning: null
      };
    }

    // --- Skor hesabı ---
    var score = 50; // Base
    var reasons = [];
    var dayMod = 0;
    var yearMod = 0;

    // 1. Kişisel Gün etkisi (birincil faktör)
    var dayKey = (day === 11 || day === 22) ? day : day;
    var dayRule = DAY_RULES[dayKey];
    if (dayRule) {
      dayMod = dayRule[action] || 0;
      score += dayMod;

      if (dayMod > 5) {
        reasons.push(REASON_TEMPLATES.day_positive(day, action));
      } else if (dayMod < -5) {
        reasons.push(REASON_TEMPLATES.day_negative(day, action));
      } else {
        reasons.push(REASON_TEMPLATES.day_neutral(day, action));
      }
    }

    // 2. Kişisel Yıl etkisi (bağlam modifiyeri)
    var yearRule = YEAR_RULES[year];
    if (yearRule) {
      yearMod = yearRule[action] || 0;
      score += yearMod;

      if (yearMod > 3) {
        reasons.push(REASON_TEMPLATES.year_boost(year, action));
      } else if (yearMod < -3) {
        reasons.push(REASON_TEMPLATES.year_resist(year, action));
      }
    }

    // 3. Kişisel Ay etkisi
    if (month === day) {
      // Aynı sayı — senkron → +5
      score += 5;
      reasons.push(REASON_TEMPLATES.month_sync(month, day));
    } else {
      // Çatışma kontrolü: zıt enerjiler
      var conflicting = isConflicting(month, day);
      if (conflicting) {
        score -= 5;
        reasons.push(REASON_TEMPLATES.month_conflict(month, day));
      }
    }

    // 4. Üstat sayılar — yoğunluk artışı, yön değişmez
    if (day === 11 || day === 22) {
      var masterBonus = (score >= 50) ? 5 : -5;
      score += masterBonus;
      reasons.push(REASON_TEMPLATES.master_intensity(day));
    }
    if (year === 11 || year === 22) {
      score += 3;
    }

    // Skor sınırla: 0-100
    score = Math.max(0, Math.min(100, score));

    // --- Etiket ---
    var label;
    if (score <= 39) label = 'zorlayıcı';
    else if (score <= 59) label = 'nötr';
    else if (score <= 79) label = 'uygun';
    else label = 'çok uygun';

    // --- Risk seviyesi ---
    var risk_level;
    if (score < 40) risk_level = 'yüksek';
    else if (score < 60) risk_level = 'orta';
    else risk_level = 'düşük';

    // --- Uyarı ---
    var warning = null;
    if (WARNING_TEMPLATES[day]) {
      warning = WARNING_TEMPLATES[day](action);
    }
    if (!warning && year === 9 && action === 'start') {
      warning = WARNING_TEMPLATES.year_9_start();
    }

    // --- Aksiyon direktifi ---
    var action_directive;
    if (score < 45) {
      action_directive = 'Ertelenmesi önerilir';
    } else if (score <= 65) {
      action_directive = 'Sadece gerekliyse ilerle';
    } else {
      action_directive = 'İlerlenmesi önerilir';
    }

    // --- Ana sebep ---
    var main_reason = reasons.join('');

    // --- Decision Rationale (5-6 cümle) ---
    var rationale = buildRationale(day, month, year, action, score, dayMod, yearMod);

    return {
      score: score,
      label: label,
      risk_level: risk_level,
      action_directive: action_directive,
      main_reason: main_reason,
      warning: warning,
      decision_rationale: rationale
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DECISION RATIONALE — 5-6 CÜMLE, ANALİTİK, DETERMİNİSTİK
  // ═══════════════════════════════════════════════════════════

  // Aksiyon bazlı hata riski açıklamaları (Cümle 4)
  var MISTAKE_TEMPLATES = {
    job: 'Pozisyon veya koşullar tam netleşmeden karar verilme olasılığı artıyor.',
    money: 'Finansal detaylar gözden kaçabilir veya koşullar kısa sürede değişebilir.',
    relationship: 'Duygusal netlik sağlanmadan verilen kararlar geri dönüş gerektirebilir.',
    start: 'Zamanlama uyumsuzluğu nedeniyle başlangıç ivmesi zayıf kalabilir.',
    signature: 'Detaylar gözden kaçabilir veya şartlar taahhütten kısa süre sonra değişebilir.'
  };

  // Aksiyon bazlı güvenli ilerleme koşulları (Cümle 5)
  var SAFETY_TEMPLATES = {
    job: {
      low:  'Tüm koşullar ve alternatifler önceden değerlendirilmişse ilerleme daha güvenli olur.',
      mid:  'Tüm koşullar zaten doğrulanmışsa ilerlemek daha güvenlidir.',
      high: 'Mevcut koşullar destekleyici; standart değerlendirmeyle ilerlenebilir.'
    },
    money: {
      low:  'Tüm finansal değişkenler teyit edilmiş ve risk analizi yapılmışsa ilerleme daha güvenli olur.',
      mid:  'Finansal veriler zaten doğrulanmışsa ilerlemek daha güvenlidir.',
      high: 'Finansal koşullar uygun; standart dikkatle ilerlenebilir.'
    },
    relationship: {
      low:  'Karşılıklı beklentiler netleştirilmiş ve duygusal hazırlık tamamlanmışsa ilerleme daha güvenli olur.',
      mid:  'Karşılıklı beklentiler zaten netleşmişse ilerlemek daha güvenlidir.',
      high: 'İlişkisel koşullar destekleyici; açık iletişimle ilerlenebilir.'
    },
    start: {
      low:  'Tüm ön hazırlıklar tamamlanmış ve kaynaklar güvence altındaysa ilerleme daha güvenli olur.',
      mid:  'Ön hazırlıklar zaten tamamlanmışsa ilerlemek daha güvenlidir.',
      high: 'Başlangıç koşulları uygun; planlanan adımlarla ilerlenebilir.'
    },
    signature: {
      low:  'Tüm maddeler doğrulanmış ve hukuki değerlendirme yapılmışsa ilerleme daha güvenli olur.',
      mid:  'Tüm değişkenler zaten doğrulanmışsa ilerlemek daha güvenlidir.',
      high: 'Bağlayıcı karar koşulları uygun; standart dikkatle ilerlenebilir.'
    }
  };

  /**
   * buildRationale — 5-6 cümlelik Decision Rationale üretir.
   * Kurallar:
   *   Cümle 1: Sayısal bağlamı yeniden belirt (Gün/Ay/Yıl uyumu)
   *   Cümle 2: Bu uyumun seçilen aksiyon kategorisini nasıl etkilediği
   *   Cümle 3: Bugün için baskın kısıtlama veya destek faktörü
   *   Cümle 4: Bugün aksiyon alınırsa hangi tür hata daha olası
   *   Cümle 5: Hangi koşul ilerlemeyi daha güvenli kılar
   *   Cümle 6 (opsiyonel, sadece skor 45-65): Dikkatli ve kontrollü ilerleme vurgusu
   */
  function buildRationale(day, month, year, action, score, dayMod, yearMod) {
    var actionLabel = ACTION_LABELS[action];
    var sentences = [];

    // Cümle 1: Sayısal bağlam
    var alignDesc;
    if (score >= 70) alignDesc = 'güçlü bir uyum gösteriyor';
    else if (score >= 55) alignDesc = 'kısmi bir uyum gösteriyor';
    else if (score >= 45) alignDesc = 'belirgin bir uyum göstermiyor';
    else alignDesc = 'zayıf bir kombinasyon oluşturuyor';

    sentences.push(
      'Kişisel Gün ' + day + ', Kişisel Ay ' + month + ' ve Kişisel Yıl ' + year +
      ' kombinasyonu ' + alignDesc + '.'
    );

    // Cümle 2: Uyumun aksiyon kategorisine etkisi
    if (score >= 65) {
      sentences.push(
        ACTION_LABELS[action].charAt(0).toUpperCase() + ACTION_LABELS[action].slice(1) +
        ' için bu kombinasyon destekleyici bir zamanlama oluşturuyor.'
      );
    } else if (score >= 45) {
      sentences.push(
        ACTION_LABELS[action].charAt(0).toUpperCase() + ACTION_LABELS[action].slice(1) +
        ' için bu kombinasyon nötr bir zamanlama oluşturuyor, belirgin bir destek sağlamıyor.'
      );
    } else {
      sentences.push(
        ACTION_LABELS[action].charAt(0).toUpperCase() + ACTION_LABELS[action].slice(1) +
        ' için bu kombinasyon kısıtlayıcı bir zamanlama oluşturuyor.'
      );
    }

    // Cümle 3: Baskın faktör (kısıtlama veya destek)
    var absDayMod = Math.abs(dayMod);
    var absYearMod = Math.abs(yearMod);
    var monthSync = (month === day);
    var monthConflict = isConflicting(month, day);

    if (absDayMod >= absYearMod && absDayMod > 3) {
      if (dayMod > 0) {
        sentences.push(
          'Kişisel Gün ' + day + ' bu aksiyon türü için bugünün baskın destek faktörünü oluşturuyor.'
        );
      } else {
        sentences.push(
          'Kişisel Gün ' + day + ' bu aksiyon türü için bugünün baskın kısıtlama faktörünü oluşturuyor.'
        );
      }
    } else if (absYearMod > absDayMod && absYearMod > 3) {
      if (yearMod > 0) {
        sentences.push(
          'Kişisel Yıl ' + year + ' dönemsel olarak bu alanda ek destek sağlıyor ve bugünün baskın faktörünü oluşturuyor.'
        );
      } else {
        sentences.push(
          'Kişisel Yıl ' + year + ' dönemsel olarak bu alanda direnç oluşturuyor ve bugünün baskın kısıtlama faktörü.'
        );
      }
    } else if (monthSync) {
      sentences.push(
        'Ay ve Gün senkronizasyonu (' + month + ') bugünün sayısal etkisini güçlendiren baskın faktör.'
      );
    } else if (monthConflict) {
      sentences.push(
        'Ay (' + month + ') ve Gün (' + day + ') arasındaki çatışma bugün karışık sinyaller oluşturuyor.'
      );
    } else {
      sentences.push(
        'Bugün için belirgin bir baskın faktör bulunmuyor; etkiler dengeli dağılıyor.'
      );
    }

    // Cümle 4: Hata riski
    if (score < 70) {
      sentences.push(MISTAKE_TEMPLATES[action]);
    } else {
      sentences.push(
        'Bu zamanlama aksiyonu engellemez; standart dikkat yeterli.'
      );
    }

    // Cümle 5: Güvenli ilerleme koşulu
    var safetyLevel = (score < 45) ? 'low' : (score <= 65) ? 'mid' : 'high';
    sentences.push(SAFETY_TEMPLATES[action][safetyLevel]);

    // Cümle 6 (opsiyonel): Sadece skor 45-65 arasında
    if (score >= 45 && score <= 65) {
      sentences.push(
        'Bu skor aralığında kontrollü ve adım adım ilerleme, toplu karar almaktan daha düşük risk taşır.'
      );
    }

    return sentences.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // YARDIMCI
  // ═══════════════════════════════════════════════════════════

  /**
   * İki sayının çatışıp çatışmadığını kontrol et.
   * Zıt enerji çiftleri: 1-2, 4-5, 7-5, 8-2
   */
  function isConflicting(a, b) {
    // Master sayıları base'e indirge çatışma kontrolü için
    var ba = (a === 11) ? 2 : (a === 22) ? 4 : a;
    var bb = (b === 11) ? 2 : (b === 22) ? 4 : b;

    var conflicts = [
      [1, 2], [4, 5], [7, 5], [8, 2], [1, 6], [3, 7]
    ];
    for (var i = 0; i < conflicts.length; i++) {
      if ((ba === conflicts[i][0] && bb === conflicts[i][1]) ||
          (ba === conflicts[i][1] && bb === conflicts[i][0])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tüm aksiyon türlerini birden değerlendir
   */
  function decideAll(personal_day, personal_month, personal_year) {
    var results = {};
    VALID_ACTIONS.forEach(function(action) {
      results[action] = decideTiming({
        action_type: action,
        personal_day: personal_day,
        personal_month: personal_month,
        personal_year: personal_year
      });
    });
    return results;
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL EXPORT
  // ═══════════════════════════════════════════════════════════
  window.DecisionTiming = {
    decide: decideTiming,
    decideAll: decideAll,
    VALID_ACTIONS: VALID_ACTIONS,
    ACTION_LABELS: ACTION_LABELS
  };

})();
