var NumerologyEngine = (function () {
  'use strict';

  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ─── HARF TABLOLARI ───────────────────────────────────────────
  var CHALDEAN = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
    N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
    'Ç': 3, 'Ğ': 3, 'İ': 1, 'I': 1, 'Ö': 7, 'Ş': 3, 'Ü': 6
  };

  // Pisagor sistemi — kullanıcının verdiği tabloya göre (Türkçe karakterler dahil)
  // 1:A,J,S,Ş | 2:B,K,T | 3:C,Ç,L,U,Ü | 4:D,M,V | 5:E,N,W | 6:F,O,Ö,X | 7:G,Ğ,P,Y | 8:H,Q,Z | 9:I,İ,R
  var PYTHAGOREAN = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
    'Ş': 1, 'Ç': 3, 'Ü': 3, 'Ö': 6, 'Ğ': 7, 'İ': 9
  };

  var VOWELS = 'AEIOUİIÖÜ';

  var NUMBER_MEANINGS = {
    1: { title: 'THE LEADER', desc: 'Bağımsız, öncü, lider ruhlu.' },
    2: { title: 'THE DIPLOMAT', desc: 'Duyarlı, uyumlu, işbirlikçi.' },
    3: { title: 'THE CREATOR', desc: 'Yaratıcı, neşeli, ifade gücü.' },
    4: { title: 'THE BUILDER', desc: 'Pratik, güvenilir, disiplinli.' },
    5: { title: 'THE ADVENTURER', desc: 'Özgür ruhlu, meraklı, dinamik.' },
    6: { title: 'THE NURTURER', desc: 'Şefkatli, sorumlu, iyileştirici.' },
    7: { title: 'THE MYSTIC', desc: 'Analitik, sezgisel, derin düşünür.' },
    8: { title: 'THE POWERHOUSE', desc: 'Güçlü, hırslı, maddi başarı.' },
    9: { title: 'THE HUMANITARIAN', desc: 'Merhametli, idealist, evrensel sevgi.' },
    11: { title: 'THE ILLUMINATOR', desc: 'Master sayı. Sezgi ve ilham yüksek.' },
    22: { title: 'THE MASTER BUILDER', desc: 'Master sayı. Büyük vizyonların mimarı.' },
    33: { title: 'THE MASTER TEACHER', desc: 'Master sayı. Saf sevgi ve rehberlik.' }
  };

  function reduce(n) {
    if (n === 11 || n === 22 || n === 33) return n;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function(a, d) { return a + parseInt(d); }, 0);
    }
    return n;
  }

  function calcNameNumber(name, system) {
    var table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    var clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    var sum = 0;
    for (var i = 0; i < clean.length; i++) sum += (table[clean[i]] || 0);
    return reduce(sum);
  }

  function calcSoulUrge(name, system) {
    var table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    var clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    var sum = 0;
    for (var i = 0; i < clean.length; i++) {
      if (VOWELS.includes(clean[i])) sum += (table[clean[i]] || 0);
    }
    return reduce(sum);
  }

  function calcLifePath(dateStr) {
    if (!dateStr) return 1; // Default Life Path
    var digits = dateStr.replace(/\D/g, '');
    if (!digits) return 1;
    var sum = digits.split('').reduce(function(a, d) { return a + parseInt(d); }, 0);
    return reduce(sum);
  }

  function getLetterValues(name, table) {
    return name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ ]/g, '').split('').map(function(ch) {
      if (ch === ' ') return { char: ' ', val: null };
      return { char: ch, val: table[ch] || 0 };
    });
  }

  // Helper: Get Consonants for Personality Number
  function calcPersonality(name, system) {
    var table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    var letters = getLetterValues(name, table);
    var sum = letters.filter(function(l) { return !VOWELS.includes(l.char) && l.char !== ' '; })
      .reduce(function(acc, curr) { return acc + curr.val; }, 0);
    return reduce(sum);
  }

  // Helper: Simplified Moon Phase
  function getMoonPhase(date) {
    var known = new Date(2000, 0, 6);
    var age = (((date - known) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
    if (age < 1.85) return 'New Moon';
    if (age < 7.38) return 'Waxing Crescent';
    if (age < 9.22) return 'First Quarter';
    if (age < 14.77) return 'Waxing Gibbous';
    if (age < 16.61) return 'Full Moon';
    if (age < 22.15) return 'Waning Gibbous';
    if (age < 23.99) return 'Last Quarter';
    return 'Waning Crescent';
  }

  // ─── PYTHAGOREAN SYSTEM PROMPT (system base) ────────────────────
  function getPisagorSystemBase() {
    var _aiLang = window.i18n ? window.i18n.getAILang() : 'Write in Turkish.';
    return 'You are a Numerology Analysis Expert. You analyze character, destiny, and soul readings from people\'s birth dates and names using the Pythagorean numerology system.\n\n' +
      'CALCULATION LOGIC:\n' +
      '- All numbers are summed until reduced to a single digit (1-9).\n' +
      '- Exception (Master Numbers): If you reach 11, 22, or 33, do NOT reduce them — leave them as "Master Numbers" and analyze accordingly.\n\n' +
      'ANALYSIS SECTIONS:\n' +
      '- Life Path (Life Purpose): Sum of birth date digits. The person\'s main route in this world.\n' +
      '- Soul Urge (Heart\'s Desire): Numerical sum of VOWEL letters in the name. Inner motivation and hidden desires.\n' +
      '- Personality Number: Numerical sum of CONSONANT letters in the name. The image and first impression given to the outside world.\n' +
      '- Expression Number: Sum of all letters in the name. Talents and overall life mission.\n\n' +
      'LETTER-NUMBER TABLE (Pythagorean):\n' +
      '1: A, J, S, Ş | 2: B, K, T | 3: C, Ç, L, U, Ü | 4: D, M, V | 5: E, N, W | 6: F, O, Ö, X | 7: G, Ğ, P, Y | 8: H, Q, Z | 9: I, İ, R\n\n' +
      'WRITING RULES:\n' +
      '- CRITICAL LANGUAGE RULE: ' + _aiLang + ' No preaching. Address as "you" directly.\n' +
      '- No headings, no lists — only plain paragraphs.\n' +
      '- Simple, powerful, no cliches.\n' +
      '- Tone guide → 1: fiery/challenging | 2: soft/melancholic | 3: bright/anxious | 4: heavy/serious/grounded | 5: fast/sharp/chaotic | 6: compassionate/suffocating | 7: cold depth/chosen solitude | 8: power-seeking/destructive ambition | 9: wise weariness | 11: burden of intuition | 22: isolated visionary | 33: pure love\n' +
      '- CRITICAL LANGUAGE RULE: ' + _aiLang;
  }

  // Card-based user prompts
  var CARD_PROMPTS = {
    soul: function(ctx) { return 'Soul Urge (Heart\'s Desire) analysis for ' + ctx.name + ' (' + (ctx.gender || 'unknown') + ') — Number: ' + ctx.soulUrgeNumber + '.\n' +
      'Write about their inner motivation, hidden desires they never tell anyone, love language, and emotional truths.\n' +
      'Address with gender-appropriate language and reflect the gender perspective in the analysis.\n' +
      'Writing about Personality or Life Path is STRICTLY forbidden.\n' +
      'In the tone of number ' + ctx.soulUrgeNumber + ', 4 short paragraphs, 150-170 words.'; },

    pers: function(ctx) { var gPronoun = (ctx.gender === 'female' || ctx.gender === 'kadın') ? 'her' : (ctx.gender === 'male' || ctx.gender === 'erkek') ? 'him' : 'this person';
      return 'Personality Number analysis for ' + ctx.name + ' (' + (ctx.gender || 'unknown') + ') — Number: ' + ctx.personalityNumber + '.\n' +
      'Write about the image they project outward, what people feel when they first meet ' + gPronoun + ', and their social mask.\n' +
      'Address with gender-appropriate language.\n' +
      'Writing about Soul Urge or Life Path is STRICTLY forbidden.\n' +
      'In the tone of number ' + ctx.personalityNumber + ', 4 short paragraphs, 150-170 words.'; },

    lp: function(ctx) { var gPronoun = (ctx.gender === 'female' || ctx.gender === 'kadın') ? 'her' : (ctx.gender === 'male' || ctx.gender === 'erkek') ? 'him' : 'this person';
      return 'Life Path (Life Purpose) analysis for ' + ctx.name + ' (' + (ctx.gender || 'unknown') + ') — Number: ' + ctx.lifePathNumber + '.\n' +
      'Write about their great purpose in this life, where destiny pulls ' + gPronoun + ', and the recurring themes throughout their life.\n' +
      'Address with gender-appropriate language and enrich the analysis from the gender perspective.\n' +
      'Writing about Soul Urge or Personality is STRICTLY forbidden.\n' +
      'If ' + ctx.lifePathNumber + ' is a Master Number (11/22/33), especially emphasize its high potential and challenges.\n' +
      'In the tone of number ' + ctx.lifePathNumber + ', 4 short paragraphs, 150-170 words.'; },

    full: function(ctx) {
      var _aiLang = window.i18n ? window.i18n.getAILang() : 'Write in Turkish.';
      var gLabel = (ctx.gender === 'female' || ctx.gender === 'kadın') ? 'female' : (ctx.gender === 'male' || ctx.gender === 'erkek') ? 'male' : 'person';
      var masterNote = (ctx.lifePathNumber === 11 || ctx.lifePathNumber === 22 || ctx.lifePathNumber === 33) ?
        '\n⚠️ MASTER NUMBER DETECTED: Life Path ' + ctx.lifePathNumber + ' is a Master Number. Place this at the center of the analysis, describe both its high potential AND heavy burden in detail.' : '';
      return 'PREMIUM FULL DESTINY ANALYSIS for ' + ctx.name + ' (Gender: ' + (ctx.gender || 'unknown') + '). Birth Date: ' + ctx.birthDate + '.\n\n' +
      'NUMBERS:\n' +
      '- Life Path (Life Purpose): ' + ctx.lifePathNumber + '\n' +
      '- Expression (Name) Number: ' + ctx.expressionNumber + '\n' +
      '- Soul Urge (Heart\'s Desire): ' + ctx.soulUrgeNumber + '\n' +
      '- Personality Number: ' + ctx.personalityNumber + '\n' +
      masterNote + '\n\n' +
      'WRITING RULES:\n' +
      '- CRITICAL LANGUAGE RULE: ' + _aiLang + ' No preaching. Address as "you" directly.\n' +
      '- Address with gender-appropriate language and reflect the gender perspective in the analysis (' + gLabel + ' perspective).\n' +
      '- No headings, no bullet points. Only flowing plain paragraphs.\n' +
      '- The tone of number ' + ctx.lifePathNumber + ' dominates — refer to the tone guide.\n' +
      '- Each paragraph goes deeper than the previous one.\n\n' +
      'PARAGRAPH STRUCTURE (write exactly these 8 paragraphs):\n\n' +
      '1. OPENING — The first truth born from the combination of the name ' + ctx.name + ' and Life Path ' + ctx.lifePathNumber + '. Sharp, striking.\n\n' +
      '2. LIFE PATH (' + ctx.lifePathNumber + ') — Describe this number\'s great purpose in ' + ctx.name + '\'s life, recurring patterns, and which direction destiny pulls them. Concrete and deep.\n\n' +
      '3. SOUL URGE (' + ctx.soulUrgeNumber + ') — Inner desires and hidden motivations. Wishes they never confess to anyone. Emotional truths.\n\n' +
      '4. PERSONALITY MASK (' + ctx.personalityNumber + ') — The gap or harmony between the image projected to the outside world and the inner world. How do people see ' + ctx.name + ' — is it accurate?\n\n' +
      '5. EXPRESSION MISSION (' + ctx.expressionNumber + ') — The true talents and mission they should use throughout life. Not what they should DO, but what they should BE.\n\n' +
      '6. NUMBER TENSIONS — Conflicts or harmonies between ' + ctx.lifePathNumber + ', ' + ctx.soulUrgeNumber + ', and ' + ctx.expressionNumber + '. When do these numbers help each other, when do they fight?\n\n' +
      '7. PITFALLS AND DECISIVE MOMENTS — Energy patterns ' + ctx.name + ' must avoid, recurring life mistakes. Be ruthlessly honest.\n\n' +
      '8. CLOSING — A truth, not a question. End by using ' + ctx.name + '\'s name. 350-400 words total.\n' +
      'CRITICAL LANGUAGE RULE: ' + _aiLang;
    }
  };

  // AI Analysis Fetcher — Pisagor Sistemi
  async function getAIAnalysis(type, number, context) {
    // API key artık /api/openai proxy'si tarafından server-side ekleniyor

    var system = context.system || 'pythagorean';
    var genderLabel = '';
    if (context.gender === 'female' || context.gender === 'kadın') genderLabel = 'female';
    else if (context.gender === 'male' || context.gender === 'erkek') genderLabel = 'male';
    var numCtx = {
      name: context.name,
      birthDate: context.birthDate,
      gender: genderLabel,
      lifePathNumber: calcLifePath(context.birthDate),
      expressionNumber: calcNameNumber(context.name, system),
      soulUrgeNumber: calcSoulUrge(context.name, system),
      personalityNumber: calcPersonality(context.name, system)
    };

    var cardPromptFn = CARD_PROMPTS[type] || CARD_PROMPTS.full;
    var userPrompt = cardPromptFn(numCtx);

    // Context Engine varsa — full analiz promptuna bağlam bilgisi ekle
    if (type === 'full' && window.NumerologyContext && context.birthDate) {
      try {
        var weightedCtx = window.NumerologyContext.buildContext({
          life_path: numCtx.lifePathNumber,
          personality_number: numCtx.personalityNumber,
          expression_number: numCtx.expressionNumber,
          soul_urge: numCtx.soulUrgeNumber,
          karmic_debt: null, // karmic ayrı kart olarak işleniyor
          birthDate: context.birthDate
        });

        var contextAddition = '\n\nCONTEXT INFORMATION (integrate this into the analysis):\n';
        contextAddition += '- Dominant themes: ' + weightedCtx.dominant_themes.join(', ') + '\n';
        contextAddition += '- Tension areas: ' + weightedCtx.tension_areas.join(', ') + '\n';
        contextAddition += '- Intensity: ' + weightedCtx.intensity + '/2.5\n';
        if (weightedCtx.period) {
          contextAddition += '- Personal Year: ' + weightedCtx.period.personal_year + ' (Year themes: ' + weightedCtx.period.year_themes.join(', ') + ')\n';
          contextAddition += '- Personal Month: ' + weightedCtx.period.personal_month + ', Personal Day: ' + weightedCtx.period.personal_day + '\n';
          contextAddition += 'IMPORTANT: This person is currently in Personal Year ' + weightedCtx.period.personal_year + ' period. ';
          contextAddition += 'Adapt the analysis to this period — which themes are currently active, which ones are in the background.\n';
        }
        if (weightedCtx.is_master_path) {
          contextAddition += '- MASTER NUMBER ACTIVE — emphasize the intensity and dual-layered nature.\n';
        }

        userPrompt += contextAddition;
      } catch(e) {
        // Context engine hata verirse orijinal promptu kullan
        console.warn('[NumerologyEngine] Context enrichment skipped:', e);
      }
    }

    try {
      var _h = window.__getAiAuthHeaders ? await window.__getAiAuthHeaders() : { 'Content-Type': 'application/json' };
      var response = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: _h,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: getPisagorSystemBase() },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.85,
          max_tokens: type === 'full' ? 1200 : 400
        })
      });
      var data = await response.json();
      var choices = data.choices;
      var msg = choices && choices[0] ? choices[0].message : null;
      var content = msg ? msg.content : null;
      return content ? content.trim() : null;
    } catch (e) {
      console.error('AI Analysis Error:', e);
      return null;
    }
  }

  // UI Renderer
  async function renderBreakdown(table, data) {
    if (!data || !data.name) return;
    var name = data.name.trim();
    var nameUpper = name.toUpperCase();

    // 1. Title
    var nameTitle = document.querySelector('h1.tracking-widest.text-4xl, h1.font-extrabold');
    if (nameTitle) nameTitle.textContent = nameUpper;

    // 2. Letters
    var letterContainer = document.querySelector('.flex.flex-wrap.justify-center.gap-2.py-6, .flex.flex-wrap.justify-center.gap-2.pt-4.pb-2');
    if (letterContainer) {
      var letters = getLetterValues(name, table);
      letterContainer.innerHTML = letters.filter(function(l) { return l.char !== ' '; }).map(function(l) {
        var isVowel = VOWELS.includes(l.char);
        return '<div class="flex flex-col items-center">' +
          '<span class="text-primary text-xs font-bold mb-1 letter-glow">' + l.val + '</span>' +
          '<div class="w-10 h-14 flex items-center justify-center border ' + (isVowel ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5') + ' rounded-lg text-2xl font-bold">' + l.char + '</div>' +
        '</div>';
      }).join('');
    }

    // 3. Numbers Calculation
    var systemName = (table === PYTHAGOREAN) ? 'pythagorean' : 'chaldean';
    var soulNum = calcSoulUrge(name, systemName);
    var expNum = calcNameNumber(name, systemName);
    var lpNum = calcLifePath(data.birthDate);
    var persNum = calcPersonality(name, systemName);

    // 4. Expression Display
    var bigExpEl = document.querySelector('h3.text-7xl');
    if (bigExpEl) bigExpEl.textContent = expNum;

    var expBadge = document.querySelector('.bg-primary.px-3.py-1.rounded-full');
    if (expBadge) expBadge.textContent = 'Number ' + expNum;

    // 5. Accordion Numbers & Archive Detail (Safe Selection)
    var accordionSection = document.querySelector('section.px-4.space-y-3');
    var archiveStats = document.querySelector('.flex.items-center.gap-6.mt-4.pt-4'); // Archive page stats

    if (accordionSection || archiveStats) {
      var isArchive = !!archiveStats;

      // Update numbers
      if (isArchive) {
        var stats = archiveStats.querySelectorAll('.text-2xl.font-bold');
        if (stats[0]) stats[0].textContent = lpNum;   // Life Path
        if (stats[1]) stats[1].textContent = soulNum; // Soul Urge
        if (stats[2]) stats[2].textContent = expNum;  // Destiny/Expression
      } else {
        var numDisplays = accordionSection.querySelectorAll('.text-3xl.font-black, .text-2xl.font-black');
        if (numDisplays[0]) numDisplays[0].textContent = soulNum;
        if (numDisplays[1]) numDisplays[1].textContent = persNum;
        if (numDisplays[2]) numDisplays[2].textContent = lpNum;
      }

      // Archetypes / Labels
      if (!isArchive) {
        var archetypeBadges = accordionSection.querySelectorAll('[class*="bg-primary/10"][class*="text-primary"]');
        if (archetypeBadges[0]) archetypeBadges[0].textContent = (NUMBER_MEANINGS[soulNum] || {}).title || 'THE SOUL';
        if (archetypeBadges[1]) archetypeBadges[1].textContent = (NUMBER_MEANINGS[persNum] || {}).title || 'THE PERSONA';
        if (archetypeBadges[2]) archetypeBadges[2].textContent = (NUMBER_MEANINGS[lpNum] || {}).title || 'THE JOURNEY';
      }

      // 6. Content Rendering (Accordions vs Parchment)
      if (isArchive) {
        var parchment = document.querySelector('.parchment-texture');
        if (parchment) {
          var contentArea = parchment.querySelector('.space-y-8') || parchment;

          // Clear and show single big loading
          contentArea.innerHTML = '<div class="ai-loading" style="padding:60px 40px; text-align:center; opacity:0.7; font-style:italic;">' +
              '<span class="material-symbols-outlined" style="font-size:52px; display:block; margin:0 auto 20px; color:#cfa117; animation: spin 3s linear infinite;">auto_awesome</span>' +
              '<p style="color:#cfa117; font-size:15px; margin-bottom:8px; font-weight:600;">Üstat tüm sayıların gizli sesini dinliyor...</p>' +
              '<p style="font-size:12px; opacity:0.6;">Bu derin okuma 20-30 saniye sürebilir</p>' +
            '</div>';

          getAIAnalysis('full', 0, { name: name, birthDate: data.birthDate, gender: data.gender, system: systemName }).then(function(result) {
            if (result) {
              var paragraphs = result.split(/\n\n+/).filter(function(p) { return p.trim(); });
              var formatted = paragraphs.map(function(p, i) {
                var text = p.trim();
                // İlk paragraf büyük harfli drop cap efektiyle
                if (i === 0) {
                  return '<p style="margin-bottom:24px; font-size:17px; line-height:1.9;">' + text + '</p>';
                }
                return '<p style="margin-bottom:20px; font-size:16px; line-height:1.85; text-align:justify;">' + text + '</p>';
              }).join('');
              contentArea.innerHTML = '<div style="padding:32px 24px;">' + formatted + '</div>';
            } else {
              contentArea.innerHTML = '<p style="padding:40px; color:#ef4444; text-align:center;">Analiz şu an yüklenemiyor. Lütfen tekrar deneyin.</p>';
            }
          });
        }
      } else {
        var dataMap = [
          { id: soulNum, label: 'Soul Urge', type: 'soul' },
          { id: persNum, label: 'Personality', type: 'pers' },
          { id: lpNum, label: 'Life Path', type: 'lp' }
        ];

        var cards = accordionSection.querySelectorAll(':scope > div');
        cards.forEach(function(card, i) {
          var contentDiv = card.querySelector('.dynamic-accordion-content');
          if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'dynamic-accordion-content';
            contentDiv.style.display = 'none';
            contentDiv.style.padding = '16px 20px';
            contentDiv.style.color = document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.8)';
            contentDiv.style.fontSize = '14px';
            contentDiv.style.lineHeight = '1.6';
            contentDiv.style.borderTop = '1px solid ' + (document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');
            card.appendChild(contentDiv);

            var btn = card.querySelector('button');
            if (btn && !btn.dataset.hasAccordion) {
              btn.dataset.hasAccordion = "true";
              btn.addEventListener('click', function(e) {
                e.preventDefault();
                var icon = btn.querySelector('.material-symbols-outlined:last-child');
                var isHidden = contentDiv.style.display === 'none';
                contentDiv.style.display = isHidden ? 'block' : 'none';
                if (icon) icon.textContent = isHidden ? 'expand_less' : 'expand_more';
              });
            }
          }

          var item = dataMap[i];
          if (item) {
          contentDiv.innerHTML =
              '<div class="ai-content-wrapper" style="padding:16px 20px;">' +
                '<div class="acc-loading" style="color:rgba(207,161,23,0.5); font-size:13px; font-style:italic; animation: acc-pulse 1.5s infinite; display:flex; align-items:center; gap:8px;">' +
                  '<span class="material-symbols-outlined" style="font-size:16px;">auto_awesome</span>' +
                  '✦ Analiz hazırlanıyor...' +
                '</div>' +
                '<div class="ai-text" style="display:none; color:' + (document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.85)' : 'rgba(30,30,30,0.82)') + '; font-size:14px; line-height:1.85;"></div>' +
              '</div>';

            getAIAnalysis(item.type, item.id, { name: name, birthDate: data.birthDate, gender: data.gender, system: systemName }).then(function(result) {
              var wrapper = contentDiv.querySelector('.ai-content-wrapper');
              if (!wrapper) return;
              var loading = wrapper.querySelector('.acc-loading');
              var textEl = wrapper.querySelector('.ai-text');
              if (result) {
                if (loading) loading.style.display = 'none';
                if (textEl) {
                  textEl.innerHTML = result
                    .split(/\n\n+/)
                    .filter(function(p) { return p.trim(); })
                    .map(function(p) { return '<p style="margin-bottom:12px;">' + p.trim() + '</p>'; })
                    .join('');
                  textEl.style.display = 'block';
                }
              } else {
                if (loading) loading.innerHTML = '<span style="color:#ef4444">Analiz şu an yüklenemiyor.</span>';
              }
            });
          }
        });
      }
    }

    // Add spin animation to head if not present
    if (!document.getElementById('ai-spin-style')) {
      var style = document.createElement('style');
      style.id = 'ai-spin-style';
      style.textContent =
        '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' +
        '@keyframes acc-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }' +
        '@keyframes acc-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }' +
        '.dynamic-accordion-content .ai-text { animation: acc-in 0.5s ease; }';
      document.head.appendChild(style);
    }

    var headerName = document.querySelector('h2.font-extrabold, h2.text-lg.font-extrabold');
    if (headerName && !headerName.textContent.includes('&')) headerName.textContent = nameUpper;
  }

  async function initBreakdownPage() {
    var params = new URLSearchParams(window.location.search);
    var kisiName = params.get('kisi');
    var data = null;

    // 1. URL parametresiyle başka kişi analizi — çoklu kaynak
    if (kisiName) {
      // Kaynak 1: numerael_kisi_temp (kisi_profil.html'den geliyorsa)
      try {
        var tempKisi = JSON.parse(localStorage.getItem('numerael_kisi_temp') || 'null');
        if (tempKisi && tempKisi.isTemp && tempKisi.birthDate) {
          data = { name: tempKisi.name || tempKisi.fullName || kisiName, birthDate: tempKisi.birthDate, gender: tempKisi.gender || '' };
        }
      } catch(e) {}

      // Kaynak 2: Supabase discovery_profiles
      if (!data && window.supabaseClient) {
        try {
          var dpRes = await window.supabaseClient.from('discovery_profiles')
            .select('full_name, birth_date, gender')
            .ilike('full_name', '%' + kisiName + '%')
            .limit(1).maybeSingle();
          if (dpRes.data && dpRes.data.birth_date) {
            data = { name: dpRes.data.full_name || kisiName, birthDate: dpRes.data.birth_date, gender: dpRes.data.gender || '' };
          }
        } catch(e) {}
      }

      // Kaynak 3: Supabase profiles
      if (!data && window.supabaseClient) {
        try {
          var profRes = await window.supabaseClient.from('profiles')
            .select('full_name, birth_date, gender')
            .ilike('full_name', '%' + kisiName + '%')
            .limit(1).maybeSingle();
          if (profRes.data && profRes.data.birth_date) {
            data = { name: profRes.data.full_name || kisiName, birthDate: profRes.data.birth_date, gender: profRes.data.gender || '' };
          }
        } catch(e) {}
      }

      // Kaynak 4: localStorage connections
      if (!data && window.profile) {
        try {
          var conn = await window.profile.getConnectionDetail(kisiName);
          if (conn && conn.birthDate) {
            data = { name: conn.fullName || kisiName, birthDate: conn.birthDate, gender: conn.gender || '' };
          }
        } catch(e) {}
      }

      // Fallback: kisi parametresi var ama veri bulunamadı — URL'den gelen ismi kullan
      if (!data) {
        data = { name: kisiName, birthDate: params.get('dt') || '1990-01-01', gender: '' };
      }
    }

    // 2. URL'de kisi yoksa → her zaman ANA KULLANICI (numerael_user_data)
    if (!data) {
      try { data = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
    }

    // 3. Son çare — veri yoksa forma yönlendir (mobilde geç yüklenebilir, 1 kez daha dene)
    if (!data || !data.name) {
      // Mobilde localStorage geç yazılabiliyor — 500ms bekle ve tekrar dene
      await new Promise(function(r) { setTimeout(r, 500); });
      try { data = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
      if (!data || !data.name) {
        window.location.href = 'data-ready_birth_form.html';
        return;
      }
    }

    var getTable = function() {
      // Sadece Pythagorean kullanılıyor
      return PYTHAGOREAN;
    };

    document.querySelectorAll('input[name="system-type"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        var renderFunc = window.renderBreakdown || renderBreakdown;
        renderFunc(getTable(), data);
      });
    });

    var renderFunc = window.renderBreakdown || renderBreakdown;
    renderFunc(getTable(), data);
  }

  // Export
  return {
    CHALDEAN: CHALDEAN,
    PYTHAGOREAN: PYTHAGOREAN,
    NUMBER_MEANINGS: NUMBER_MEANINGS,
    calcNameNumber: calcNameNumber,
    calcSoulUrge: calcSoulUrge,
    calcLifePath: calcLifePath,
    calcPersonality: calcPersonality,
    getLetterValues: getLetterValues,
    renderBreakdown: renderBreakdown,
    initBreakdownPage: initBreakdownPage
  };
})();

window.NumerologyEngine = NumerologyEngine;

// Auto-run for breakdown + archive pages
window.addEventListener('load', function() {
  var path = window.location.pathname;
  if (path.includes('name_numerology_breakdown') || path.includes('past_reading_archive_detail')) {
    setTimeout(function() { NumerologyEngine.initBreakdownPage(); }, 100);
  }
});
