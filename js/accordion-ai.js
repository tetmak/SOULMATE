/**
 * NUMERAEL — Accordion AI Motor
 * name_numerology_breakdown_1.html için
 * Sadece bu dosyayı ekle, başka hiçbir şeye dokunma.
 */
(function () {
  'use strict';

  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  var CHALDEAN = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7, 'Ç': 3, 'Ğ': 3, 'İ': 1, 'Ö': 7, 'Ş': 3, 'Ü': 6 };
  var VOWELS = 'AEIOUİÖÜ';
  var TR_UPPER = { 'ç': 'Ç', 'ğ': 'Ğ', 'ı': 'I', 'i': 'İ', 'ö': 'Ö', 'ş': 'Ş', 'ü': 'Ü' };

  function reduce(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function (a, d) { return a + parseInt(d); }, 0);
    }
    return n;
  }

  function toTurkishUpper(str) {
    return str.split('').map(function(c) { return TR_UPPER[c] || c.toUpperCase(); }).join('');
  }

  function calcSoulUrge(name) {
    return reduce(toTurkishUpper(name).replace(/[^A-ZÇĞİÖŞÜ]/g, '').split('').reduce(function (s, c) {
      return s + (VOWELS.includes(c) ? (CHALDEAN[c] || 0) : 0);
    }, 0));
  }

  function calcPersonality(name) {
    return reduce(toTurkishUpper(name).replace(/[^A-ZÇĞİÖŞÜ]/g, '').split('').reduce(function (s, c) {
      return s + (!VOWELS.includes(c) && c !== ' ' ? (CHALDEAN[c] || 0) : 0);
    }, 0));
  }

  function calcLifePath(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 7;
    var str = '' + (d.getMonth() + 1) + d.getDate() + d.getFullYear();
    return reduce(str.split('').reduce(function (a, n) { return a + parseInt(n); }, 0));
  }

  var TONE = {
    1: 'ateşli, meydan okuyan',
    2: 'yumuşak ama hüzünlü',
    3: 'canlı ama altında kaygı var',
    4: 'ağır, ciddi, toprak gibi',
    5: 'hızlı, kaosçu',
    6: 'şefkatli ama boğucu',
    7: 'soğuk görünen derinlik, seçilmiş yalnızlık',
    8: 'güç ve madde arasında savaş',
    9: 'yorgun bilge, bırakmayı öğrenmek',
    11: 'yük gibi hissettiren sezgi',
    22: 'izole vizyon sahibi',
    33: 'saf sevgi, dünya buna hazır değil'
  };

  // Her kart tipi için farklı açılış kelimeleri — AI bunlardan biriyle BAŞLAMAK ZORUNDA
  var OPENINGS = {
    'soul_urge': ['İçinde taşıdığın', 'Kimseye itiraf etmediğin', 'Gece yalnız kaldığında', 'Sevgiyi hep'],
    'personality': ['İnsanlar seni', 'Seni ilk gören', 'Dışarıdan bakıldığında', 'Çevren seni'],
    'life_path': ['Bu dünyaya', 'Kaderin seni', 'Hayatının bütününe bakınca', 'Tekrar eden o örüntü']
  };

  var FORBIDDEN = {
    'soul_urge': 'Yaşam yolu veya kişilik hakkında yazmak KESİNLİKLE yasak.',
    'personality': 'Ruh dürtüsü veya yaşam yolu hakkında yazmak KESİNLİKLE yasak.',
    'life_path': 'Ruh dürtüsü veya kişilik hakkında yazmak KESİNLİKLE yasak.'
  };

  var CARD_TOPIC = {
    'soul_urge': 'kişinin içsel arzuları, kimseye söylemediği istekleri, sevgi dili ve duygusal gerçekleri',
    'personality': 'kişinin dışarıya yansıttığı imaj, insanların onu ilk tanıdığında ne hissettiği, toplumsal maskesi',
    'life_path': 'kişinin bu hayattaki büyük amacı, kaderin onu nereye çektiği, hayat boyunca tekrar eden temalar'
  };

  function getCardType(titleText) {
    var t = (titleText || '').toLowerCase();
    if (t.includes('soul') || t.includes('ruh')) return 'soul_urge';
    if (t.includes('personality') || t.includes('kişilik')) return 'personality';
    return 'life_path';
  }

  async function fetchAnalysis(cardType, num, userName) {
    // API key /api/openai proxy'si tarafından server-side ekleniyor

    var openings = OPENINGS[cardType];
    var opening = openings[Math.floor(Math.random() * openings.length)];
    var tone = TONE[num] || 'mistik';

    var system = [
      'Sen bir numeroloji üstadısın.',
      'Türkçe yaz. Tam olarak 150-160 kelime — ne eksik ne fazla.',
      'SADECE 4 kısa paragraf. Başlık yok, liste yok, madde işareti yok.',
      'BİRİNCİ KELİMELER ZORUNLU: Analizin ilk kelimesi "' + opening + '" olacak — başka türlü başlamak yasak.',
      '"Yaşam yolun" ifadesiyle veya herhangi bir sayı adıyla başlamak KESİNLİKLE yasak.',
      FORBIDDEN[cardType],
      'Yazı tonu: ' + tone + '.',
      'Doğrudan "sen" diye hitap et. Vaaz verme. Klişe kullanma.',
      '"güçlü", "bağımsız", "derin", "özel" gibi her sayıya yakışan sıfatları KULLANMA.'
    ].join(' ');

    var user = [
      userName + ' için ' + (cardType === 'soul_urge' ? 'Ruh Dürtüsü' : cardType === 'personality' ? 'Kişilik' : 'Yaşam Yolu') + ' Sayısı ' + num + ' analizi.',
      'Konu: ' + CARD_TOPIC[cardType] + '.',
      'Sadece bu konuda yaz.'
    ].join(' ');

    try {
      var res = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          max_tokens: 350,
          temperature: 0.9
        })
      });
      var data = await res.json();
      return data.choices && data.choices[0] ? data.choices[0].message.content.trim() : null;
    } catch (e) { return null; }
  }

  // ─── Stil ───────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.acc-loading { padding: 16px 20px; color: rgba(207,161,23,0.5); font-size: 13px;',
    '  font-style: italic; border-top: 1px solid rgba(0,0,0,0.06);',
    '  animation: acc-pulse 1.5s infinite; }',
    '.dark .acc-loading { border-top-color: rgba(255,255,255,0.08); }',
    '@keyframes acc-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }',
    '.acc-content { padding: 16px 20px; color: rgba(30,30,30,0.82); font-size: 14px;',
    '  line-height: 1.85; border-top: 1px solid rgba(0,0,0,0.06);',
    '  animation: acc-in 0.5s ease; }',
    '.dark .acc-content { color: rgba(255,255,255,0.82); border-top-color: rgba(255,255,255,0.08); }',
    '.acc-content p { margin-bottom: 12px; }',
    '.acc-content p:last-child { margin-bottom: 0; }',
    '@keyframes acc-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }'
  ].join('');
  document.head.appendChild(style);

  // ─── Accordion'ları yakala ve AI'a bağla ───────────────────────
  function init() {
    // Kullanıcı verisi
    var params = new URLSearchParams(window.location.search);
    var ud = {};
    try { ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}'); } catch (e) { }

    var name = params.get('kisi') || ud.name || '';
    var bDate = params.get('dt') || ud.birthDate || '';

    var suNum = name ? calcSoulUrge(name) : 7;
    var perNum = name ? calcPersonality(name) : 4;
    var lpNum = bDate ? calcLifePath(bDate) : (ud.birthDate ? calcLifePath(ud.birthDate) : 1);
    var numMap = { soul_urge: suNum, personality: perNum, life_path: lpNum };

    // Accordion kartlarını bul — h2 başlığı olan div'ler
    var section = document.querySelector('section.px-4.space-y-3');
    if (!section) return;
    var cards = section.querySelectorAll(':scope > div');

    cards.forEach(function (card) {
      var btn = card.querySelector('button');
      var h2 = card.querySelector('h2');
      if (!btn || !h2) return;

      var cardType = getCardType(h2.textContent);
      var num = numMap[cardType] || 1;

      // Mevcut click listener'ları temizle — klon trick
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      btn = newBtn;

      // Content div ekle
      var contentDiv = document.createElement('div');
      contentDiv.style.display = 'none';
      card.appendChild(contentDiv);

      var loaded = false;

      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var icons = btn.querySelectorAll('.material-symbols-outlined');
        var icon = icons[icons.length - 1];

        if (contentDiv.style.display === 'none') {
          contentDiv.style.display = 'block';
          if (icon) icon.textContent = 'expand_less';

          if (!loaded) {
            loaded = true;
            contentDiv.className = 'acc-loading';
            contentDiv.textContent = '✦ Analiz hazırlanıyor...';

            fetchAnalysis(cardType, num, name || 'Sen').then(function (text) {
              if (text) {
                contentDiv.className = 'acc-content';
                contentDiv.innerHTML = text
                  .split(/\n\n+/)
                  .filter(function (p) { return p.trim(); })
                  .map(function (p) { return '<p>' + p.trim() + '</p>'; })
                  .join('');
              } else {
                contentDiv.className = 'acc-content';
                contentDiv.textContent = 'Analiz şu an yüklenemiyor.';
              }
            });
          }
        } else {
          contentDiv.style.display = 'none';
          if (icon) icon.textContent = 'expand_more';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

})();
