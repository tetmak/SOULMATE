/**
 * NUMERAEL — AI İçerik Motoru
 * Tüm sayfalardaki analizleri, yorumları ve rehberleri OpenAI ile üretir
 */
(function() {
  'use strict';

  // API key artık /api/openai proxy'si tarafından server-side ekleniyor
  var PAGE = window.location.pathname.split('/').pop() || '';
  var CACHE_PREFIX = 'numerael_ai_';

  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var isNative = window.location.protocol === 'capacitor:' ||
                 window.location.protocol === 'ionic:' ||
                 window.location.hostname === 'localhost' ||
                 window.location.protocol === 'file:' ||
                 (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ─── Skeleton loading stili ────────────────────────────────────────
  var skeletonStyle = document.createElement('style');
  skeletonStyle.textContent = `
    .ai-skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
      background-size: 200% 100%;
      animation: ai-shimmer 1.5s infinite;
      border-radius: 6px;
      color: transparent !important;
      user-select: none;
      min-height: 1em;
      display: inline-block;
      width: 100%;
    }
    @keyframes ai-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ai-fade-in {
      animation: ai-fadein 0.6s ease;
    }
    @keyframes ai-fadein {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(skeletonStyle);

  // ─── OpenAI çağrısı ───────────────────────────────────────────────
  async function askAI(prompt, systemMsg) {
    var system = systemMsg || `Sen Soulnum uygulamasının Numeroloji Üstadısın. 
Türkçe, mistik, etkileyici ve kişisel bir dilde yaz. 
Sayılar, kozmik bağlantılar ve ruhsal anlamlar konusunda derin bilgeliğe sahipsin.
Kısa ve çarpıcı yaz — gereksiz tekrar yapma.
Sadece istenen metni yaz, başlık veya açıklama ekleme.`;

    var cached = sessionStorage.getItem(CACHE_PREFIX + btoa(prompt).slice(0,40));
    if (cached) return cached;

    var r = await fetch(API_BASE + '/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.85,
      })
    });
    var data = await r.json();
    var text = data.choices && data.choices[0] ? data.choices[0].message.content : null;
    if (text) sessionStorage.setItem(CACHE_PREFIX + btoa(prompt).slice(0,40), text);
    return text;
  }

  // ─── Element'i skeleton yap, sonra doldur ─────────────────────────
  function skeletonFill(el, promise) {
    if (!el) return;
    var original = el.innerHTML;
    el.classList.add('ai-skeleton');
    promise.then(function(text) {
      if (!text) return;
      el.classList.remove('ai-skeleton');
      el.classList.add('ai-fade-in');
      el.innerHTML = text;
    }).catch(function() {
      el.classList.remove('ai-skeleton');
      el.innerHTML = original;
    });
  }

  // ─── Kullanıcı bilgilerini al ──────────────────────────────────────
  function getUserContext() {
    var today = new Date();
    var days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

    // Kullanıcı verilerini localStorage'dan al (data attribute'lardan daha güvenilir)
    var userName = 'Değerli ruh';
    var lifePathNumber = '7';
    var userGender = '';
    try {
      var ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}');
      if (ud.name) userName = ud.name.split(' ')[0]; // sadece ilk isim
      if (ud.lifePath) lifePathNumber = String(ud.lifePath);
      if (ud.gender) userGender = ud.gender === 'female' ? 'kadın' : (ud.gender === 'male' ? 'erkek' : '');
    } catch(e) {}

    // Fallback: DOM'dan kontrol et
    var lpEl = document.querySelector('[data-life-path]');
    if (lpEl && lpEl.dataset.lifePath) lifePathNumber = lpEl.dataset.lifePath;
    var unEl = document.querySelector('[data-user-name]');
    if (unEl && unEl.dataset.userName) userName = unEl.dataset.userName;

    return {
      date: today.getDate() + ' ' + months[today.getMonth()] + ' ' + today.getFullYear(),
      day: days[today.getDay()],
      dayNum: today.getDate(),
      lifePathNumber: lifePathNumber,
      userName: userName,
      gender: userGender,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // SAYFA BAZLI İÇERİK ÜRETİCİLERİ
  // ═══════════════════════════════════════════════════════════════════

  // ─── Daily Spiritual Guide ────────────────────────────────────────
  async function fillDailySpiritualGuide() {
    var ctx = getUserContext();
    var vibEl = document.querySelector('[class*="Vibration"]') || document.querySelector('.uppercase.tracking-wider');
    var vibNum = vibEl ? vibEl.textContent.replace(/\D/g,'') : Math.floor(Math.random()*9)+1;

    var affirmEl = document.querySelector('h3.text-white.text-3xl, h3.font-bold.text-3xl, h3.text-white.font-bold');
    var insightEl = document.querySelector('p.text-white\\/90, p.leading-relaxed.text-base, .border-l-2 + p, .border-l-2.border-primary ~ p');
    if (!insightEl) insightEl = document.querySelector('.border-l-2');

    var gTag = ctx.gender ? ' (Cinsiyet: ' + ctx.gender + ')' : '';
    if (affirmEl) {
      skeletonFill(affirmEl, askAI(
        `${ctx.userName}${gTag} için ${ctx.date} tarihi, Titreşim ${vibNum} enerjisinde güçlü bir günlük afirmasyon yaz.
         Tırnak içinde, kişisel ve kozmik bağlantılı olsun. Cinsiyete uygun hitap et. Maksimum 12 kelime.`
      ));
    }
    if (insightEl) {
      skeletonFill(insightEl, askAI(
        `${ctx.userName}${gTag} için ${ctx.date}, ${ctx.day} günü. Titreşim ${vibNum} için kişisel bir günlük rehberlik mesajı yaz.
         Kozmik enerji, günün fırsatları ve nelere dikkat edilmesi gerektiğinden bahset. Cinsiyete uygun dil kullan.
         2-3 cümle, mistik ve ilham verici tonda.`
      ));
    }

    // Ritüel / section başlıkları
    var ritualSections = document.querySelectorAll('.ritual-text, [class*="ritual"] p, .glass-card p');
    ritualSections.forEach(function(el, i) {
      if (el.textContent.trim().length > 30) {
        skeletonFill(el, askAI(`Titreşim ${vibNum} için ${i===0?'sabah':'akşam'} ritüel tavsiyesi yaz. 1-2 cümle, pratik ve mistik.`));
      }
    });
  }

  // ─── Daily Number Deep Dive ───────────────────────────────────────
  async function fillDailyNumberDeepDive() {
    var ctx = getUserContext();
    var num = document.querySelector('.text-6xl, .text-7xl, .text-8xl')?.textContent?.trim() || '7';

    var descEls = document.querySelectorAll('p.text-white\\/70, p.text-white\\/80, p.text-white\\/60, p.leading-relaxed, p.font-light');
    descEls.forEach(function(el, i) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('header')) {
        var gInfo = ctx.gender ? ' Kullanıcı: ' + ctx.gender + '.' : '';
        var prompts = [
          `${num} sayısının kozmik anlamını ve bu günkü enerjisini açıkla.${gInfo} 2-3 cümle, derin ve mistik.`,
          `${num} sayısını taşıyan bir ${ctx.gender || 'kişi'}nin bugün karşılaşacağı fırsatlar ve zorluklar nelerdir? 2 cümle.`,
          `${num} sayısının ruhsal mesajı nedir?${gInfo} Kısa, çarpıcı, ilham verici. 1-2 cümle.`,
          `${num} sayısı ve aşk, ilişkiler üzerindeki etkisi. ${ctx.gender === 'kadın' ? 'Bir kadın' : ctx.gender === 'erkek' ? 'Bir erkek' : 'Bir kişi'} perspektifinden yaz. 2 cümle, romantik ve kozmik tonda.`,
        ];
        skeletonFill(el, askAI(prompts[i % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 1 ─────────────────────────────────
  async function fillNameNumerology1() {
    var nameEl = document.querySelector('h2.font-extrabold, h1.font-bold, .text-primary.font-bold');
    var name = nameEl ? nameEl.textContent.trim() : 'Alex';
    var lifePathEl = document.querySelector('.text-6xl, .text-7xl, .text-8xl, .text-5xl');
    var lifeNum = lifePathEl ? lifePathEl.textContent.trim().replace(/\D/g,'') : '7';

    var textEls = document.querySelectorAll('p, .description, .analysis-text');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 50 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && !el.closest('[id*="share"]') && count < 5) {
        count++;
        var gCtx = ctx.gender ? ' (Cinsiyet: ' + ctx.gender + ')' : '';
        var prompts = [
          `${name}${gCtx} ismi için Yaşam Yolu ${lifeNum} analizini yaz. Kişinin temel özellikleri ve misyonu. Cinsiyete uygun hitap et. 2-3 cümle.`,
          `Yaşam Yolu ${lifeNum} olan ${name}${gCtx} için bu sayının ruhsal anlamı ve güçlü yönleri nelerdir? 2 cümle.`,
          `${name} ismindeki harflerin titreşiminin kişiliğe etkisi.${gCtx} 2 cümle, mistik ton.`,
          `Yaşam Yolu ${lifeNum} olan bir ${ctx.gender || 'kişi'} için kariyer ve aşk rehberliği. 2 cümle.`,
          `${lifeNum} sayısının evrensel enerjisi ve ${name}${gCtx} üzerindeki kozmik etkisi. 1-2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 2 ─────────────────────────────────
  async function fillNameNumerology2() {
    var nameEl = document.querySelector('h2.font-extrabold, .text-lg.font-extrabold');
    var names = nameEl ? nameEl.textContent.replace('&', 've') : 'Alex ve Maya';

    var sections = document.querySelectorAll('section p, .glass-card p, .card p');
    var count = 0;
    sections.forEach(function(el) {
      if (el.textContent.trim().length > 50 && !el.closest('[id*="overlay"]') && count < 6) {
        count++;
        var prompts = [
          `${names} arasındaki ruhsal bağ ve kozmik çekim hakkında derin analiz. 2-3 cümle, romantik ve mistik.`,
          `${names} ikilisinin birlikte yarattığı enerji alanı ve yaşam yolları uyumu. 2 cümle.`,
          `${names} için ortak kader noktaları ve büyüme alanları. 2 cümle, pozitif ve ilham verici.`,
          `${names} arasındaki iletişim titreşimi ve duygusal rezonans. 2 cümle.`,
          `${names} birlikteliğinin evrensel amacı ve ruhsal dersleri. 2 cümle.`,
          `${names} için ilişki tavsiyesi ve kozmik yönlendirme. 2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 3 ─────────────────────────────────
  async function fillNameNumerology3() {
    var nameEl = document.querySelector('h2.font-extrabold, h2.text-lg');
    var names = nameEl ? nameEl.textContent.replace('&','ve') : 'İki ruh';

    var textEls = document.querySelectorAll('p, td p, .text-sm');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && count < 7) {
        count++;
        skeletonFill(el, askAI(
          `${names} için numeroloji tablosu yorumu ${count}. Kısa, özlü, mistik tonda. 1-2 cümle.`
        ));
      }
    });
  }

  // ─── Relationship Compatibility Analysis ─────────────────────────
  async function fillCompatibilityAnalysis() {
    var scoreEl = document.querySelector('.text-5xl, .text-6xl, [class*="score"]');
    var score = scoreEl ? scoreEl.textContent.trim().replace(/\D/g,'') : '88';
    var nameEls = document.querySelectorAll('p.font-semibold, h3.font-bold, p.text-white.font-semibold');
    var names = nameEls.length >= 2 ? nameEls[0].textContent + ' ve ' + nameEls[1].textContent : 'İki ruh';

    var textEls = document.querySelectorAll('p.text-white\\/80, p.text-white\\/70, p.leading-relaxed, p.text-sm.italic, p.text-base');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && !el.closest('[id*="share"]') && count < 6) {
        count++;
        var prompts = [
          `${names} arasındaki uyum skoru %${score}. Bu birlikteliğin kozmik anlamı ve ruhsal bağı. 3 cümle, derin ve romantik.`,
          `%${score} uyum skoru taşıyan ${names} için ilişkinin güçlü yönleri. 2 cümle.`,
          `${names} ilişkisinde zorluklar ve büyüme fırsatları. 2 cümle, yapıcı ton.`,
          `${names} birlikteliğinin evrensel amacı ve karmaik bağlantısı. 2 cümle.`,
          `${names} için aşk dili ve duygusal uyum analizi. 2 cümle.`,
          `${names} ikilisinin gelecek enerjisi ve ortak yolculuğu. 2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Profile / Soul Journey ───────────────────────────────────────
  async function fillProfileSoulJourney() {
    var ctx = getUserContext();
    var lifeNum = ctx.lifePathNumber;
    var nameEl = document.querySelector('h1, h2.font-bold, .profile-name');
    var name = nameEl ? nameEl.textContent.trim() : ctx.userName;

    var textEls = document.querySelectorAll('p, .bio-text, .description, li');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && count < 5) {
        count++;
        var gCtx2 = ctx.gender ? ' (Cinsiyet: ' + ctx.gender + ')' : '';
        var prompts = [
          `${name}${gCtx2} için Yaşam Yolu ${lifeNum} kapsamlı ruh yolculuğu analizi. Cinsiyete uygun hitap et. 3 cümle, kişisel ve ilham verici.`,
          `Yaşam Yolu ${lifeNum} olan ${name}${gCtx2}'in ruhsal misyonu ve bu dünyaya geliş amacı. 2 cümle.`,
          `${name}'in güçlü yönleri ve doğal yetenekleri numeroloji perspektifinden.${gCtx2} 2 cümle.`,
          `${name}${gCtx2} için 2026 yılı enerjisi ve fırsatları. 2 cümle.`,
          `${name}'in ruh eşi ve ilişki enerjisi hakkında kozmik mesaj. ${ctx.gender === 'kadın' ? 'Bir kadın' : ctx.gender === 'erkek' ? 'Bir erkek' : 'Bir kişi'} perspektifinden yaz. 2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Mystic Numerology Home ───────────────────────────────────────
  async function fillNumerologyHome() {
    var ctx = getUserContext();

    // "Abundance" veya vibrasyon başlığı altındaki açıklama
    var vibDesc = document.querySelector('p.text-white\\/70.text-sm, p.leading-relaxed.text-sm.text-white');
    if (vibDesc && !vibDesc.closest('nav')) {
      skeletonFill(vibDesc, askAI(
        `${ctx.date}, ${ctx.day}. Titreşim ${Math.floor(ctx.dayNum % 9) + 1} günü için kısa kozmik mesaj. 2 cümle, enerji odaklı.`
      ));
    }

    // Celestial forecast
    var celestialEl = document.querySelector('#card-celestial p, #card-celestial .italic');
    if (celestialEl) {
      skeletonFill(celestialEl, askAI(
        `${ctx.date} için gezegen hizalaması ve göksel enerji tahmini. 2 cümle, astrolojik ve mistik.`
      ));
    }

    // Lunar insights
    var lunarEl = document.querySelector('#card-lunar p, #card-lunar .italic');
    if (lunarEl) {
      skeletonFill(lunarEl, askAI(
        `${ctx.date} için ay enerjisi ve iç dünya rehberliği. 2 cümle, sezgisel ve derin.`
      ));
    }

    // Oracle quote
    var oracleEl = document.querySelector('p.italic.leading-relaxed, p.font-light.italic');
    if (oracleEl && !oracleEl.closest('nav')) {
      skeletonFill(oracleEl, askAI(
        `${ctx.date} için derin, şiirsel bir numeroloji özdeyişi yaz. 1-2 cümle, tırnak işareti olmadan.`
      ));
    }
  }

  // ─── Cosmic Energy Calendar ───────────────────────────────────────
  async function fillCosmicCalendar() {
    var ctx = getUserContext();
    var monthEl = document.querySelector('h1, h2, .month-title, .text-3xl');
    var month = monthEl ? monthEl.textContent.trim() : ctx.date;

    var textEls = document.querySelectorAll('p.leading-relaxed, p.text-white\\/70, p.text-white\\/80, .description p, p.text-sm');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 6) {
        count++;
        var prompts = [
          `${month} için kozmik enerji akışı ve genel atmosfer. 2 cümle.`,
          `${month} boyunca güçlü günler ve dikkat edilmesi gereken dönemler. 2 cümle.`,
          `${month} için kariyer ve maddi alan enerjisi. 2 cümle.`,
          `${month} için aşk ve ilişkiler enerjisi. 2 cümle.`,
          `${month} için sağlık ve enerji tavsiyesi. 2 cümle.`,
          `${month} için spiritüel büyüme fırsatları. 2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Wheel of Destiny ─────────────────────────────────────────────
  async function fillWheelOfDestiny() {
    var ctx = getUserContext();
    var textEls = document.querySelectorAll('p.text-white\\/70, p.text-white\\/60, p.leading-relaxed, .description');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 3) {
        count++;
        skeletonFill(el, askAI(
          `${ctx.date} için Kader Çarkı spin öncesi kozmik hazırlık mesajı. 2 cümle, merak uyandırıcı ve mistik.`
        ));
      }
    });
  }

  // ─── Wheel Reward Success ─────────────────────────────────────────
  async function fillWheelRewardSuccess() {
    var resultEl = document.querySelector('.result-text, h2, h3, .reward-title');
    var result = resultEl ? resultEl.textContent.trim() : 'Kozmik mesaj';

    var textEls = document.querySelectorAll('p.text-white\\/70, p.leading-relaxed, p.text-base');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && count < 3) {
        count++;
        skeletonFill(el, askAI(
          `Kader Çarkından "${result}" sonucu çıktı. Bu sonucun kozmik anlamı ve bugüne mesajı. 2-3 cümle.`
        ));
      }
    });
  }

  // ─── Numerology Meaning Chart ─────────────────────────────────────
  async function fillNumerologyMeaningChart() {
    var textEls = document.querySelectorAll('p, td, .meaning-text, .description');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && count < 8) {
        count++;
        var num = count;
        skeletonFill(el, askAI(
          `${num} sayısının temel anlamı, enerjisi ve bu sayıyı taşıyan kişinin özellikleri. 2 cümle.`
        ));
      }
    });
  }

  // ─── Letter Vibration Detail ───────────────────────────────────────
  async function fillLetterVibrationDetail() {
    var letterEl = document.querySelector('h1, h2, .letter-display, .text-8xl');
    var letter = letterEl ? letterEl.textContent.trim().charAt(0) : 'A';
    var numEl = document.querySelector('.vibration-num, .text-5xl, .text-6xl');
    var num = numEl ? numEl.textContent.trim().replace(/\D/g,'') : '1';

    var textEls = document.querySelectorAll('p.leading-relaxed, p.text-white\\/70, p.text-base');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 4) {
        count++;
        var prompts = [
          `${letter} harfinin numerolojik titreşimi (${num}) ve taşıdığı enerji. 2 cümle.`,
          `${letter} harfi başında olan isimlerin kişilik özellikleri. 2 cümle.`,
          `${letter} harfinin kozmik anlamı ve ruhsal mesajı. 2 cümle.`,
          `${num} titreşimini taşıyan ${letter} harfi için günlük tavsiye. 2 cümle.`,
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Past Reading Archive ─────────────────────────────────────────
  async function fillPastReadingArchive() {
    var textEls = document.querySelectorAll('p.text-white\\/70, p.leading-relaxed, p.italic, .reading-text');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 4) {
        count++;
        skeletonFill(el, askAI(
          `Geçmiş bir numeroloji okuması için özet yorum ve bu deneyimin kişisel büyümeye katkısı. 2 cümle.`
        ));
      }
    });
  }

  // ─── Premium Crystal Store ─────────────────────────────────────────
  async function fillCrystalStore() {
    var crystalCards = document.querySelectorAll('.crystal-card, [class*="card"] p, .product-desc');
    var crystalNames = ['Ametist','Sitrin','Obsidyen','Lapis Lazuli','Kuvars','Ay Taşı','Roze Kuvars','Turmalin'];
    var count = 0;
    crystalCards.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 6) {
        var crystal = crystalNames[count % crystalNames.length];
        count++;
        skeletonFill(el, askAI(
          `${crystal} kristalinin enerji özellikleri ve ruhsal faydaları. 1-2 cümle, büyüleyici ton.`
        ));
      }
    });
  }

  // ─── Connections / Shared Readings ────────────────────────────────
  async function fillConnectionsSharedReadings() {
    var textEls = document.querySelectorAll('p.text-white\\/70, p.leading-relaxed, p.text-sm');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 4) {
        count++;
        skeletonFill(el, askAI(
          `İki ruh arasındaki numerolojik bağlantı ve paylaşılan enerji alanı. 2 cümle, mistik ton.`
        ));
      }
    });
  }

  // ─── Compatibility Input Form ──────────────────────────────────────
  async function fillCompatibilityInputForm() {
    var textEls = document.querySelectorAll('p.text-white\\/60, p.leading-relaxed, .intro-text, p.text-sm');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 2) {
        count++;
        skeletonFill(el, askAI(
          `İki kişinin doğum tarihlerinden numerolojik uyumun nasıl hesaplandığı hakkında mistik giriş. 2 cümle.`
        ));
      }
    });
  }

  // ─── Cosmic Manifest Portal ───────────────────────────────────────
  async function fillCosmicManifestPortal() {
    var ctx = getUserContext();
    var textEls = document.querySelectorAll('p.text-white\\/60, p.leading-relaxed, p.text-sm, .portal-text');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 20 && !el.closest('nav') && !el.closest('[id*="overlay"]') && !el.closest('footer') && count < 2) {
        count++;
        skeletonFill(el, askAI(
          `${ctx.date} tarihi evrene niyet göndermek için kozmik enerjinin açık olduğunu anlatan ilham verici mesaj. 1-2 cümle.`
        ));
      }
    });
  }

  // ─── App Settings ─────────────────────────────────────────────────
  async function fillAppSettings() {
    var textEls = document.querySelectorAll('p.text-white\\/60, p.text-sm, .setting-desc');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && count < 3) {
        count++;
        skeletonFill(el, askAI(
          `Soulnum uygulamasının ${count}. ayar özelliği için kısa açıklama. 1 cümle, sade ve kullanışlı.`
        ));
      }
    });
  }

  // ─── Kisi Profil ──────────────────────────────────────────────────
  async function fillKisiProfil() {
    var nameEl = document.querySelector('h1, h2, .profile-name');
    var name = nameEl ? nameEl.textContent.trim() : 'Ruh yolcusu';
    var textEls = document.querySelectorAll('p, .bio, .description');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 4) {
        count++;
        skeletonFill(el, askAI(
          `${name} için numeroloji kişilik profili özeti ${count}. 2 cümle.`
        ));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // SAYFA ALGILAMA VE ÇALIŞTIRMA
  // ═══════════════════════════════════════════════════════════════════

  var pageHandlers = {
    'daily_spiritual_guide': fillDailySpiritualGuide,
    'daily_number_deep_dive': fillDailyNumberDeepDive,
    'name_numerology_breakdown_1': fillNameNumerology1,
    'name_numerology_breakdown_2': fillNameNumerology2,
    'name_numerology_breakdown_3': fillNameNumerology3,
    'relationship_compatibility': fillCompatibilityAnalysis,
    'profile_soul_journey': fillProfileSoulJourney,
    'mystic_numerology_home': fillNumerologyHome,
    'cosmic_energy_calendar': fillCosmicCalendar,
    'wheel_of_destiny': fillWheelOfDestiny,
    'wheel_reward_success': fillWheelRewardSuccess,
    'numerology_meaning_chart': fillNumerologyMeaningChart,
    'letter_vibration_detail': fillLetterVibrationDetail,
    'past_reading_archive': fillPastReadingArchive,
    'premium_crystal_store': fillCrystalStore,
    'connections_shared': fillConnectionsSharedReadings,
    'compatibility_input': fillCompatibilityInputForm,
    'cosmic_manifest_portal': fillCosmicManifestPortal,
    'app_settings': fillAppSettings,
    'kisi_profil': fillKisiProfil,
  };

  // Sayfa yüklenince ilgili handler'ı çalıştır
  function runPageHandler() {
    for (var key in pageHandlers) {
      if (PAGE.includes(key)) {
        pageHandlers[key]();
        return;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPageHandler);
  } else {
    setTimeout(runPageHandler, 300); // Sayfanın diğer JS'leri çalışsın diye kısa bekle
  }

})();
