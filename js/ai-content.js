/**
 * NUMERAEL — AI Content Engine
 * Generates analyses, interpretations and guides across all pages via OpenAI
 */
(function() {
  'use strict';

  // API key is added server-side by /api/openai proxy
  var PAGE = window.location.pathname.split('/').pop() || '';
  var CACHE_PREFIX = 'numerael_ai_';

  // Use Vercel production URL for native app (Capacitor)
  var isNative = window.location.protocol === 'capacitor:' ||
                 window.location.protocol === 'ionic:' ||
                 window.location.hostname === 'localhost' ||
                 window.location.protocol === 'file:' ||
                 (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = isNative ? 'https://soulmate-kohl.vercel.app' : '';


  // --- AI Auth Helper ---
  var _aiSession = null;
  async function _getAiAuthHeaders() {
    var headers = { 'Content-Type': 'application/json' };
    try {
      if (!_aiSession && window.supabaseClient) {
        var res = await window.supabaseClient.auth.getSession();
        if (res && res.data && res.data.session) {
          _aiSession = res.data.session;
        }
      }
      if (_aiSession && _aiSession.access_token) {
        headers['Authorization'] = 'Bearer ' + _aiSession.access_token;
      }
    } catch(e) { /* auth not available yet */ }
    return headers;
  }
  // ─── Skeleton loading style ────────────────────────────────────────
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

  // ─── OpenAI call ───────────────────────────────────────────────
  async function askAI(prompt, systemMsg) {
    var _aiLang = window.i18n ? window.i18n.getAILang() : 'Türkçe yaz.';
    var _langCode = window.i18n ? window.i18n.current() : 'tr';
    var system = systemMsg || 'You are the Numerology Master of the Numantic app. ' +
        'You have deep wisdom about numbers, cosmic connections and spiritual meanings. ' +
        'Write concisely and impactfully in a mystical, personal tone. ' +
        'No repetition. Only write the requested text, no titles or explanations. ' +
        'CRITICAL LANGUAGE RULE: ' + _aiLang;

    // Append language instruction to user prompt for reliable enforcement
    var finalPrompt = prompt + '\n\n[LANGUAGE: ' + _aiLang + ']';

    var cacheKey = CACHE_PREFIX + _langCode + '_' + btoa(encodeURIComponent(prompt)).slice(0,40);
    var cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;

    var _aiHeaders = await _getAiAuthHeaders();
    var r = await fetch(API_BASE + '/api/openai', {
      method: 'POST',
      headers: _aiHeaders,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: finalPrompt }
        ],
        max_tokens: 400,
        temperature: 0.85,
      })
    });
    var data = await r.json();
    var text = data.choices && data.choices[0] ? data.choices[0].message.content : null;
    if (text) sessionStorage.setItem(cacheKey, text);
    return text;
  }

  
  // ─── AI Disclaimer ────────────────────────────────────────
  function _addAiDisclaimer(container) {
    if (!container || container.querySelector('.ai-disclaimer')) return;
    var d = document.createElement('div');
    d.className = 'ai-disclaimer';
    d.style.cssText = 'margin-top:8px;padding:6px 10px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.1);border-radius:8px;font-size:10px;color:rgba(255,255,255,0.35);font-family:Space Grotesk,sans-serif;text-align:center';
    d.textContent = 'Bu içerik yapay zeka tarafından üretilmiştir ve bilgilendirme amaçlıdır. Profesyonel tavsiye yerine geçmez.';
    container.appendChild(d);
  }

  // ─── Make element skeleton, then fill ─────────────────────────
  function skeletonFill(el, promise) {
    if (!el) return;
    var original = el.innerHTML;
    el.classList.add('ai-skeleton');
    promise.then(function(text) {
      if (!text) return;
      el.classList.remove('ai-skeleton');
      el.classList.add('ai-fade-in');
      el.innerHTML = text;
      _addAiDisclaimer(el.parentElement || el);
    }).catch(function() {
      el.classList.remove('ai-skeleton');
      el.innerHTML = original;
    });
  }

  // ─── Get user context ──────────────────────────────────────
  function getUserContext() {
    var today = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var userName = 'Dear soul';
    var lifePathNumber = '7';
    var userGender = '';
    try {
      var ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}');
      if (ud.name) userName = ud.name.split(' ')[0];
      if (ud.lifePath) lifePathNumber = String(ud.lifePath);
      if (ud.gender) userGender = ud.gender === 'female' ? 'female' : (ud.gender === 'male' ? 'male' : '');
    } catch(e) {}

    // Fallback: check DOM
    var lpEl = document.querySelector('[data-life-path]');
    if (lpEl && lpEl.dataset.lifePath) lifePathNumber = lpEl.dataset.lifePath;
    var unEl = document.querySelector('[data-user-name]');
    if (unEl && unEl.dataset.userName) userName = unEl.dataset.userName;

    return {
      date: months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(),
      day: days[today.getDay()],
      dayNum: today.getDate(),
      lifePathNumber: lifePathNumber,
      userName: userName,
      gender: userGender,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGE CONTENT GENERATORS
  // ═══════════════════════════════════════════════════════════════════

  // ─── Daily Spiritual Guide ────────────────────────────────────────
  async function fillDailySpiritualGuide() {
    var ctx = getUserContext();
    var vibEl = document.querySelector('[class*="Vibration"]') || document.querySelector('.uppercase.tracking-wider');
    var vibNum = vibEl ? vibEl.textContent.replace(/\D/g,'') : Math.floor(Math.random()*9)+1;

    var affirmEl = document.querySelector('h3.text-white.text-3xl, h3.font-bold.text-3xl, h3.text-white.font-bold');
    var insightEl = document.querySelector('p.text-white\\/90, p.leading-relaxed.text-base, .border-l-2 + p, .border-l-2.border-primary ~ p');
    if (!insightEl) insightEl = document.querySelector('.border-l-2');

    var gTag = ctx.gender ? ' (Gender: ' + ctx.gender + ')' : '';
    if (affirmEl) {
      skeletonFill(affirmEl, askAI(
        'Write a powerful daily affirmation for ' + ctx.userName + gTag + ' on ' + ctx.date + ', Vibration ' + vibNum + ' energy. ' +
        'In quotes, personal and cosmically connected. Address gender appropriately. Maximum 12 words.'
      ));
    }
    if (insightEl) {
      skeletonFill(insightEl, askAI(
        'Write a personal daily guidance message for ' + ctx.userName + gTag + ' on ' + ctx.date + ', ' + ctx.day + '. ' +
        'For Vibration ' + vibNum + '. Mention cosmic energy, opportunities of the day and what to watch out for. ' +
        'Use gender-appropriate language. 2-3 sentences, mystical and inspiring tone.'
      ));
    }

    // Ritual sections
    var ritualSections = document.querySelectorAll('.ritual-text, [class*="ritual"] p, .glass-card p');
    ritualSections.forEach(function(el, i) {
      if (el.textContent.trim().length > 30) {
        skeletonFill(el, askAI('Write a ' + (i===0?'morning':'evening') + ' ritual recommendation for Vibration ' + vibNum + '. 1-2 sentences, practical and mystical.'));
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
        var gInfo = ctx.gender ? ' User: ' + ctx.gender + '.' : '';
        var prompts = [
          'Explain the cosmic meaning and today\'s energy of number ' + num + '.' + gInfo + ' 2-3 sentences, deep and mystical.',
          'What opportunities and challenges will a ' + (ctx.gender || 'person') + ' carrying number ' + num + ' face today? 2 sentences.',
          'What is the spiritual message of number ' + num + '?' + gInfo + ' Short, striking, inspiring. 1-2 sentences.',
          'Number ' + num + ' and its effect on love and relationships. Write from a ' + (ctx.gender === 'female' ? 'female' : ctx.gender === 'male' ? 'male' : 'person\'s') + ' perspective. 2 sentences, romantic and cosmic tone.',
        ];
        skeletonFill(el, askAI(prompts[i % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 1 ─────────────────────────────────
  async function fillNameNumerology1() {
    var ctx = getUserContext();
    var nameEl = document.querySelector('h2.font-extrabold, h1.font-bold, .text-primary.font-bold');
    var name = nameEl ? nameEl.textContent.trim() : 'Alex';
    var lifePathEl = document.querySelector('.text-6xl, .text-7xl, .text-8xl, .text-5xl');
    var lifeNum = lifePathEl ? lifePathEl.textContent.trim().replace(/\D/g,'') : '7';

    var textEls = document.querySelectorAll('p, .description, .analysis-text');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 50 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && !el.closest('[id*="share"]') && count < 5) {
        count++;
        var gCtx = ctx.gender ? ' (Gender: ' + ctx.gender + ')' : '';
        var prompts = [
          'Write a Life Path ' + lifeNum + ' analysis for the name ' + name + gCtx + '. Core characteristics and mission. Address gender appropriately. 2-3 sentences.',
          'What is the spiritual meaning and strengths of this number for ' + name + gCtx + ' with Life Path ' + lifeNum + '? 2 sentences.',
          'The effect of letter vibrations in the name ' + name + ' on personality.' + gCtx + ' 2 sentences, mystical tone.',
          'Career and love guidance for a ' + (ctx.gender || 'person') + ' with Life Path ' + lifeNum + '. 2 sentences.',
          'The universal energy of number ' + lifeNum + ' and its cosmic effect on ' + name + gCtx + '. 1-2 sentences.',
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 2 ─────────────────────────────────
  async function fillNameNumerology2() {
    var nameEl = document.querySelector('h2.font-extrabold, .text-lg.font-extrabold');
    var names = nameEl ? nameEl.textContent.replace('&', ' & ') : 'Alex & Maya';

    var sections = document.querySelectorAll('section p, .glass-card p, .card p');
    var count = 0;
    sections.forEach(function(el) {
      if (el.textContent.trim().length > 50 && !el.closest('[id*="overlay"]') && count < 6) {
        count++;
        var prompts = [
          'Deep analysis of the spiritual bond and cosmic attraction between ' + names + '. 2-3 sentences, romantic and mystical.',
          'The energy field created together by ' + names + ' and their life path harmony. 2 sentences.',
          'Shared destiny points and growth areas for ' + names + '. 2 sentences, positive and inspiring.',
          'Communication vibration and emotional resonance between ' + names + '. 2 sentences.',
          'The universal purpose and spiritual lessons of the ' + names + ' partnership. 2 sentences.',
          'Relationship advice and cosmic guidance for ' + names + '. 2 sentences.',
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Name Numerology Breakdown 3 ─────────────────────────────────
  async function fillNameNumerology3() {
    var nameEl = document.querySelector('h2.font-extrabold, h2.text-lg');
    var names = nameEl ? nameEl.textContent.replace('&',' & ') : 'Two souls';

    var textEls = document.querySelectorAll('p, td p, .text-sm');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('header') && !el.closest('[id*="overlay"]') && count < 7) {
        count++;
        skeletonFill(el, askAI(
          'Numerology chart interpretation #' + count + ' for ' + names + '. Short, concise, mystical tone. 1-2 sentences.'
        ));
      }
    });
  }

  // ─── Relationship Compatibility Analysis ─────────────────────────
  async function fillCompatibilityAnalysis() {
    var scoreEl = document.querySelector('.text-5xl, .text-6xl, [class*="score"]');
    var score = scoreEl ? scoreEl.textContent.trim().replace(/\D/g,'') : '88';
    var nameEls = document.querySelectorAll('p.font-semibold, h3.font-bold, p.text-white.font-semibold');
    var names = nameEls.length >= 2 ? nameEls[0].textContent + ' & ' + nameEls[1].textContent : 'Two souls';

    var textEls = document.querySelectorAll('p.text-white\\/80, p.text-white\\/70, p.leading-relaxed, p.text-sm.italic, p.text-base');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 40 && !el.closest('nav') && !el.closest('[id*="overlay"]') && !el.closest('[id*="share"]') && count < 6) {
        count++;
        var prompts = [
          'The compatibility score between ' + names + ' is ' + score + '%. The cosmic meaning and spiritual bond of this partnership. 3 sentences, deep and romantic.',
          'The strengths of the relationship for ' + names + ' with ' + score + '% compatibility score. 2 sentences.',
          'Challenges and growth opportunities in the ' + names + ' relationship. 2 sentences, constructive tone.',
          'The universal purpose and karmic connection of the ' + names + ' partnership. 2 sentences.',
          'Love language and emotional harmony analysis for ' + names + '. 2 sentences.',
          'Future energy and shared journey of ' + names + '. 2 sentences.',
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
        var gCtx2 = ctx.gender ? ' (Gender: ' + ctx.gender + ')' : '';
        var prompts = [
          'Comprehensive soul journey analysis for ' + name + gCtx2 + ' with Life Path ' + lifeNum + '. Address gender appropriately. 3 sentences, personal and inspiring.',
          'The spiritual mission and purpose of coming to this world for ' + name + gCtx2 + ' with Life Path ' + lifeNum + '. 2 sentences.',
          'Strengths and natural talents of ' + name + ' from a numerology perspective.' + gCtx2 + ' 2 sentences.',
          '2026 energy and opportunities for ' + name + gCtx2 + '. 2 sentences.',
          'Cosmic message about the soulmate and relationship energy of ' + name + '. Write from a ' + (ctx.gender === 'female' ? 'female' : ctx.gender === 'male' ? 'male' : 'person\'s') + ' perspective. 2 sentences.',
        ];
        skeletonFill(el, askAI(prompts[(count-1) % prompts.length]));
      }
    });
  }

  // ─── Mystic Numerology Home ───────────────────────────────────────
  async function fillNumerologyHome() {
    var ctx = getUserContext();

    var vibDesc = document.querySelector('p.text-white\\/70.text-sm, p.leading-relaxed.text-sm.text-white');
    if (vibDesc && !vibDesc.closest('nav')) {
      skeletonFill(vibDesc, askAI(
        ctx.date + ', ' + ctx.day + '. Short cosmic message for Vibration ' + (Math.floor(ctx.dayNum % 9) + 1) + ' day. 2 sentences, energy focused.'
      ));
    }

    // Celestial forecast
    var celestialEl = document.querySelector('#card-celestial p, #card-celestial .italic');
    if (celestialEl) {
      skeletonFill(celestialEl, askAI(
        'Planetary alignment and celestial energy forecast for ' + ctx.date + '. 2 sentences, astrological and mystical.'
      ));
    }

    // Lunar insights
    var lunarEl = document.querySelector('#card-lunar p, #card-lunar .italic');
    if (lunarEl) {
      skeletonFill(lunarEl, askAI(
        'Moon energy and inner world guidance for ' + ctx.date + '. 2 sentences, intuitive and deep.'
      ));
    }

    // Oracle quote
    var oracleEl = document.querySelector('p.italic.leading-relaxed, p.font-light.italic');
    if (oracleEl && !oracleEl.closest('nav')) {
      skeletonFill(oracleEl, askAI(
        'Write a deep, poetic numerology aphorism for ' + ctx.date + '. 1-2 sentences, without quotation marks.'
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
          'Cosmic energy flow and general atmosphere for ' + month + '. 2 sentences.',
          'Powerful days and periods to watch out for during ' + month + '. 2 sentences.',
          'Career and financial energy for ' + month + '. 2 sentences.',
          'Love and relationship energy for ' + month + '. 2 sentences.',
          'Health and energy advice for ' + month + '. 2 sentences.',
          'Spiritual growth opportunities for ' + month + '. 2 sentences.',
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
          'Cosmic preparation message before the Wheel of Destiny spin for ' + ctx.date + '. 2 sentences, curiosity-provoking and mystical.'
        ));
      }
    });
  }

  // ─── Wheel Reward Success ─────────────────────────────────────────
  async function fillWheelRewardSuccess() {
    var resultEl = document.querySelector('.result-text, h2, h3, .reward-title');
    var result = resultEl ? resultEl.textContent.trim() : 'Cosmic message';

    var textEls = document.querySelectorAll('p.text-white\\/70, p.leading-relaxed, p.text-base');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && count < 3) {
        count++;
        skeletonFill(el, askAI(
          'The result "' + result + '" came from the Wheel of Destiny. The cosmic meaning and today\'s message of this result. 2-3 sentences.'
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
          'The core meaning, energy and characteristics of a person carrying number ' + num + '. 2 sentences.'
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
          'The numerological vibration (' + num + ') and energy of the letter ' + letter + '. 2 sentences.',
          'Personality traits of names starting with the letter ' + letter + '. 2 sentences.',
          'The cosmic meaning and spiritual message of the letter ' + letter + '. 2 sentences.',
          'Daily advice for the letter ' + letter + ' carrying vibration ' + num + '. 2 sentences.',
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
          'Summary interpretation of a past numerology reading and its contribution to personal growth. 2 sentences.'
        ));
      }
    });
  }

  // ─── Premium Crystal Store ─────────────────────────────────────────
  async function fillCrystalStore() {
    var crystalCards = document.querySelectorAll('.crystal-card, [class*="card"] p, .product-desc');
    var crystalNames = ['Amethyst','Citrine','Obsidian','Lapis Lazuli','Quartz','Moonstone','Rose Quartz','Tourmaline'];
    var count = 0;
    crystalCards.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 6) {
        var crystal = crystalNames[count % crystalNames.length];
        count++;
        skeletonFill(el, askAI(
          'The energy properties and spiritual benefits of ' + crystal + ' crystal. 1-2 sentences, enchanting tone.'
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
          'The numerological connection and shared energy field between two souls. 2 sentences, mystical tone.'
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
          'A mystical introduction about how numerological compatibility is calculated from two people\'s birth dates. 2 sentences.'
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
          'An inspiring message about cosmic energy being open for sending intentions to the universe on ' + ctx.date + '. 1-2 sentences.'
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
          'Short description for the Numantic app\'s setting feature #' + count + '. 1 sentence, clear and useful.'
        ));
      }
    });
  }

  // ─── Kisi Profil ──────────────────────────────────────────────────
  async function fillKisiProfil() {
    var nameEl = document.querySelector('h1, h2, .profile-name');
    var name = nameEl ? nameEl.textContent.trim() : 'Soul traveler';
    var textEls = document.querySelectorAll('p, .bio, .description');
    var count = 0;
    textEls.forEach(function(el) {
      if (el.textContent.trim().length > 30 && !el.closest('nav') && !el.closest('[id*="overlay"]') && count < 4) {
        count++;
        skeletonFill(el, askAI(
          'Numerology personality profile summary #' + count + ' for ' + name + '. 2 sentences.'
        ));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGE DETECTION AND EXECUTION
  // ═══════════════════════════════════════════════════════════════════

  var pageHandlers = {
    'daily_spiritual_guide': fillDailySpiritualGuide,
    'daily_number_deep_dive': fillDailyNumberDeepDive,
    'name_numerology_breakdown_1': fillNameNumerology1,
    // name_numerology_breakdown_2: managed by compatibility-engine.js (with numerology data)
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

  // Run the appropriate handler when page loads
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
    setTimeout(runPageHandler, 300);
  }

})();
