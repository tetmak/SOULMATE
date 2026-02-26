const NumerologyEngine = (function () {
  'use strict';

  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ─── HARF TABLOLARI ───────────────────────────────────────────
  const CHALDEAN = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
    N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
    'Ç': 3, 'Ğ': 3, 'İ': 1, 'I': 1, 'Ö': 7, 'Ş': 3, 'Ü': 6
  };

  // Pisagor sistemi — kullanıcının verdiği tabloya göre (Türkçe karakterler dahil)
  // 1:A,J,S,Ş | 2:B,K,T | 3:C,Ç,L,U,Ü | 4:D,M,V | 5:E,N,W | 6:F,O,Ö,X | 7:G,Ğ,P,Y | 8:H,Q,Z | 9:I,İ,R
  const PYTHAGOREAN = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
    'Ş': 1, 'Ç': 3, 'Ü': 3, 'Ö': 6, 'Ğ': 7, 'İ': 9
  };

  const VOWELS = 'AEIOUİIÖÜ';

  const NUMBER_MEANINGS = {
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
      n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
    }
    return n;
  }

  function calcNameNumber(name, system) {
    const table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    const clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    let sum = 0;
    for (let i = 0; i < clean.length; i++) sum += (table[clean[i]] || 0);
    return reduce(sum);
  }

  function calcSoulUrge(name, system) {
    const table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    const clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    let sum = 0;
    for (let i = 0; i < clean.length; i++) {
      if (VOWELS.includes(clean[i])) sum += (table[clean[i]] || 0);
    }
    return reduce(sum);
  }

  function calcLifePath(dateStr) {
    if (!dateStr) return 1; // Default Life Path
    const digits = dateStr.replace(/\D/g, '');
    if (!digits) return 1;
    const sum = digits.split('').reduce((a, d) => a + parseInt(d), 0);
    return reduce(sum);
  }

  function getLetterValues(name, table) {
    return name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ ]/g, '').split('').map(ch => {
      if (ch === ' ') return { char: ' ', val: null };
      return { char: ch, val: table[ch] || 0 };
    });
  }

  // Helper: Get Consonants for Personality Number
  function calcPersonality(name, system) {
    const table = PYTHAGOREAN; // Sadece Pythagorean kullanılıyor
    const letters = getLetterValues(name, table);
    const sum = letters.filter(l => !VOWELS.includes(l.char) && l.char !== ' ')
      .reduce((acc, curr) => acc + curr.val, 0);
    return reduce(sum);
  }

  // Helper: Simplified Moon Phase
  function getMoonPhase(date) {
    const known = new Date(2000, 0, 6);
    const age = (((date - known) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
    if (age < 1.85) return 'New Moon';
    if (age < 7.38) return 'Waxing Crescent';
    if (age < 9.22) return 'First Quarter';
    if (age < 14.77) return 'Waxing Gibbous';
    if (age < 16.61) return 'Full Moon';
    if (age < 22.15) return 'Waning Gibbous';
    if (age < 23.99) return 'Last Quarter';
    return 'Waning Crescent';
  }

  // ─── PISAGOR EĞİTİM PROMPTU (sistem bazı) ────────────────────
  const PISAGOR_SYSTEM_BASE = `Sen bir Numeroloji Analiz Uzmanısın. Pisagor numeroloji sistemini kullanarak insanların doğum tarihlerinden ve isimlerinden karakter, kader ve ruh analizi yaparsın.

HESAPLAMA MANTIĞI:
- Tüm sayılar tek haneye (1-9) indirilene kadar toplanır.
- İstisna (Üstat Sayılar): 11, 22 veya 33 sayılarına ulaşırsan bunları indirme — "Üstat Sayı" olarak bırak ve buna göre analiz yap.

ANALİZ BÖLÜMLERİ:
- Kader Yolu (Hayat Amacı): Doğum tarihi rakamlarının toplamı. Kişinin bu dünyadaki ana rotası.
- Ruh Güdüsü (Kalp Arzusu): İsmin SESLİ harflerinin sayısal toplamı. İçsel motivasyon ve gizli arzular.
- Kişilik Sayısı: İsmin SESSİZ harflerinin sayısal toplamı. Dış dünyaya verilen imaj ve ilk izlenim.
- İfade Sayısı: İsmin tüm harflerinin toplamı. Yetenekler ve genel yaşam misyonu.

HARF-SAYI TABLOSU (Pisagor):
1: A, J, S, Ş | 2: B, K, T | 3: C, Ç, L, U, Ü | 4: D, M, V | 5: E, N, W | 6: F, O, Ö, X | 7: G, Ğ, P, Y | 8: H, Q, Z | 9: I, İ, R

KİŞİLİK KURALLARI:
- Türkçe yaz. Vaaz verme. Doğrudan "sen" diye hitap et.
- Başlık yazma, liste yazma — sadece düz paragraflar.
- Sade, güçlü, klişesiz.
- Ton kılavuzu → 1: ateşli/meydan okuyan | 2: yumuşak/hüzünlü | 3: parlak/kaygılı | 4: ağır/ciddi/toprak | 5: hızlı/keskin/kaosçu | 6: şefkatli/boğucu | 7: soğuk derinlik/seçilmiş yalnızlık | 8: güç arayışı/yıkıcı hırs | 9: bilge yorgunluğu | 11: sezgi yükü | 22: izole vizyoner | 33: saf sevgi`;

  // Kart bazlı kullanıcı promptları
  const CARD_PROMPTS = {
    soul: (ctx) => `${ctx.name} (${ctx.gender || 'bilinmiyor'}) için Ruh Güdüsü (Kalp Arzusu) analizi — Sayı: ${ctx.soulUrgeNumber}.
İçsel motivasyonu, kimseye söylemediği gizli arzuları, sevgi dili ve duygusal gerçeklerini yaz.
Cinsiyete uygun hitap et ve cinsiyet perspektifini analze yansıt.
Kişilik veya Kader Yolu hakkında yazmak KESİNLİKLE yasak.
${ctx.soulUrgeNumber} sayısının tonuyla, 4 kısa paragraf, 150-170 kelime.`,

    pers: (ctx) => `${ctx.name} (${ctx.gender || 'bilinmiyor'}) için Kişilik Sayısı analizi — Sayı: ${ctx.personalityNumber}.
Dışarıya yansıttığı imajı, insanların ${ctx.gender === 'kadın' ? 'onu' : ctx.gender === 'erkek' ? 'onu' : 'bu kişiyi'} ilk tanıdığında ne hissettiğini, toplumsal maskesini yaz.
Cinsiyete uygun hitap et.
Ruh Güdüsü veya Kader Yolu hakkında yazmak KESİNLİKLE yasak.
${ctx.personalityNumber} sayısının tonuyla, 4 kısa paragraf, 150-170 kelime.`,

    lp: (ctx) => `${ctx.name} (${ctx.gender || 'bilinmiyor'}) için Kader Yolu (Hayat Amacı) analizi — Sayı: ${ctx.lifePathNumber}.
Bu hayattaki büyük amacını, kaderin ${ctx.gender === 'kadın' ? 'onu' : ctx.gender === 'erkek' ? 'onu' : 'bu kişiyi'} nereye çektiğini, hayat boyunca tekrar eden temaları yaz.
Cinsiyete uygun hitap et ve analizi cinsiyetin perspektifinden zenginleştir.
Ruh Güdüsü veya Kişilik hakkında yazmak KESİNLİKLE yasak.
Eğer ${ctx.lifePathNumber} bir Üstat Sayı ise (11/22/33) bunun yüksek potansiyelini ve zorluklarını özellikle vurgula.
${ctx.lifePathNumber} sayısının tonuyla, 4 kısa paragraf, 150-170 kelime.`,

    full: (ctx) => `${ctx.name} (Cinsiyet: ${ctx.gender || 'bilinmiyor'}) için PREMIUM TAM KADER ANALİZİ. Doğum Tarihi: ${ctx.birthDate}.

SAYILAR:
- Kader Yolu (Hayat Amacı): ${ctx.lifePathNumber}
- İfade (İsim) Sayısı: ${ctx.expressionNumber}
- Ruh Güdüsü (Kalp Arzusu): ${ctx.soulUrgeNumber}
- Kişilik Sayısı: ${ctx.personalityNumber}

${(ctx.lifePathNumber === 11 || ctx.lifePathNumber === 22 || ctx.lifePathNumber === 33) ? `⚠️ ÜSTAT SAYI TESPİTİ: Kader Yolu ${ctx.lifePathNumber} bir Üstat Sayıdır. Bunu analizin merkezine al, yüksek potansiyeli VE ağır yükünü ayrıntılı anlat.` : ''}

YAZI KURALLARI:
- Türkçe. Vaaz yok. "Sen" diye hitap et.
- Cinsiyete uygun hitap et ve cinsiyet perspektifini analize yansıt (${ctx.gender === 'kadın' ? 'kadın' : ctx.gender === 'erkek' ? 'erkek' : 'kişi'} perspektifi).
- Başlık yok, madde işareti yok. Sadece akıcı düz paragraflar.
- ${ctx.lifePathNumber} sayısının tonu hâkim — ton kılavuzuna bak.
- Her paragraf bir öncekinden daha derine iner.

PARAGRAF YAPISI (tam olarak bu 8 paragrafı yaz):

1. AÇILIŞ — ${ctx.name} adı ve ${ctx.lifePathNumber} Kader Yolunun birleşiminden doğan ilk gerçek. Keskin, sarsıcı.

2. KADER YOLU (${ctx.lifePathNumber}) — Bu sayının ${ctx.name}'in hayatındaki büyük amacını, tekrar eden örüntüleri ve kaderin onu hangi yöne çektiğini anlat. Somut ve derin.

3. RUH GÜDÜSİ (${ctx.soulUrgeNumber}) — İçsel arzu ve gizli motivasyonlar. Kimseye itiraf etmediği istekler. Duygusal gerçekler.

4. KİŞİLİK MASKES (${ctx.personalityNumber}) — Dış dünyaya yansıyan imaj ile iç dünya arasındaki uçurum veya uyum. İnsanlar ${ctx.name}'i nasıl görür — bu doğru mu?

5. İFADE MİSYONU (${ctx.expressionNumber}) — Yaşam boyunca kullanması gereken asıl yetenekler ve misyon. Ne yapması gerektiği değil, ne OLMASI gerektiği.

6. SAYI GERİLİMLERİ — ${ctx.lifePathNumber}, ${ctx.soulUrgeNumber} ve ${ctx.expressionNumber} arasındaki çatışmalar veya uyumlar. Bu sayılar birbirine ne zaman yardım eder, ne zaman savaşır?

7. TUZAKLAR VE KARARLI ANLAR — ${ctx.name}'in kaçınması gereken enerji kalıpları, tekrar eden hayat hataları. Acımasızca dürüst ol.

8. KAPANIŞ — Bir gerçek, bir soru değil. ${ctx.name}'in adını kullanarak bitir. 350-400 kelime toplam.`
  };

  // AI Analysis Fetcher — Pisagor Sistemi
  async function getAIAnalysis(type, number, context) {
    // API key artık /api/openai proxy'si tarafından server-side ekleniyor

    const system = context.system || 'pythagorean';
    var genderLabel = '';
    if (context.gender === 'female' || context.gender === 'kadın') genderLabel = 'kadın';
    else if (context.gender === 'male' || context.gender === 'erkek') genderLabel = 'erkek';
    const numCtx = {
      name: context.name,
      birthDate: context.birthDate,
      gender: genderLabel,
      lifePathNumber: calcLifePath(context.birthDate),
      expressionNumber: calcNameNumber(context.name, system),
      soulUrgeNumber: calcSoulUrge(context.name, system),
      personalityNumber: calcPersonality(context.name, system)
    };

    let cardPromptFn = CARD_PROMPTS[type] || CARD_PROMPTS.full;
    let userPrompt = cardPromptFn(numCtx);

    // Context Engine varsa — full analiz promptuna bağlam bilgisi ekle
    if (type === 'full' && window.NumerologyContext && context.birthDate) {
      try {
        const weightedCtx = window.NumerologyContext.buildContext({
          life_path: numCtx.lifePathNumber,
          personality_number: numCtx.personalityNumber,
          expression_number: numCtx.expressionNumber,
          soul_urge: numCtx.soulUrgeNumber,
          karmic_debt: null, // karmic ayrı kart olarak işleniyor
          birthDate: context.birthDate
        });

        let contextAddition = '\n\nBAĞLAM BİLGİSİ (bunu analize entegre et):\n';
        contextAddition += '- Baskın temalar: ' + weightedCtx.dominant_themes.join(', ') + '\n';
        contextAddition += '- Gerilim alanları: ' + weightedCtx.tension_areas.join(', ') + '\n';
        contextAddition += '- Yoğunluk: ' + weightedCtx.intensity + '/2.5\n';
        if (weightedCtx.period) {
          contextAddition += '- Kişisel Yıl: ' + weightedCtx.period.personal_year + ' (Yıl temaları: ' + weightedCtx.period.year_themes.join(', ') + ')\n';
          contextAddition += '- Kişisel Ay: ' + weightedCtx.period.personal_month + ', Kişisel Gün: ' + weightedCtx.period.personal_day + '\n';
          contextAddition += 'ÖNEMLİ: Bu kişi şu an Kişisel Yıl ' + weightedCtx.period.personal_year + ' döneminde. ';
          contextAddition += 'Analizi bu döneme göre uyarla — hangi temalar şu an aktif, hangileri arka planda.\n';
        }
        if (weightedCtx.is_master_path) {
          contextAddition += '- ÜSTAT SAYI AKTİF — yoğunluğu ve çift katmanlı doğayı vurgula.\n';
        }

        userPrompt += contextAddition;
      } catch(e) {
        // Context engine hata verirse orijinal promptu kullan
        console.warn('[NumerologyEngine] Context enrichment skipped:', e);
      }
    }

    try {
      const response = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: PISAGOR_SYSTEM_BASE },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.85,
          max_tokens: type === 'full' ? 1200 : 400
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.error('AI Analysis Error:', e);
      return null;
    }
  }

  // UI Renderer
  async function renderBreakdown(table, data) {
    if (!data || !data.name) return;
    const name = data.name.trim();
    const nameUpper = name.toUpperCase();

    // 1. Title
    const nameTitle = document.querySelector('h1.tracking-widest.text-4xl, h1.font-extrabold');
    if (nameTitle) nameTitle.textContent = nameUpper;

    // 2. Letters
    const letterContainer = document.querySelector('.flex.flex-wrap.justify-center.gap-2.py-6, .flex.flex-wrap.justify-center.gap-2.pt-4.pb-2');
    if (letterContainer) {
      const letters = getLetterValues(name, table);
      letterContainer.innerHTML = letters.filter(l => l.char !== ' ').map(l => {
        const isVowel = VOWELS.includes(l.char);
        return `<div class="flex flex-col items-center">
          <span class="text-primary text-xs font-bold mb-1 letter-glow">${l.val}</span>
          <div class="w-10 h-14 flex items-center justify-center border ${isVowel ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5'} rounded-lg text-2xl font-bold">${l.char}</div>
        </div>`;
      }).join('');
    }

    // 3. Numbers Calculation
    const systemName = (table === PYTHAGOREAN) ? 'pythagorean' : 'chaldean';
    const soulNum = calcSoulUrge(name, systemName);
    const expNum = calcNameNumber(name, systemName);
    const lpNum = calcLifePath(data.birthDate);
    const persNum = calcPersonality(name, systemName);

    // 4. Expression Display
    const bigExpEl = document.querySelector('h3.text-7xl');
    if (bigExpEl) bigExpEl.textContent = expNum;

    const expBadge = document.querySelector('.bg-primary.px-3.py-1.rounded-full');
    if (expBadge) expBadge.textContent = 'Number ' + expNum;

    // 5. Accordion Numbers & Archive Detail (Safe Selection)
    const accordionSection = document.querySelector('section.px-4.space-y-3');
    const archiveStats = document.querySelector('.flex.items-center.gap-6.mt-4.pt-4'); // Archive page stats

    if (accordionSection || archiveStats) {
      const isArchive = !!archiveStats;

      // Update numbers
      if (isArchive) {
        const stats = archiveStats.querySelectorAll('.text-2xl.font-bold');
        if (stats[0]) stats[0].textContent = lpNum;   // Life Path
        if (stats[1]) stats[1].textContent = soulNum; // Soul Urge
        if (stats[2]) stats[2].textContent = expNum;  // Destiny/Expression
      } else {
        const numDisplays = accordionSection.querySelectorAll('.text-3xl.font-black, .text-2xl.font-black');
        if (numDisplays[0]) numDisplays[0].textContent = soulNum;
        if (numDisplays[1]) numDisplays[1].textContent = persNum;
        if (numDisplays[2]) numDisplays[2].textContent = lpNum;
      }

      // Archetypes / Labels
      if (!isArchive) {
        const archetypeBadges = accordionSection.querySelectorAll('[class*="bg-primary/10"][class*="text-primary"]');
        if (archetypeBadges[0]) archetypeBadges[0].textContent = (NUMBER_MEANINGS[soulNum] || {}).title || 'THE SOUL';
        if (archetypeBadges[1]) archetypeBadges[1].textContent = (NUMBER_MEANINGS[persNum] || {}).title || 'THE PERSONA';
        if (archetypeBadges[2]) archetypeBadges[2].textContent = (NUMBER_MEANINGS[lpNum] || {}).title || 'THE JOURNEY';
      }

      // 6. Content Rendering (Accordions vs Parchment)
      if (isArchive) {
        const parchment = document.querySelector('.parchment-texture');
        if (parchment) {
          const contentArea = parchment.querySelector('.space-y-8') || parchment;

          // Clear and show single big loading
          contentArea.innerHTML = `<div class="ai-loading" style="padding:60px 40px; text-align:center; opacity:0.7; font-style:italic;">
              <span class="material-symbols-outlined" style="font-size:52px; display:block; margin:0 auto 20px; color:#cfa117; animation: spin 3s linear infinite;">auto_awesome</span>
              <p style="color:#cfa117; font-size:15px; margin-bottom:8px; font-weight:600;">Üstat tüm sayıların gizli sesini dinliyor...</p>
              <p style="font-size:12px; opacity:0.6;">Bu derin okuma 20-30 saniye sürebilir</p>
            </div>`;

          getAIAnalysis('full', 0, { name, birthDate: data.birthDate, gender: data.gender, system: systemName }).then(result => {
            if (result) {
              const paragraphs = result.split(/\n\n+/).filter(p => p.trim());
              const formatted = paragraphs.map((p, i) => {
                const text = p.trim();
                // İlk paragraf büyük harfli drop cap efektiyle
                if (i === 0) {
                  return `<p style="margin-bottom:24px; font-size:17px; line-height:1.9;">${text}</p>`;
                }
                return `<p style="margin-bottom:20px; font-size:16px; line-height:1.85; text-align:justify;">${text}</p>`;
              }).join('');
              contentArea.innerHTML = `<div style="padding:32px 24px;">${formatted}</div>`;
            } else {
              contentArea.innerHTML = `<p style="padding:40px; color:#ef4444; text-align:center;">Analiz şu an yüklenemiyor. Lütfen tekrar deneyin.</p>`;
            }
          });
        }
      } else {
        const dataMap = [
          { id: soulNum, label: 'Soul Urge', type: 'soul' },
          { id: persNum, label: 'Personality', type: 'pers' },
          { id: lpNum, label: 'Life Path', type: 'lp' }
        ];

        const cards = accordionSection.querySelectorAll(':scope > div');
        cards.forEach((card, i) => {
          let contentDiv = card.querySelector('.dynamic-accordion-content');
          if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'dynamic-accordion-content';
            contentDiv.style.display = 'none';
            contentDiv.style.padding = '16px 20px';
            contentDiv.style.color = 'rgba(255,255,255,0.7)';
            contentDiv.style.fontSize = '14px';
            contentDiv.style.lineHeight = '1.6';
            contentDiv.style.borderTop = '1px solid rgba(255,255,255,0.08)';
            card.appendChild(contentDiv);

            const btn = card.querySelector('button');
            if (btn && !btn.dataset.hasAccordion) {
              btn.dataset.hasAccordion = "true";
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                const icon = btn.querySelector('.material-symbols-outlined:last-child');
                const isHidden = contentDiv.style.display === 'none';
                contentDiv.style.display = isHidden ? 'block' : 'none';
                if (icon) icon.textContent = isHidden ? 'expand_less' : 'expand_more';
              });
            }
          }

          const item = dataMap[i];
          if (item) {
          contentDiv.innerHTML = `
              <div class="ai-content-wrapper" style="padding:16px 20px;">
                <div class="acc-loading" style="color:rgba(207,161,23,0.5); font-size:13px; font-style:italic; animation: acc-pulse 1.5s infinite; display:flex; align-items:center; gap:8px;">
                  <span class="material-symbols-outlined" style="font-size:16px;">auto_awesome</span>
                  ✦ Analiz hazırlanıyor...
                </div>
                <div class="ai-text" style="display:none; color:rgba(255,255,255,0.85); font-size:14px; line-height:1.85;"></div>
              </div>
            `;

            getAIAnalysis(item.type, item.id, { name, birthDate: data.birthDate, gender: data.gender, system: systemName }).then(result => {
              const wrapper = contentDiv.querySelector('.ai-content-wrapper');
              if (!wrapper) return;
              const loading = wrapper.querySelector('.acc-loading');
              const textEl = wrapper.querySelector('.ai-text');
              if (result) {
                if (loading) loading.style.display = 'none';
                if (textEl) {
                  textEl.innerHTML = result
                    .split(/\n\n+/)
                    .filter(p => p.trim())
                    .map(p => `<p style="margin-bottom:12px;">${p.trim()}</p>`)
                    .join('');
                  textEl.style.display = 'block';
                }
              } else {
                if (loading) loading.innerHTML = `<span style="color:#ef4444">Analiz şu an yüklenemiyor.</span>`;
              }
            });
          }
        });
      }
    }

    // Add spin animation to head if not present
    if (!document.getElementById('ai-spin-style')) {
      const style = document.createElement('style');
      style.id = 'ai-spin-style';
      style.textContent = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes acc-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes acc-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .dynamic-accordion-content .ai-text { animation: acc-in 0.5s ease; }
      `;
      document.head.appendChild(style);
    }

    const headerName = document.querySelector('h2.font-extrabold, h2.text-lg.font-extrabold');
    if (headerName && !headerName.textContent.includes('&')) headerName.textContent = nameUpper;
  }

  async function initBreakdownPage() {
    const params = new URLSearchParams(window.location.search);
    const kisiName = params.get('kisi');
    let data = null;

    // 1. URL parametresiyle başka kişi analizi
    if (kisiName && window.profile) {
      try {
        const conn = await window.profile.getConnectionDetail(kisiName);
        if (conn) data = { name: conn.fullName, birthDate: conn.birthDate, gender: conn.gender };
      } catch(e) {}
    }

    // 2. URL'de kisi yoksa → her zaman ANA KULLANICI (numerael_user_data)
    if (!data) {
      try { data = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
    }

    // 3. Aktif analiz sadece kisi parametresiyle erişildiğinde kullanılır (yukarıda halledildi)

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

    const getTable = () => {
      // Sadece Pythagorean kullanılıyor
      return PYTHAGOREAN;
    };

    document.querySelectorAll('input[name="system-type"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const renderFunc = window.renderBreakdown || renderBreakdown;
        renderFunc(getTable(), data);
      });
    });

    const renderFunc = window.renderBreakdown || renderBreakdown;
    renderFunc(getTable(), data);
  }

  // Export
  return {
    CHALDEAN,
    PYTHAGOREAN,
    NUMBER_MEANINGS,
    calcNameNumber,
    calcSoulUrge,
    calcLifePath,
    calcPersonality,
    getLetterValues,
    renderBreakdown,
    initBreakdownPage
  };
})();

// Auto-run for breakdown + archive pages
window.addEventListener('load', () => {
  const path = window.location.pathname;
  if (path.includes('name_numerology_breakdown') || path.includes('past_reading_archive_detail')) {
    setTimeout(() => NumerologyEngine.initBreakdownPage(), 100);
  }
});

