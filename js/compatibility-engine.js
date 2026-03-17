/**
 * NUMERAEL — Compatibility Engine
 * İki kişi arasındaki numeroloji uyumu hesaplama ve AI analiz sistemi.
 * Pisagor sistemi kullanılır. Sadece çift analizi yapar — kişisel analiz değil.
 */
(function () {
  'use strict';

  // ─── PİSAGOR TABLOSU ─────────────────────────────────────────
  // 1:A,J,S,Ş | 2:B,K,T | 3:C,Ç,L,U,Ü | 4:D,M,V | 5:E,N,W | 6:F,O,Ö,X | 7:G,Ğ,P,Y | 8:H,Q,Z | 9:I,İ,R
  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';


  // --- AI Auth Helper ---
  var _aiSession = null;
  async function _getAiAuthHeaders() {
    var headers = { 'Content-Type': 'application/json' };
    try {
      if (!_aiSession && window.supabaseClient) {
        var res2 = await window.supabaseClient.auth.getSession();
        if (res2 && res2.data && res2.data.session) {
          _aiSession = res2.data.session;
        }
      }
      if (_aiSession && _aiSession.access_token) {
        headers['Authorization'] = 'Bearer ' + _aiSession.access_token;
      }
    } catch(e) { /* auth not available yet */ }
    return headers;
  }
  // ─── i18n HELPER ────────────────────────────────────────────
  function _t(k,f){ return window.i18n ? window.i18n.t(k,f) : (f||k); }

  var TABLE = {
    A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9,
    J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9,
    S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8,
    'Ş':1, 'Ç':3, 'Ü':3, 'Ö':6, 'Ğ':7, 'İ':9
  };
  var VOWELS = 'AEIOUİIÖÜ';

  // ─── HESAPLAMA ────────────────────────────────────────────────
  function reduce(n) {
    if (n === 11 || n === 22 || n === 33) return n;
    while (n > 9) {
      n = String(n).split('').reduce(function(a,d){ return a + parseInt(d); }, 0);
      if (n === 11 || n === 22 || n === 33) break;
    }
    return n;
  }

  function calcExpression(name) {
    var clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    var sum = 0;
    for (var i = 0; i < clean.length; i++) sum += (TABLE[clean[i]] || 0);
    return reduce(sum);
  }

  function calcSoulUrge(name) {
    var clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    var sum = 0;
    for (var i = 0; i < clean.length; i++) {
      if (VOWELS.includes(clean[i])) sum += (TABLE[clean[i]] || 0);
    }
    return reduce(sum);
  }

  function calcPersonality(name) {
    var clean = name.toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g, '');
    var sum = 0;
    for (var i = 0; i < clean.length; i++) {
      if (!VOWELS.includes(clean[i])) sum += (TABLE[clean[i]] || 0);
    }
    return reduce(sum);
  }

  function calcLifePath(dateStr) {
    if (!dateStr) return 7;
    var digits = dateStr.replace(/\D/g, '');
    var sum = digits.split('').reduce(function(a,d){ return a + parseInt(d); }, 0);
    return reduce(sum);
  }

  // ─── UYUMLULUK SKORU ─────────────────────────────────────────
  // İki sayı arasındaki uyum matrisi (0-100)
  // Gerçekçi dağılım: ort ~57%, aralık 28-88
  // 80+ = nadir & özel, 60-79 = iyi, 40-59 = orta, <40 = zor
  var COMPAT_MATRIX = {
    // 1: Lider — bağımsız, dominant
    '1-1':52,'1-2':60,'1-3':68,'1-4':38,'1-5':75,'1-6':45,'1-7':55,'1-8':70,'1-9':62,
    // 2: Diplomat — hassas, uyumlu
    '2-2':58,'2-3':65,'2-4':72,'2-5':35,'2-6':80,'2-7':50,'2-8':35,'2-9':68,
    // 3: Yaratıcı — ifadeci, sosyal
    '3-3':55,'3-4':32,'3-5':78,'3-6':62,'3-7':45,'3-8':48,'3-9':72,
    // 4: İnşacı — disiplinli, katı
    '4-4':62,'4-5':28,'4-6':75,'4-7':55,'4-8':80,'4-9':40,
    // 5: Kaşif — özgür, değişken
    '5-5':52,'5-6':38,'5-7':62,'5-8':42,'5-9':68,
    // 6: Bakıcı — şefkatli, sorumlu
    '6-6':65,'6-7':48,'6-8':55,'6-9':82,
    // 7: Mistik — analitik, içe dönük
    '7-7':55,'7-8':42,'7-9':68,
    // 8: Güç — hırslı, maddi odaklı
    '8-8':50,'8-9':45,
    // 9: İnsansever — idealist, fedakar
    '9-9':72,
    // Üstat sayılar — yüksek potansiyel ama kolay değil
    '11-11':82,'11-22':75,'11-33':78,'22-22':78,'22-33':82,'33-33':88,
    '1-11':68,'2-11':75,'3-11':70,'4-22':78,'6-33':85,'9-11':72,'9-33':80
  };

  function getCompatScore(n1, n2) {
    var key = n1 <= n2 ? n1+'-'+n2 : n2+'-'+n1;
    var base = COMPAT_MATRIX[key] || 50;
    return base;
  }

  // Ham skoru [28,88] → [45,98] aralığına ölçekle (gerçekçi dağılım)
  function scaleScore(raw) {
    var scaled = 45 + (raw - 28) * 53 / 60;
    return Math.max(45, Math.min(98, Math.round(scaled)));
  }

  function overallScore(p1, p2) {
    var lpScore    = getCompatScore(p1.lifePath,    p2.lifePath);
    var soulScore  = getCompatScore(p1.soulUrge,    p2.soulUrge);
    var persScore  = getCompatScore(p1.personality, p2.personality);
    var expScore   = getCompatScore(p1.expression,  p2.expression);
    var raw = Math.round((lpScore*0.35 + soulScore*0.30 + persScore*0.20 + expScore*0.15));
    return scaleScore(raw);
  }

  // ─── BAĞLANTI ETİKETLERİ ─────────────────────────────────────
  // Eşikler 45-98 ölçeklenmiş aralığa göre ayarlandı
  function bondLabel(score) {
    if (score >= 90) return _t('compat.bond_cosmic_twin', 'Kozmik Ruh İkizi');
    if (score >= 82) return _t('compat.bond_soul_mate', 'İlahi Ruh Eşi');
    if (score >= 74) return _t('compat.bond_celestial', 'Göksel Birliktelik');
    if (score >= 66) return _t('compat.bond_karmic', 'Karmik Bağ');
    if (score >= 58) return _t('compat.bond_growth', 'Büyüme Katalizörü');
    if (score >= 50) return _t('compat.bond_discovery', 'Potansiyel Keşif');
    return _t('compat.bond_cosmic_test', 'Kozmik Sınav');
  }

  function bondSubLabel(score) {
    if (score >= 90) return _t('compat.bond_desc_1', 'Sonsuz Bağ · Kader · Aşk');
    if (score >= 82) return _t('compat.bond_desc_2', 'Ruh Eşi · Kader · Uyum');
    if (score >= 74) return _t('compat.bond_desc_3', 'Göksel Eşleşme · Uyum');
    if (score >= 66) return _t('compat.bond_desc_4', 'Karmik Ders · Dönüşüm');
    if (score >= 58) return _t('compat.bond_desc_5', 'Keşif · Potansiyel · Gelişim');
    if (score >= 50) return _t('compat.bond_desc_6', 'Zorluk · Ders · Uyanış');
    return _t('compat.bond_desc_7', 'Karşıtlık · Sınav · Dönüşüm');
  }

  function starCount(score) {
    if (score >= 88) return 5;
    if (score >= 76) return 4;
    if (score >= 64) return 3;
    if (score >= 52) return 2;
    return 1;
  }

  // ─── AI PROMPT SİSTEMİ ───────────────────────────────────────
  function getCompatSystem() {
    var _aiLang = window.i18n ? window.i18n.getAILang() : 'Write in Turkish.';
    return 'CRITICAL LANGUAGE RULE: ' + _aiLang + '\n\n' +
      'You are a Numerology Compatibility Expert. Using the Pythagorean system, you analyze the harmony, conflict, and bond between two people\'s numerical energies.\n\n' +
      'CALCULATION LOGIC (Pythagorean):\n' +
      '- Life Path: Sum of birth date digits\n' +
      '- Soul Urge: Sum of vowels in name\n' +
      '- Personality: Sum of consonants in name\n' +
      '- Expression: Sum of all letters in name\n' +
      '- Master Numbers: 11, 22, 33 — not reduced\n\n' +
      'WRITING RULES:\n' +
      '- ' + _aiLang + ' Address the couple directly (you/both of you/between you).\n' +
      '- No preaching. No headings. Only plain paragraphs.\n' +
      '- Always analyze the COUPLE — individual analysis is forbidden.\n' +
      '- Concrete, sharp, realistic.\n' +
      '- Tone: Based on the average of the two numbers: 1-5 energetic/dynamic, 6-9 deep/mystical, if Master Number present heavy/vision-laden.\n\n' +
      'CRITICAL LANGUAGE RULE: ' + _aiLang;
  }

  // Gender helper — context to inject into prompts
  function genderCtx(ctx) {
    var g1 = ctx.p1.gender === 'female' ? 'female' : ctx.p1.gender === 'male' ? 'male' : '';
    var g2 = ctx.p2.gender === 'female' ? 'female' : ctx.p2.gender === 'male' ? 'male' : '';
    if (!g1 && !g2) return '';
    return '\nGenders: ' + ctx.p1.name + (g1 ? ' (' + g1 + ')' : '') + ', ' + ctx.p2.name + (g2 ? ' (' + g2 + ')' : '') + '. Address gender appropriately and enrich the analysis from a gender perspective.\n';
  }

  var COMPAT_PROMPTS = {

    cosmic: function(ctx) {
      return 'Compatibility overview for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'Life Paths: ' + ctx.p1.lifePath + ' & ' + ctx.p2.lifePath + '\n' +
        'Soul Urge: ' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + '\n' +
        'Overall compatibility score: ' + ctx.overall + '%\n' + genderCtx(ctx) + '\n' +
        'Write about the essence of the bond between them, what these two Life Paths create together, and what kind of power their unique connection carries.\n' +
        '2 paragraphs, 80-100 words, address the couple directly.';
    },

    soul_urge: function(ctx) {
      return 'Soul Urge compatibility for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        ctx.p1.name + ' Soul Urge: ' + ctx.p1.soulUrge + '\n' +
        ctx.p2.name + ' Soul Urge: ' + ctx.p2.soulUrge + '\n' +
        'Compatibility score: ' + ctx.soulScore + '%\n' + genderCtx(ctx) + '\n' +
        'How do these two people\'s inner desires and emotional needs affect each other? Where is there deep harmony, and where is there hidden friction?\n' +
        'Write only about Soul Urge compatibility. Writing about Life Path or Personality is forbidden.\n' +
        '3 paragraphs, 120-140 words.';
    },

    personality: function(ctx) {
      return 'Personality compatibility for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        ctx.p1.name + ' Personality: ' + ctx.p1.personality + '\n' +
        ctx.p2.name + ' Personality: ' + ctx.p2.personality + '\n' +
        'Compatibility score: ' + ctx.persScore + '%\n' + genderCtx(ctx) + '\n' +
        'How do the images these two people project to the outside world complement or challenge each other? What is the dynamic between you in social settings?\n' +
        'Write only about Personality compatibility. Writing about Soul Urge or Life Path is forbidden.\n' +
        '3 paragraphs, 120-140 words.';
    },

    life_path: function(ctx) {
      return 'Life Path partnership for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        ctx.p1.name + ' Life Path: ' + ctx.p1.lifePath + '\n' +
        ctx.p2.name + ' Life Path: ' + ctx.p2.lifePath + '\n' +
        'Compatibility score: ' + ctx.lpScore + '%\n' + genderCtx(ctx) + '\n' +
        'When these two Life Paths walk together, where does life take them? What are the common themes, recurring patterns, and what do they need to grow together?\n' +
        (ctx.p1.lifePath === 11 || ctx.p1.lifePath === 22 || ctx.p1.lifePath === 33 || ctx.p2.lifePath === 11 || ctx.p2.lifePath === 22 || ctx.p2.lifePath === 33 ? 'Master Number present — especially emphasize the heavy potential it loads onto this partnership.\n' : '') +
        'Write only about Life Path compatibility. Writing about Soul Urge or Personality is forbidden.\n' +
        '3 paragraphs, 120-140 words.';
    },

    karmic: function(ctx) {
      return 'In-depth Karmic Bond analysis for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'All numbers:\n' +
        ctx.p1.name + ': LifePath=' + ctx.p1.lifePath + ', Soul=' + ctx.p1.soulUrge + ', Personality=' + ctx.p1.personality + ', Expression=' + ctx.p1.expression + '\n' +
        ctx.p2.name + ': LifePath=' + ctx.p2.lifePath + ', Soul=' + ctx.p2.soulUrge + ', Personality=' + ctx.p2.personality + ', Expression=' + ctx.p2.expression + '\n' +
        genderCtx(ctx) + '\n' +
        'MANDATORY FORMAT — use the following 7 headings exactly and in this order:\n\n' +
        '**Past Life Bond**\n[Describe the karmic roots of these two souls from the past, in which lifetimes they met, and their unfinished business — 2 paragraphs]\n\n' +
        '**Spiritual Purpose**\n[Describe the spiritual purpose of this relationship, the karmic lesson they will learn together, and why the universe brought them together — 2 paragraphs]\n\n' +
        '**Karmic Balance**\n[Describe the energy balance between them, conflict points, trigger patterns, and areas of harmony in detail — 2 paragraphs]\n\n' +
        '**Money & Material World**\n[Analyze the impact of this karmic bond on money, abundance, and material matters. What dynamics come into play when making financial decisions together, how do their relationships with money affect each other, what are the harmony or conflict points in shared material goals — 2 paragraphs]\n\n' +
        '**Relationship & Emotional Realm**\n[Analyze the emotional bond of these two souls, their love languages, trust dynamics, attachment styles, and recurring karmic patterns in the relationship. Which emotional wounds do they trigger in each other, and how do they heal them — 2 paragraphs]\n\n' +
        '**Health & Energy Body**\n[Analyze the impact of this karmic bond on physical and energetic health. Which chakras activate together, which energy blockages dissolve, and how do they affect each other\'s physical and spiritual energy — 2 paragraphs]\n\n' +
        '**Career & Life Mission**\n[Analyze the impact of this karmic bond on career, work life, and life mission. How do they support or hinder each other professionally, do they share a common mission, and how does this bond reflect in their career paths — 2 paragraphs]\n\n' +
        'Total 500-600 words, mystical and deep tone. Under each heading, provide concrete analysis truly based on numerical energies. Do NOT change the headings, write them exactly as shown.';
    },

    expression: function(ctx) {
      return 'Expression Number compatibility for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        ctx.p1.name + ' Expression: ' + ctx.p1.expression + '\n' +
        ctx.p2.name + ' Expression: ' + ctx.p2.expression + '\n' +
        'Compatibility score: ' + ctx.expScore + '%\n' + genderCtx(ctx) + '\n' +
        'How do these two people\'s modes of self-expression, talents, and the messages they project to the outside world complement or challenge each other?\n' +
        'Write only about Expression Number compatibility. Writing about Life Path or Soul Urge is forbidden.\n' +
        '3 paragraphs, 120-140 words.';
    },

    communication: function(ctx) {
      return 'Communication compatibility for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'Expression Numbers: ' + ctx.p1.expression + ' & ' + ctx.p2.expression + '\n' +
        'Personality Numbers: ' + ctx.p1.personality + ' & ' + ctx.p2.personality + '\n' +
        genderCtx(ctx) + '\n' +
        'Describe these two people\'s communication styles, how they understand each other, and what causes misunderstandings between them.\n' +
        '3 paragraphs, 120-140 words, practical and honest tone.';
    },

    // ─── BREAKDOWN 2 DEEP ANALİZLER ──────────────────────
    deep_karmic: function(ctx) {
      return 'DEEP KARMIC BOND ANALYSIS for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'All numbers:\n' +
        ctx.p1.name + ': LifePath=' + ctx.p1.lifePath + ', Soul=' + ctx.p1.soulUrge + ', Personality=' + ctx.p1.personality + ', Expression=' + ctx.p1.expression + '\n' +
        ctx.p2.name + ': LifePath=' + ctx.p2.lifePath + ', Soul=' + ctx.p2.soulUrge + ', Personality=' + ctx.p2.personality + ', Expression=' + ctx.p2.expression + '\n' +
        genderCtx(ctx) + '\n' +
        'This is a DEEP, detailed karmic bond reading — NOT a summary.\n\n' +
        'MANDATORY FORMAT — use the following 4 headings exactly:\n\n' +
        '**Geçmiş Yaşam İzi**\n[Which past lifetimes brought these souls together? What unresolved karma do they carry? Describe the emotional imprint from before — 2 detailed paragraphs]\n\n' +
        '**Karmik Ders**\n[What is the core lesson the universe wants them to learn through each other? What pain must they transform? — 2 detailed paragraphs]\n\n' +
        '**Karmik Denge**\n[Where is the give-take balance between them? Who holds more energetic debt? What triggers unresolved patterns? — 2 detailed paragraphs]\n\n' +
        '**Karmik Dönüşüm**\n[How can they transcend these patterns? What is the ultimate karmic gift this bond offers if they do the work? — 2 detailed paragraphs]\n\n' +
        'Total 350-400 words. Deep, mystical, emotionally resonant tone.';
    },

    deep_communication: function(ctx) {
      return 'DEEP COMMUNICATION DYNAMICS ANALYSIS for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'Expression Numbers: ' + ctx.p1.expression + ' & ' + ctx.p2.expression + '\n' +
        'Personality Numbers: ' + ctx.p1.personality + ' & ' + ctx.p2.personality + '\n' +
        'Soul Urge Numbers: ' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + '\n' +
        genderCtx(ctx) + '\n' +
        'This is a DEEP communication analysis — NOT a summary.\n\n' +
        'MANDATORY FORMAT — use these 4 headings:\n\n' +
        '**Konuşma Dili**\n[How does each person express themselves? One may be direct while the other is indirect. Analyze their verbal patterns based on Expression numbers — 2 paragraphs]\n\n' +
        '**Sessiz İletişim**\n[What do they communicate through silence, body language, energy? How do their Personality numbers shape unspoken dynamics? — 2 paragraphs]\n\n' +
        '**Çatışma Noktaları**\n[Where do misunderstandings happen most? What triggers communication breakdowns? Be specific and honest — 2 paragraphs]\n\n' +
        '**Uyum Anahtarı**\n[What is the key to unlocking perfect communication between them? Practical, actionable advice based on their numbers — 2 paragraphs]\n\n' +
        'Total 300-350 words. Insightful and practical tone.';
    },

    deep_emotional: function(ctx) {
      return 'DEEP EMOTIONAL SYNERGY ANALYSIS for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'Soul Urge Numbers: ' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + '\n' +
        'Life Path Numbers: ' + ctx.p1.lifePath + ' & ' + ctx.p2.lifePath + '\n' +
        'Overall compatibility: ' + ctx.overall + '%\n' +
        'Soul match score: ' + ctx.soulScore + '%\n' +
        genderCtx(ctx) + '\n' +
        'This is a DEEP emotional bond analysis — NOT a summary.\n\n' +
        'MANDATORY FORMAT — use these 4 headings:\n\n' +
        '**Duygusal Rezonans**\n[How do their inner emotional worlds resonate with each other? Where do they feel deeply understood? Analyze based on Soul Urge numbers — 2 paragraphs]\n\n' +
        '**Bağlanma Dinamiği**\n[What are their attachment styles based on their numbers? How do they seek and give love? — 2 paragraphs]\n\n' +
        '**Duygusal Yaralar**\n[Which emotional wounds do they trigger in each other? What childhood patterns replay in this relationship? Be honest — 2 paragraphs]\n\n' +
        '**İyileşme Yolu**\n[How can they heal through each other? What is the emotional gift this bond carries? — 2 paragraphs]\n\n' +
        'Total 300-350 words. Emotionally deep, empathetic tone.';
    },

    deep_destiny: function(ctx) {
      return 'DEEP SHARED DESTINY ANALYSIS for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        'Life Path Numbers: ' + ctx.p1.lifePath + ' & ' + ctx.p2.lifePath + '\n' +
        'Expression Numbers: ' + ctx.p1.expression + ' & ' + ctx.p2.expression + '\n' +
        'Overall compatibility: ' + ctx.overall + '%\n' +
        genderCtx(ctx) + '\n' +
        (ctx.p1.lifePath === 11 || ctx.p1.lifePath === 22 || ctx.p1.lifePath === 33 || ctx.p2.lifePath === 11 || ctx.p2.lifePath === 22 || ctx.p2.lifePath === 33 ? 'Master Number present — this amplifies the shared mission.\n\n' : '') +
        'This is a DEEP destiny analysis — NOT a summary.\n\n' +
        'MANDATORY FORMAT — use these 4 headings:\n\n' +
        '**Ortak Misyon**\n[What is the shared life mission when Life Paths ' + ctx.p1.lifePath + ' and ' + ctx.p2.lifePath + ' join? What are they meant to build together? — 2 paragraphs]\n\n' +
        '**Büyüme Haritası**\n[How do they push each other to grow? What challenges will test them and make them stronger? — 2 paragraphs]\n\n' +
        '**Gelecek Projeksiyonu**\n[What does the next chapter look like for them? What milestones, crossroads, and turning points lie ahead based on their combined energy? — 2 paragraphs]\n\n' +
        '**Kader Armağanı**\n[What is the ultimate gift the universe offers through this union? What legacy can they create? — 2 paragraphs]\n\n' +
        'Total 300-350 words. Visionary, inspiring tone.';
    },

    full_compat: function(ctx) {
      return 'FULL PREMIUM COMPATIBILITY ANALYSIS for ' + ctx.p1.name + ' and ' + ctx.p2.name + '.\n\n' +
        ctx.p1.name + ': LifePath=' + ctx.p1.lifePath + ', Soul=' + ctx.p1.soulUrge + ', Personality=' + ctx.p1.personality + ', Expression=' + ctx.p1.expression + '\n' +
        ctx.p2.name + ': LifePath=' + ctx.p2.lifePath + ', Soul=' + ctx.p2.soulUrge + ', Personality=' + ctx.p2.personality + ', Expression=' + ctx.p2.expression + '\n' +
        'Overall compatibility: ' + ctx.overall + '%\n' + genderCtx(ctx) + '\n' +
        (ctx.p1.lifePath === 11 || ctx.p1.lifePath === 22 || ctx.p1.lifePath === 33 || ctx.p2.lifePath === 11 || ctx.p2.lifePath === 22 || ctx.p2.lifePath === 33 ? '⚠️ Master Number present — make this the centerpiece.\n\n' : '') +
        'PARAGRAPH STRUCTURE (exactly 6 paragraphs, each 70-80 words):\n\n' +
        '1. OPENING: The numerical meaning of these two people coming together. Start striking and sharp.\n' +
        '2. LIFE PATH UNION: What do Life Paths ' + ctx.p1.lifePath + ' and ' + ctx.p2.lifePath + ' create when they walk together?\n' +
        '3. EMOTIONAL DEPTH: The inner harmony or friction between Soul Urges (' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + ').\n' +
        '4. CONFLICT POINT: The biggest inevitable friction in this relationship. Be ruthlessly honest.\n' +
        '5. GROWING TOGETHER: What can this couple achieve together, what can they learn?\n' +
        '6. CLOSING: A truth for ' + ctx.p1.name + ' and ' + ctx.p2.name + ' — not a question.\n\n' +
        'Total 350-420 words.';
    }
  };

  // ─── API ÇAĞRISI ─────────────────────────────────────────────
  // Cache key — iki isim (sıralı) + doğum tarihleri + tip
  // Doğum tarihleri dahil: aynı isimli farklı kişiler farklı analiz alsın
  function compatCacheKey(type, ctx) {
    var _lang = window.i18n ? window.i18n.current() : 'tr';
    var p1Key = (ctx.p1.name + '_' + (ctx.p1.birthDate || '')).toLowerCase().trim().replace(/\s+/g,'_');
    var p2Key = (ctx.p2.name + '_' + (ctx.p2.birthDate || '')).toLowerCase().trim().replace(/\s+/g,'_');
    var sorted = [p1Key, p2Key].sort();
    return 'numerael_compat_ai_v4__' + _lang + '__' + sorted[0] + '__' + sorted[1] + '__' + type;
  }

  // Sync cache getter — loading animasyonunu atlamak için
  function getCachedAnalysis(type, ctx) {
    try { return localStorage.getItem(compatCacheKey(type, ctx)) || null; } catch(e) { return null; }
  }

  async function fetchCompatAnalysis(type, ctx) {
    // 1. Cache'e bak — varsa direkt döndür (API çağrısı yapma)
    try {
      var cKey = compatCacheKey(type, ctx);
      var cached = localStorage.getItem(cKey);
      if (cached) return cached;
    } catch(e) {}

    // API key /api/openai proxy'si tarafından server-side ekleniyor

    var promptFn = COMPAT_PROMPTS[type];
    if (!promptFn) return null;

    var maxTokens = (type === 'full_compat') ? 1000 : (type === 'karmic' || type === 'deep_karmic') ? 900 : (type.indexOf('deep_') === 0) ? 700 : 350;

    try {
      var _aiH = await _getAiAuthHeaders();
      var res = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: _aiH,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: getCompatSystem() },
            { role: 'user', content: promptFn(ctx) }
          ],
          temperature: 0.85,
          max_tokens: maxTokens
        })
      });
      var data = await res.json();
      var text = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : null;
      // 2. Başarılıysa cache'e kaydet
      if (text) {
        try { localStorage.setItem(compatCacheKey(type, ctx), text); } catch(e2) {}
      }
      return text;
    } catch(e) {
      console.error('Compat AI Error:', e);
      return null;
    }
  }

  // ─── VERİ OKUMA ──────────────────────────────────────────────
  function getCompatData() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('numerael_compat_data')); } catch(e) {}
    if (!raw) {
      raw = {
        person1: { name: 'Alex', birthDate: '1990-05-14' },
        person2: { name: 'Maya', birthDate: '1992-08-22' }
      };
    }

    var p1 = raw.person1 || {};
    var p2 = raw.person2 || {};

    var ctx = {
      p1: {
        name:        p1.name || 'Kişi 1',
        birthDate:   p1.birthDate || '1990-01-01',
        userId:      p1.userId || null,
        gender:      p1.gender || null,
        avatarUrl:   p1.avatarUrl || null,
        lifePath:    calcLifePath(p1.birthDate || '1990-01-01'),
        expression:  calcExpression(p1.name || 'Alex'),
        soulUrge:    calcSoulUrge(p1.name || 'Alex'),
        personality: calcPersonality(p1.name || 'Alex')
      },
      p2: {
        name:        p2.name || 'Kişi 2',
        birthDate:   p2.birthDate || '1992-01-01',
        userId:      p2.userId || null,
        gender:      p2.gender || null,
        avatarUrl:   p2.avatarUrl || null,
        lifePath:    calcLifePath(p2.birthDate || '1992-01-01'),
        expression:  calcExpression(p2.name || 'Maya'),
        soulUrge:    calcSoulUrge(p2.name || 'Maya'),
        personality: calcPersonality(p2.name || 'Maya')
      }
    };

    ctx.lpScore   = scaleScore(getCompatScore(ctx.p1.lifePath,    ctx.p2.lifePath));
    ctx.soulScore = scaleScore(getCompatScore(ctx.p1.soulUrge,    ctx.p2.soulUrge));
    ctx.persScore = scaleScore(getCompatScore(ctx.p1.personality, ctx.p2.personality));
    ctx.expScore  = scaleScore(getCompatScore(ctx.p1.expression,  ctx.p2.expression));
    ctx.overall   = overallScore(ctx.p1, ctx.p2);
    ctx.bond      = bondLabel(ctx.overall);

    return ctx;
  }

  // ─── THEME-AWARE TEXT COLORS ─────────────────────────────────
  function _isDark() { return document.documentElement.classList.contains('dark'); }
  function _textColor() { return _isDark() ? 'rgba(255,255,255,0.82)' : 'rgba(30,30,30,0.82)'; }
  function _textMuted() { return _isDark() ? 'rgba(186,181,156,0.9)' : 'rgba(60,50,30,0.75)'; }
  function _borderColor() { return _isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; }

  // ─── LOADING HTML ────────────────────────────────────────────
  function loadingHTML(msg) {
    return '<div style="padding:20px;text-align:center;color:rgba(207,161,23,0.6);font-style:italic;font-size:13px;animation:compat-pulse 1.5s infinite;">✦ ' + (msg || _t('compat.loading_default', 'Uyum analizi hazırlanıyor...')) + '</div>';
  }

  function renderText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f2cc0d;font-weight:800;">$1</strong>')
      .split(/\n\n+/).filter(function(p){ return p.trim(); }).map(function(p){
      return '<p style="margin-bottom:14px;font-size:14px;line-height:1.85;">' + p.trim() + '</p>';
    }).join('');
  }

  // ─── ANİMASYON ───────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('compat-ai-style')) return;
    var s = document.createElement('style');
    s.id = 'compat-ai-style';
    s.textContent = '@keyframes compat-pulse{0%,100%{opacity:.4}50%{opacity:.9}}@keyframes compat-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes compat-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  // ─── SAYFA: relationship_compatibility_analysis.html ─────────
  function initCompatAnalysis() {
    injectStyles();
    var ctx = getCompatData();

    // İsimler
    var name1El = document.getElementById('compat-name-1');
    var name2El = document.getElementById('compat-name-2');
    if (name1El) name1El.textContent = ctx.p1.name;
    if (name2El) name2El.textContent = ctx.p2.name;

    // Genel skor
    var scoreEl = document.getElementById('compat-overall-score');
    if (scoreEl) scoreEl.textContent = ctx.overall + '%';

    // Bond etiketi
    var bondEl = document.getElementById('compat-bond-label');
    if (bondEl) bondEl.textContent = ctx.bond;
    var bondSubEl = document.getElementById('compat-bond-sub');
    if (bondSubEl) bondSubEl.textContent = bondSubLabel(ctx.overall);

    // Yıldızlar
    var starsEl = document.getElementById('compat-stars');
    if (starsEl) {
      var sc = starCount(ctx.overall);
      var starsHTML = '';
      for (var si = 0; si < 5; si++) {
        var filled = si < sc;
        starsHTML += '<span class="material-symbols-outlined text-' + (filled ? 'yellow-400' : 'white/20') + ' text-[16px]" style="font-variation-settings:\'FILL\' ' + (filled ? '1' : '0') + '">star</span>';
      }
      starsEl.innerHTML = starsHTML;
    }

    // Uyum barları — ID ile hedefle
    var barData = [
      { scoreId: 'compat-bar-lp-score',   fillId: 'compat-bar-lp-fill',   value: ctx.lpScore },
      { scoreId: 'compat-bar-soul-score', fillId: 'compat-bar-soul-fill', value: ctx.soulScore },
      { scoreId: 'compat-bar-pers-score', fillId: 'compat-bar-pers-fill', value: ctx.persScore },
      { scoreId: 'compat-bar-exp-score',  fillId: 'compat-bar-exp-fill',  value: ctx.expScore }
    ];
    barData.forEach(function(bar, idx) {
      var sEl = document.getElementById(bar.scoreId);
      var fEl = document.getElementById(bar.fillId);
      if (sEl) sEl.textContent = bar.value + '%';
      if (fEl) {
        // Animasyonlu açılma
        setTimeout(function() { fEl.style.width = bar.value + '%'; }, 200 + idx * 150);
      }
    });

    // Numeroloji detay bilgisi — barların altına ekle
    var barsContainer = document.querySelector('.px-6.space-y-5.mb-8');
    if (barsContainer) {
      var detailDiv = document.createElement('div');
      detailDiv.className = 'mt-4 grid grid-cols-2 gap-3';
      detailDiv.innerHTML =
        '<div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">' +
          '<p class="text-pink-300/60 text-[10px] uppercase tracking-widest mb-1">Kader Yolu</p>' +
          '<p class="text-white font-black text-lg">' + ctx.p1.lifePath + ' <span class="text-pink-500/50">&</span> ' + ctx.p2.lifePath + '</p>' +
        '</div>' +
        '<div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">' +
          '<p class="text-pink-300/60 text-[10px] uppercase tracking-widest mb-1">Ruh Dürtüsü</p>' +
          '<p class="text-white font-black text-lg">' + ctx.p1.soulUrge + ' <span class="text-pink-500/50">&</span> ' + ctx.p2.soulUrge + '</p>' +
        '</div>' +
        '<div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">' +
          '<p class="text-pink-300/60 text-[10px] uppercase tracking-widest mb-1">Kişilik</p>' +
          '<p class="text-white font-black text-lg">' + ctx.p1.personality + ' <span class="text-pink-500/50">&</span> ' + ctx.p2.personality + '</p>' +
        '</div>' +
        '<div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">' +
          '<p class="text-pink-300/60 text-[10px] uppercase tracking-widest mb-1">İfade</p>' +
          '<p class="text-white font-black text-lg">' + ctx.p1.expression + ' <span class="text-pink-500/50">&</span> ' + ctx.p2.expression + '</p>' +
        '</div>';
      barsContainer.appendChild(detailDiv);
    }

    // Avatarlar — önce hemen default/cache koy, sonra async olarak Supabase'den güncelle
    (function loadCompatAvatars() {
      var av1El = document.getElementById('compat-avatar-1');
      var av2El = document.getElementById('compat-avatar-2');
      if (!av1El && !av2El) return;

      // Yardımcı: avatar URL'ini elemente uygula
      function setAv(el, url) {
        if (el && url) el.style.backgroundImage = 'url("' + url + '")';
      }

      // ── ADIM 1: Hemen default/cache avatarları koy (senkron) ──
      var p1AvatarUrl = ctx.p1.avatarUrl || null;
      var p2AvatarUrl = ctx.p2.avatarUrl || null;

      // p1: localStorage cache (hızlı)
      if (!p1AvatarUrl) {
        try {
          var ud = JSON.parse(localStorage.getItem('numerael_user_data') || 'null');
          if (ud && ud.avatarUrl) p1AvatarUrl = ud.avatarUrl;
        } catch(e) {}
      }

      // avatarUtil fallback (cinsiyet bazlı default) — HER ZAMAN çalışır
      // Partner cinsiyeti yoksa ana kullanıcının tersini kullan (kadın→erkek, erkek→kadın)
      if (window.avatarUtil) {
        if (!p1AvatarUrl) p1AvatarUrl = window.avatarUtil.getAvatarUrl({ name: ctx.p1.name, gender: ctx.p1.gender });
        var p2Gender = ctx.p2.gender;
        if (!p2Gender && ctx.p1.gender) {
          p2Gender = (ctx.p1.gender === 'female') ? 'male' : 'female';
        }
        if (!p2AvatarUrl) p2AvatarUrl = window.avatarUtil.getAvatarUrl({ name: ctx.p2.name, gender: p2Gender });
      }

      // Hemen uygula (placeholder yerine doğru default görünsün)
      setAv(av1El, p1AvatarUrl);
      setAv(av2El, p2AvatarUrl);
      console.log('[Compat] Avatarlar (sync) — p1:', p1AvatarUrl ? 'set' : 'boş', ', p2:', p2AvatarUrl ? 'set' : 'boş');

      // ── ADIM 2: Async olarak Supabase'den gerçek fotoğrafları al ──
      (async function() {
        try {
          var updated = false;

          // p1: Supabase profiles (en güncel)
          if (window.supabaseClient) {
            try {
              var session = null;
              if (window.auth && window.auth.getSession) session = await window.auth.getSession();
              if (session && session.user) {
                var profRes = await window.supabaseClient.from('profiles')
                  .select('avatar_url')
                  .eq('id', session.user.id)
                  .maybeSingle();
                if (profRes.data && profRes.data.avatar_url) {
                  p1AvatarUrl = profRes.data.avatar_url;
                  setAv(av1El, p1AvatarUrl);
                  updated = true;
                }
              }
            } catch(e) {}
          }

          // p2: userId varsa profiles tablosundan
          if (ctx.p2.userId && window.supabaseClient) {
            try {
              var profRes2 = await window.supabaseClient.from('profiles')
                .select('avatar_url')
                .eq('id', ctx.p2.userId)
                .maybeSingle();
              if (profRes2.data && profRes2.data.avatar_url) {
                p2AvatarUrl = profRes2.data.avatar_url;
                setAv(av2El, p2AvatarUrl);
                updated = true;
              }
            } catch(e) { console.warn('[Compat] Partner profiles lookup error:', e); }
          }

          // p2: userId yoksa discovery_profiles'dan isme göre ara
          if (!ctx.p2.userId && window.supabaseClient) {
            try {
              var dpRes = await window.supabaseClient.from('discovery_profiles')
                .select('avatar_url, user_id')
                .ilike('full_name', '%' + ctx.p2.name + '%')
                .limit(1)
                .maybeSingle();
              if (dpRes.data && dpRes.data.user_id) {
                var profRes2b = await window.supabaseClient.from('profiles')
                  .select('avatar_url')
                  .eq('id', dpRes.data.user_id)
                  .maybeSingle();
                if (profRes2b.data && profRes2b.data.avatar_url) {
                  p2AvatarUrl = profRes2b.data.avatar_url;
                  setAv(av2El, p2AvatarUrl);
                  updated = true;
                }
              }
              if (!updated && dpRes.data && dpRes.data.avatar_url) {
                p2AvatarUrl = dpRes.data.avatar_url;
                setAv(av2El, p2AvatarUrl);
              }
            } catch(e) { console.warn('[Compat] Partner name-based avatar error:', e); }
          }

          console.log('[Compat] Avatarlar (async) — p1:', p1AvatarUrl ? 'OK' : 'default', ', p2:', p2AvatarUrl ? 'OK' : 'default', ', p2.userId:', ctx.p2.userId || 'yok');
        } catch(e) { console.warn('[Compat] Avatar async load error:', e); }
      })();
    })();

    // Soulmate share kartı isim & skor
    var smNames = document.getElementById('sm-names');
    if (smNames) smNames.textContent = ctx.p1.name + ' & ' + ctx.p2.name;
    var smScore = document.getElementById('sm-score');
    if (smScore) smScore.textContent = ctx.overall + '%';
    var smBond = document.getElementById('sm-bond');
    if (smBond) smBond.textContent = ctx.bond;

    // "Cosmic Connection" AI içerik
    var insightCard = document.getElementById('compat-insight-card');
    if (insightCard) {
      var _cosmicCached = getCachedAnalysis('cosmic', ctx);
      insightCard.innerHTML = '<div class="flex items-center gap-2 mb-4"><span class="material-symbols-outlined text-primary">auto_awesome</span><h3 class="text-lg font-bold">' + _t('compat_analysis.cosmic_bond_title', 'Kozmik Bağ') + '</h3></div>' +
        '<div id="cosmic-ai-content">' +
          (_cosmicCached
            ? '<div style="animation:compat-in 0.5s ease;color:' + _textMuted() + ';">' + renderText(_cosmicCached) + '</div>'
            : loadingHTML(_t('compat_analysis.cosmic_bond_loading', 'Kozmik bağ hesaplanıyor...')))
        + '</div>';
      if (!_cosmicCached) {
        fetchCompatAnalysis('cosmic', ctx).then(function(text){
          var el = document.getElementById('cosmic-ai-content');
          if (!el) return;
          if (text) el.innerHTML = '<div style="animation:compat-in 0.5s ease;color:' + _textMuted() + ';">' + renderText(text) + '</div>';
          else el.innerHTML = '<p style="color:#ef4444;font-size:13px;">' + _t('compat.analysis_error', 'Analiz yüklenemedi.') + '</p>';
        });
      }
    }
  }

  // ─── SAYFA: name_numerology_breakdown_3.html (Accordion) ─────
  function initBreakdown3() {
    injectStyles();
    var ctx = getCompatData();

    // Başlık güncelle
    var titleEl = document.querySelector('h1.tracking-widest, h1.font-extrabold');
    if (titleEl) titleEl.innerHTML = ctx.p1.name.toUpperCase() + ' <span class="text-primary font-light">&amp;</span> ' + ctx.p2.name.toUpperCase();

    // Skor güncelle
    var bigScore = document.querySelector('.text-7xl.font-bold');
    if (bigScore) bigScore.innerHTML = ctx.overall + '<span class="text-4xl align-top text-primary/80">%</span>';

    var badge = document.querySelector('.bg-primary\\/20.mt-2.px-3');
    if (badge) badge.textContent = ctx.bond;

    var quote = document.querySelector('p.mt-6.text-center.italic');
    if (quote) quote.textContent = '"' + ctx.p1.name + ' ' + _t('compat.and_connector', 've') + ' ' + ctx.p2.name + ' — ' + _t('compat.destiny_quote', 'sayıların birbirine yazdığı kader.') + '"';

    // Soulmate share
    var smNames = document.getElementById('sm-names');
    if (smNames) smNames.textContent = ctx.p1.name + ' & ' + ctx.p2.name;
    var smScore = document.getElementById('sm-score');
    if (smScore) smScore.textContent = ctx.overall + '%';
    var smBond = document.getElementById('sm-bond');
    if (smBond) smBond.textContent = ctx.bond;

    // Accordion kartları
    var section = document.querySelector('section.px-4.space-y-3');
    if (!section) return;
    var cards = section.querySelectorAll(':scope > div');

    var cardMap = [
      { type: 'soul_urge',   score: ctx.soulScore, label: 'Soul Urge Compatibility' },
      { type: 'personality', score: ctx.persScore, label: 'Personality Harmony' },
      { type: 'life_path',   score: ctx.lpScore,   label: 'Life Path Union' }
    ];

    cards.forEach(function(card, i) {
      var item = cardMap[i];
      if (!item) return;

      var btn = card.querySelector('button');
      var scoreEl = card.querySelector('.text-2xl.font-black');
      if (scoreEl) scoreEl.textContent = item.score + '%';

      if (!btn) return;
      // clone → eski listener'ları temizle
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      var contentDiv = document.createElement('div');
      contentDiv.style.display = 'none';
      contentDiv.style.borderTop = '1px solid ' + _borderColor();
      contentDiv.style.color = _textColor();
      card.appendChild(contentDiv);

      var loaded = false;
      newBtn.style.cursor = 'pointer';
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var icon = newBtn.querySelectorAll('.material-symbols-outlined');
        icon = icon[icon.length - 1];
        if (contentDiv.style.display === 'none') {
          contentDiv.style.display = 'block';
          if (icon) icon.textContent = 'expand_less';
          if (!loaded) {
            loaded = true;
            var _accCached = getCachedAnalysis(item.type, ctx);
            if (_accCached) {
              contentDiv.innerHTML = '<div style="padding:16px 20px;animation:compat-in 0.5s ease;">' + renderText(_accCached) + '</div>';
            } else {
              contentDiv.innerHTML = loadingHTML();
              fetchCompatAnalysis(item.type, ctx).then(function(text){
                if (text) {
                  contentDiv.innerHTML = '<div style="padding:16px 20px;animation:compat-in 0.5s ease;">' + renderText(text) + '</div>';
                } else {
                  contentDiv.innerHTML = '<p style="padding:16px;color:#ef4444;font-size:13px;">' + _t('compat.analysis_error', 'Analiz yüklenemedi.') + '</p>';
                }
              });
            }
          }
        } else {
          contentDiv.style.display = 'none';
          if (icon) icon.textContent = 'expand_more';
        }
      });
    });
  }

  // ─── SAYFA: name_numerology_breakdown_2.html ─────────────────
  function initBreakdown2() {
    injectStyles();
    var ctx = getCompatData();

    // Header isim güncelle
    var h2 = document.querySelector('h2.text-lg.font-extrabold');
    if (h2) h2.textContent = ctx.p1.name.toUpperCase() + ' & ' + ctx.p2.name.toUpperCase();

    // Soulmate share
    var smNames = document.getElementById('sm-names');
    if (smNames) smNames.textContent = ctx.p1.name + ' & ' + ctx.p2.name;
    var smScore = document.getElementById('sm-score');
    if (smScore) smScore.textContent = ctx.overall + '%';
    var smBond = document.getElementById('sm-bond');
    if (smBond) smBond.textContent = ctx.bond;

    var sections = document.querySelectorAll('section.glass-card');

    // Ortak fonksiyon: section içindeki metin alanını bul ve AI ile doldur
    function fillSection(section, promptType, loadMsg) {
      if (!section) return;
      // Mevcut içerik container'ını bul
      var targets = [
        section.querySelector('.space-y-4'),
        section.querySelector('.text-elegant'),
        section.querySelector('p.text-elegant'),
        section.querySelector('p.text-sm')
      ];
      var target = null;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i]) { target = targets[i]; break; }
      }
      if (!target) return;

      var _b2Cached = getCachedAnalysis(promptType, ctx);
      if (_b2Cached) {
        target.innerHTML = '<div style="animation:compat-in 0.5s ease;">' + renderText(_b2Cached) + '</div>';
      } else {
        target.innerHTML = loadingHTML(loadMsg || _t('compat.loading_preparing', 'Analiz hazırlanıyor...'));
        fetchCompatAnalysis(promptType, ctx).then(function(text) {
          if (text) {
            target.innerHTML = '<div style="animation:compat-in 0.5s ease;">' + renderText(text) + '</div>';
          } else {
            target.innerHTML = '<p style="color:#ef4444;font-size:13px;">' + _t('compat.analysis_error', 'Analiz yüklenemedi.') + '</p>';
          }
        });
      }
    }

    // section[0]: The Karmic Bond → karmic prompt
    fillSection(sections[0], 'karmic', _t('breakdown2.karmic_bond_loading', 'Karmik bağ okunuyor...'));

    // section[1]: Communication Harmony → communication prompt
    // Bar grafiğinden sonrası için ek div ekle
    if (sections[1]) {
      var bar = sections[1].querySelector('.relative.h-48');
      var commDiv = document.createElement('div');
      commDiv.id = 'comm-ai-content';
      var _commCached = getCachedAnalysis('communication', ctx);
      if (_commCached) { commDiv.innerHTML = '<div style="animation:compat-in 0.5s ease;">' + renderText(_commCached) + '</div>'; }
      else { commDiv.innerHTML = loadingHTML(_t('breakdown2.communication_loading', 'İletişim uyumu analiz ediliyor...')); }
      commDiv.style.marginTop = '12px';
      if (bar) bar.parentNode.insertBefore(commDiv, bar.nextSibling);

      if (!_commCached) fetchCompatAnalysis('communication', ctx).then(function(text) {
        var el = document.getElementById('comm-ai-content');
        if (!el) return;
        if (text) {
          el.innerHTML = '<div style="animation:compat-in 0.5s ease;color:' + _textColor() + ';">' + renderText(text) + '</div>';
        } else {
          el.innerHTML = '<p style="color:#ef4444;font-size:13px;">' + _t('compat.analysis_error', 'Analiz yüklenemedi.') + '</p>';
        }
      });

      // Mevcut statik metni de temizle
      var staticTexts = sections[1].querySelectorAll('p.text-sm, .text-elegant');
      staticTexts.forEach(function(el) { el.textContent = ''; });
    }

    // section[2]: Emotional Synergy → soul_urge prompt + skor güncelle
    if (sections[2]) {
      var scoreEl = sections[2].querySelector('.text-3xl.font-black');
      if (scoreEl) scoreEl.textContent = ctx.soulScore + '%';
      var archetypeEl = sections[2].querySelector('.text-lg.font-bold.text-gold');
      // Soul urge archetypes
      var SOUL_ARCHETYPES = {1:'THE LEADERS',2:'THE DIPLOMATS',3:'THE CREATORS',4:'THE BUILDERS',5:'THE ADVENTURERS',6:'THE NURTURERS',7:'THE MYSTICS',8:'THE POWERHOUSES',9:'THE HUMANITARIANS',11:'THE ILLUMINATORS',22:'THE MASTER BUILDERS',33:'THE TEACHERS'};
      if (archetypeEl) archetypeEl.textContent = (SOUL_ARCHETYPES[ctx.p1.soulUrge] || 'THE SOULS') + ' & ' + (SOUL_ARCHETYPES[ctx.p2.soulUrge] || 'SOULS');
      fillSection(sections[2], 'soul_urge', _t('breakdown2.emotional_loading', 'Duygusal uyum hesaplanıyor...'));
    }

    // section[3]: The Shared Destiny → life_path prompt
    fillSection(sections[3], 'life_path', _t('breakdown2.shared_destiny_loading', 'Ortak kader okunuyor...'));
  }

  // ─── AUTO-INIT ────────────────────────────────────────────────
  function init() {
    var path = (window.location.pathname || '') + (window.location.href || '') + (document.title || '');
    // Sayfa tespiti: URL + DOM element varlığı kontrolü
    var hasCompatUI = document.getElementById('compat-overall-score');
    if (path.includes('relationship_compatibility_analysis') || hasCompatUI) {
      console.log('[Compat Engine] initCompatAnalysis çalışıyor');
      initCompatAnalysis();
    } else if (path.includes('name_numerology_breakdown_3')) {
      // Inline script handles everything — skip auto-init
      console.log('[Compat Engine] breakdown_3 inline script tarafından yönetiliyor');
    } else if (path.includes('name_numerology_breakdown_2')) {
      initBreakdown2();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 150); });
  } else {
    setTimeout(init, 150);
  }

  // ─── HESAPLAMA UTILITY ──────────────────────────────────────
  // Dışarıdan (profile_soul_journey vb.) çağrılabilir — tek kaynak
  function calculateOverall(name1, bd1, name2, bd2) {
    var p1 = {
      lifePath:    calcLifePath(bd1 || '1990-01-01'),
      expression:  calcExpression(name1 || 'Kişi'),
      soulUrge:    calcSoulUrge(name1 || 'Kişi'),
      personality: calcPersonality(name1 || 'Kişi')
    };
    var p2 = {
      lifePath:    calcLifePath(bd2 || '1992-01-01'),
      expression:  calcExpression(name2 || 'Kişi'),
      soulUrge:    calcSoulUrge(name2 || 'Kişi'),
      personality: calcPersonality(name2 || 'Kişi')
    };
    return {
      overall:   overallScore(p1, p2),
      lpScore:   scaleScore(getCompatScore(p1.lifePath,    p2.lifePath)),
      soulScore: scaleScore(getCompatScore(p1.soulUrge,    p2.soulUrge)),
      persScore: scaleScore(getCompatScore(p1.personality, p2.personality)),
      expScore:  scaleScore(getCompatScore(p1.expression,  p2.expression)),
      bond:      bondLabel(overallScore(p1, p2)),
      p1: p1,
      p2: p2
    };
  }

  // ─── SUPABASE PERSİSTENCE ─────────────────────────────────
  // Uyumluluk analizini Supabase'e kaydet (upsert — aynı partner varsa güncelle)
  async function saveReadingToSupabase(ctx) {
    try {
      if (!window.supabaseClient) return;
      var session = null;
      if (window.auth && window.auth.getSession) session = await window.auth.getSession();
      if (!session || !session.user) return;

      var row = {
        user_id: session.user.id,
        partner_name: ctx.p2.name,
        partner_birth_date: ctx.p2.birthDate || null,
        partner_gender: ctx.p2.gender || 'unknown',
        p1_life_path: ctx.p1.lifePath,
        p1_soul_urge: ctx.p1.soulUrge,
        p1_personality: ctx.p1.personality,
        p1_expression: ctx.p1.expression,
        p2_life_path: ctx.p2.lifePath,
        p2_soul_urge: ctx.p2.soulUrge,
        p2_personality: ctx.p2.personality,
        p2_expression: ctx.p2.expression,
        overall_score: ctx.overall,
        lp_score: ctx.lpScore,
        soul_score: ctx.soulScore,
        pers_score: ctx.persScore,
        exp_score: ctx.expScore,
        bond_label: ctx.bond,
        updated_at: new Date().toISOString()
      };

      var res = await window.supabaseClient
        .from('compatibility_readings')
        .upsert(row, { onConflict: 'user_id,lower(partner_name),partner_birth_date' });

      if (res.error) {
        // Upsert conflict ile çalışmazsa insert/update dene
        console.warn('[Compat] Upsert failed, trying select+update:', res.error.message);
        var existing = await window.supabaseClient
          .from('compatibility_readings')
          .select('id')
          .eq('user_id', session.user.id)
          .ilike('partner_name', ctx.p2.name)
          .eq('partner_birth_date', ctx.p2.birthDate || '')
          .maybeSingle();
        if (existing.data && existing.data.id) {
          await window.supabaseClient
            .from('compatibility_readings')
            .update(row)
            .eq('id', existing.data.id);
        } else {
          await window.supabaseClient
            .from('compatibility_readings')
            .insert(row);
        }
      }
      console.log('[Compat] Reading saved to Supabase:', ctx.p2.name);
    } catch(e) {
      console.warn('[Compat] saveReadingToSupabase error:', e);
    }
  }

  // Supabase'den kullanıcının tüm uyumluluk geçmişini çek
  async function loadReadingsFromSupabase() {
    try {
      if (!window.supabaseClient) return [];
      var session = null;
      if (window.auth && window.auth.getSession) session = await window.auth.getSession();
      if (!session || !session.user) return [];

      var res = await window.supabaseClient
        .from('compatibility_readings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (res.error) {
        console.warn('[Compat] loadReadings error:', res.error.message);
        return [];
      }
      return res.data || [];
    } catch(e) {
      console.warn('[Compat] loadReadingsFromSupabase error:', e);
      return [];
    }
  }

  // Supabase'den tek bir reading sil
  async function deleteReadingFromSupabase(partnerName, partnerBirthDate) {
    try {
      if (!window.supabaseClient) return;
      var session = null;
      if (window.auth && window.auth.getSession) session = await window.auth.getSession();
      if (!session || !session.user) return;

      await window.supabaseClient
        .from('compatibility_readings')
        .delete()
        .eq('user_id', session.user.id)
        .ilike('partner_name', partnerName)
        .eq('partner_birth_date', partnerBirthDate || '');
      console.log('[Compat] Reading deleted from Supabase:', partnerName);
    } catch(e) {
      console.warn('[Compat] deleteReading error:', e);
    }
  }

  // Global export
  window.CompatEngine = {
    getCompatData: getCompatData,
    fetchCompatAnalysis: fetchCompatAnalysis,
    getCachedAnalysis: getCachedAnalysis,
    initCompatAnalysis: initCompatAnalysis,
    initBreakdown3: initBreakdown3,
    initBreakdown2: initBreakdown2,
    calculateOverall: calculateOverall,
    bondLabel: bondLabel,
    saveReadingToSupabase: saveReadingToSupabase,
    loadReadingsFromSupabase: loadReadingsFromSupabase,
    deleteReadingFromSupabase: deleteReadingFromSupabase
  };

  // openSoulmateShare alias (bazı sayfalarda smOpen var, bu wrapper her ikisini de destekler)
  if (!window.openSoulmateShare) {
    window.openSoulmateShare = function() {
      if (typeof window.smOpen === 'function') window.smOpen();
    };
  }

})();
