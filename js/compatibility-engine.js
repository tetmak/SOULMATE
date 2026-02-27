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

  // Ham skoru [28,88] → [70,98] aralığına ölçekle (alt limit %70)
  function scaleScore(raw) {
    var scaled = 70 + (raw - 28) * 28 / 60;
    return Math.max(70, Math.min(98, Math.round(scaled)));
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
  // Eşikler 70-98 ölçeklenmiş aralığa göre ayarlandı
  function bondLabel(score) {
    if (score >= 94) return 'Kozmik Ruh İkizi';
    if (score >= 89) return 'İlahi Ruh Eşi';
    if (score >= 84) return 'Göksel Birliktelik';
    if (score >= 79) return 'Karmik Bağ';
    if (score >= 74) return 'Büyüme Katalizörü';
    return 'Kozmik Sınav';
  }

  function bondSubLabel(score) {
    if (score >= 94) return 'Sonsuz Bağ · Kader · Aşk';
    if (score >= 89) return 'Ruh Eşi · Kader · Uyum';
    if (score >= 84) return 'Göksel Eşleşme · Uyum';
    if (score >= 79) return 'Karmik Ders · Dönüşüm';
    if (score >= 74) return 'Keşif · Potansiyel · Gelişim';
    return 'Zorluk · Ders · Uyanış';
  }

  function starCount(score) {
    if (score >= 92) return 5;
    if (score >= 86) return 4;
    if (score >= 80) return 3;
    if (score >= 74) return 2;
    return 1;
  }

  // ─── AI PROMPT SİSTEMİ ───────────────────────────────────────
  var COMPAT_SYSTEM = `Sen bir Numeroloji Uyum Uzmanısın. Pisagor sistemini kullanarak iki kişinin sayısal enerjileri arasındaki uyumu, çatışmayı ve bağı analiz edersin.

HESAPLAMAMATIĞİ (Pisagor):
- Kader Yolu: Doğum tarihi rakamları toplamı
- Ruh Güdüsü: İsmin sesli harfleri toplamı
- Kişilik: İsmin sessiz harfleri toplamı
- İfade: İsmin tüm harfleri toplamı
- Üstat Sayılar: 11, 22, 33 — indirgeme

YAZI KURALLARI:
- Türkçe. Doğrudan çifte hitap et (siz/ikiniz/aranızdaki).
- Vaaz yok. Başlık yok. Sadece düz paragraflar.
- Her zaman ÇIFTI analiz et — bireysel analiz yasak.
- Somut, keskin, gerçekçi.
- Ton: İki sayının ortalamasına göre: 1-5 arası enerjik/dinamik, 6-9 arası derin/mistik, Üstat sayı varsa ağır/vizyon yüklü.`;

  // Cinsiyet helper — prompt'lara eklenecek context
  function genderCtx(ctx) {
    var g1 = ctx.p1.gender === 'female' ? 'kadın' : ctx.p1.gender === 'male' ? 'erkek' : '';
    var g2 = ctx.p2.gender === 'female' ? 'kadın' : ctx.p2.gender === 'male' ? 'erkek' : '';
    if (!g1 && !g2) return '';
    return '\nCinsiyetler: ' + ctx.p1.name + (g1 ? ' (' + g1 + ')' : '') + ', ' + ctx.p2.name + (g2 ? ' (' + g2 + ')' : '') + '. Cinsiyetlere uygun hitap et ve analizi cinsiyet perspektifinden zenginleştir.\n';
  }

  var COMPAT_PROMPTS = {

    cosmic: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için uyum özeti.\n\n' +
        'Kader Yolları: ' + ctx.p1.lifePath + ' & ' + ctx.p2.lifePath + '\n' +
        'Ruh Güdüsü: ' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + '\n' +
        'Genel uyum skoru: ' + ctx.overall + '%\n' + genderCtx(ctx) + '\n' +
        'Aranızdaki bağın özünü, bu iki Kader Yolunun birbirine ne yarattığını ve size özgü bağın ne tür bir güç taşıdığını yaz.\n' +
        '2 paragraf, 80-100 kelime, çifte hitap et.';
    },

    soul_urge: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için Ruh Güdüsü uyumu.\n\n' +
        ctx.p1.name + ' Ruh Güdüsü: ' + ctx.p1.soulUrge + '\n' +
        ctx.p2.name + ' Ruh Güdüsü: ' + ctx.p2.soulUrge + '\n' +
        'Uyum skoru: ' + ctx.soulScore + '%\n' + genderCtx(ctx) + '\n' +
        'İki kişinin içsel arzuları ve duygusal ihtiyaçları birbirini nasıl etkiliyor? Nerede derin uyum, nerede gizli sürtüşme var?\n' +
        'Sadece Ruh Güdüsü uyumunu yaz. Kader Yolu veya Kişilik hakkında yazmak yasak.\n' +
        '3 paragraf, 120-140 kelime.';
    },

    personality: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için Kişilik uyumu.\n\n' +
        ctx.p1.name + ' Kişilik: ' + ctx.p1.personality + '\n' +
        ctx.p2.name + ' Kişilik: ' + ctx.p2.personality + '\n' +
        'Uyum skoru: ' + ctx.persScore + '%\n' + genderCtx(ctx) + '\n' +
        'İki kişinin dış dünyaya yansıttığı imajlar birbirini nasıl tamamlıyor veya zorluyor? Sosyal ortamlarda aranızdaki dinamik nedir?\n' +
        'Sadece Kişilik uyumunu yaz. Ruh Güdüsü veya Kader Yolu hakkında yazmak yasak.\n' +
        '3 paragraf, 120-140 kelime.';
    },

    life_path: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için Kader Yolu birlikteliği.\n\n' +
        ctx.p1.name + ' Kader Yolu: ' + ctx.p1.lifePath + '\n' +
        ctx.p2.name + ' Kader Yolu: ' + ctx.p2.lifePath + '\n' +
        'Uyum skoru: ' + ctx.lpScore + '%\n' + genderCtx(ctx) + '\n' +
        'Bu iki Kader Yolu bir arada yürüyünce hayat onları nereye götürüyor? Ortak temalar, tekrar eden örüntüler ve birlikte büyümeleri için gereken şey nedir?\n' +
        (ctx.p1.lifePath === 11 || ctx.p1.lifePath === 22 || ctx.p1.lifePath === 33 || ctx.p2.lifePath === 11 || ctx.p2.lifePath === 22 || ctx.p2.lifePath === 33 ? 'Üstat Sayı var — bu birlikteliğe yüklediği ağır potansiyeli özellikle vurgula.\n' : '') +
        'Sadece Kader Yolu uyumunu yaz. Ruh Güdüsü veya Kişilik hakkında yazmak yasak.\n' +
        '3 paragraf, 120-140 kelime.';
    },

    karmic: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için Derinlemesine Karmik Bağ analizi.\n\n' +
        'Tüm sayılar:\n' +
        ctx.p1.name + ': Kader=' + ctx.p1.lifePath + ', Ruh=' + ctx.p1.soulUrge + ', Kişilik=' + ctx.p1.personality + ', İfade=' + ctx.p1.expression + '\n' +
        ctx.p2.name + ': Kader=' + ctx.p2.lifePath + ', Ruh=' + ctx.p2.soulUrge + ', Kişilik=' + ctx.p2.personality + ', İfade=' + ctx.p2.expression + '\n' +
        genderCtx(ctx) + '\n' +
        'ZORUNLU FORMAT — aşağıdaki 7 başlığı aynen ve bu sırayla kullan:\n\n' +
        '**Geçmiş Yaşam Bağı**\n[Bu iki ruhun geçmişten gelen karmik köklerini, hangi yaşamlarda karşılaştıklarını ve tamamlanmamış işlerini anlat — 2 paragraf]\n\n' +
        '**Ruhsal Amaç**\n[Bu ilişkinin ruhsal amacını, birlikte öğrenecekleri karmik dersi ve evren tarafından neden bir araya getirildiklerini anlat — 2 paragraf]\n\n' +
        '**Karmik Denge**\n[Aralarındaki enerji dengesini, çatışma noktalarını, tetikleyici kalıpları ve uyum alanlarını detaylı anlat — 2 paragraf]\n\n' +
        '**Para & Maddi Dünya**\n[Bu karmik bağın para, bolluk ve maddi konulardaki etkisini analiz et. Birlikte finansal kararlar alırken hangi dinamikler devreye girer, parayla ilişkileri birbirini nasıl etkiler, ortak maddi hedeflerde uyum veya çatışma noktaları neler — 2 paragraf]\n\n' +
        '**İlişki & Duygusal Alan**\n[Bu iki ruhun duygusal bağını, aşk dillerini, güven dinamiklerini, bağlanma biçimlerini ve ilişkide tekrar eden karmik kalıpları analiz et. Birbirlerinin hangi duygusal yaralarını tetikler, nasıl iyileştirirler — 2 paragraf]\n\n' +
        '**Sağlık & Enerji Bedeni**\n[Bu karmik bağın fiziksel ve enerjetik sağlık üzerindeki etkisini analiz et. Birlikte hangi chakralar aktifleşir, hangi enerji blokajları çözülür, birbirlerinin fiziksel ve ruhsal enerjisini nasıl etkilerler — 2 paragraf]\n\n' +
        '**Kariyer & Yaşam Misyonu**\n[Bu karmik bağın kariyer, iş hayatı ve yaşam misyonu üzerindeki etkisini analiz et. Profesyonel alanda birbirlerini nasıl destekler veya engellerler, ortak bir misyonları var mı, kariyer yollarında bu bağ nasıl yansır — 2 paragraf]\n\n' +
        'Toplam 500-600 kelime, mistik ve derin ton. Her başlık altında gerçekten sayısal enerjilere dayanan somut analiz yap. Başlıkları DEĞİŞTİRME, aynen yaz.';
    },

    expression: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için İfade Sayısı uyumu.\n\n' +
        ctx.p1.name + ' İfade: ' + ctx.p1.expression + '\n' +
        ctx.p2.name + ' İfade: ' + ctx.p2.expression + '\n' +
        'Uyum skoru: ' + ctx.expScore + '%\n' + genderCtx(ctx) + '\n' +
        'İki kişinin kendini ifade ediş biçimleri, yetenekleri ve dış dünyaya verdikleri mesaj birbirini nasıl tamamlıyor veya zorluyor?\n' +
        'Sadece İfade Sayısı uyumunu yaz. Kader Yolu veya Ruh Güdüsü hakkında yazmak yasak.\n' +
        '3 paragraf, 120-140 kelime.';
    },

    communication: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için iletişim uyumu.\n\n' +
        'İfade Sayıları: ' + ctx.p1.expression + ' & ' + ctx.p2.expression + '\n' +
        'Kişilik Sayıları: ' + ctx.p1.personality + ' & ' + ctx.p2.personality + '\n' +
        genderCtx(ctx) + '\n' +
        'İki kişinin iletişim tarzları, birbirini nasıl anladıkları ve yanlış anlaşılmaların neden kaynaklandığını anlat.\n' +
        '3 paragraf, 120-140 kelime, pratik ve dürüst ton.';
    },

    full_compat: function(ctx) {
      return ctx.p1.name + ' ve ' + ctx.p2.name + ' için TAM PREMIUM UYUM ANALİZİ.\n\n' +
        ctx.p1.name + ': Kader=' + ctx.p1.lifePath + ', Ruh=' + ctx.p1.soulUrge + ', Kişilik=' + ctx.p1.personality + ', İfade=' + ctx.p1.expression + '\n' +
        ctx.p2.name + ': Kader=' + ctx.p2.lifePath + ', Ruh=' + ctx.p2.soulUrge + ', Kişilik=' + ctx.p2.personality + ', İfade=' + ctx.p2.expression + '\n' +
        'Genel uyum: ' + ctx.overall + '%\n' + genderCtx(ctx) + '\n' +
        (ctx.p1.lifePath === 11 || ctx.p1.lifePath === 22 || ctx.p1.lifePath === 33 || ctx.p2.lifePath === 11 || ctx.p2.lifePath === 22 || ctx.p2.lifePath === 33 ? '⚠️ Üstat Sayı var — bunu merkeze al.\n\n' : '') +
        'PARAGRAF YAPISI (tam 6 paragraf, her biri 70-80 kelime):\n\n' +
        '1. AÇILIŞ: Bu iki insanın bir araya gelmesinin sayısal anlamı. Sarsıcı ve keskin başla.\n' +
        '2. KADER YOLU BİRLEŞİMİ: ' + ctx.p1.lifePath + ' ve ' + ctx.p2.lifePath + ' Kader Yolları bir arada yürüyünce ne yaratıyor?\n' +
        '3. DUYGUSAL DERINLIK: Ruh Güdüleri (' + ctx.p1.soulUrge + ' & ' + ctx.p2.soulUrge + ') arasındaki içsel uyum veya sürtüşme.\n' +
        '4. ÇATIŞMA NOKTASI: Bu ilişkide kaçınılmaz olan en büyük sürtüşme. Acımasızca dürüst ol.\n' +
        '5. BİRLİKTE BÜYÜME: Bu çiftin birlikte neyi başarabilir, neyi öğrenebilir?\n' +
        '6. KAPANIŞ: ' + ctx.p1.name + ' ve ' + ctx.p2.name + ' için bir gerçek — soru değil.\n\n' +
        'Toplam 350-420 kelime.';
    }
  };

  // ─── API ÇAĞRISI ─────────────────────────────────────────────
  // Cache key — iki isim (sıralı) + doğum tarihleri + tip
  // Doğum tarihleri dahil: aynı isimli farklı kişiler farklı analiz alsın
  function compatCacheKey(type, ctx) {
    var p1Key = (ctx.p1.name + '_' + (ctx.p1.birthDate || '')).toLowerCase().trim().replace(/\s+/g,'_');
    var p2Key = (ctx.p2.name + '_' + (ctx.p2.birthDate || '')).toLowerCase().trim().replace(/\s+/g,'_');
    var sorted = [p1Key, p2Key].sort();
    return 'numerael_compat_ai_v3__' + sorted[0] + '__' + sorted[1] + '__' + type;
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

    var maxTokens = (type === 'full_compat') ? 1000 : (type === 'karmic') ? 900 : 350;

    try {
      var res = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: COMPAT_SYSTEM },
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

  // ─── LOADING HTML ────────────────────────────────────────────
  function loadingHTML(msg) {
    return '<div style="padding:20px;text-align:center;color:rgba(207,161,23,0.6);font-style:italic;font-size:13px;animation:compat-pulse 1.5s infinite;">✦ ' + (msg || 'Uyum analizi hazırlanıyor...') + '</div>';
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

    // Avatarlar — önce localStorage'daki cached data, sonra Supabase'den gerçek profil fotoğrafları
    (async function loadCompatAvatars() {
      try {
        var av1El = document.getElementById('compat-avatar-1');
        var av2El = document.getElementById('compat-avatar-2');
        if (!av1El && !av2El) return;

        // 1. Ana kullanıcı (person1) avatarı
        // Önce compat_data'daki cached avatarUrl (kisi_profil.html'den geliyor)
        var p1AvatarUrl = ctx.p1.avatarUrl || null;
        // Yoksa Supabase profiles'dan (en güncel fotoğraf)
        if (!p1AvatarUrl && window.supabaseClient) {
          try {
            var session = null;
            if (window.auth && window.auth.getSession) session = await window.auth.getSession();
            if (session && session.user) {
              var profRes = await window.supabaseClient.from('profiles')
                .select('avatar_url')
                .eq('id', session.user.id)
                .maybeSingle();
              if (profRes.data && profRes.data.avatar_url) p1AvatarUrl = profRes.data.avatar_url;
            }
          } catch(e) {}
        }
        // Supabase'de de yoksa localStorage'dan
        if (!p1AvatarUrl) {
          try {
            var ud = JSON.parse(localStorage.getItem('numerael_user_data') || 'null');
            if (ud && ud.avatarUrl) p1AvatarUrl = ud.avatarUrl;
          } catch(e) {}
        }

        // 2. Partner (person2) avatarı
        // Önce compat_data'daki cached avatarUrl (kisi_profil.html'den userId + avatar ile geliyor)
        var p2AvatarUrl = ctx.p2.avatarUrl || null;
        // userId varsa doğrudan profiles tablosundan (en güncel fotoğraf — HER ZAMAN öncelikli)
        if (ctx.p2.userId && window.supabaseClient) {
          try {
            var profRes2 = await window.supabaseClient.from('profiles')
              .select('avatar_url')
              .eq('id', ctx.p2.userId)
              .maybeSingle();
            if (profRes2.data && profRes2.data.avatar_url) p2AvatarUrl = profRes2.data.avatar_url;
          } catch(e) { console.warn('[Compat] Partner profiles lookup error:', e); }
        }
        // userId yoksa fallback: discovery_profiles'dan isme göre ara
        if (!p2AvatarUrl && window.supabaseClient) {
          try {
            var dpRes = await window.supabaseClient.from('discovery_profiles')
              .select('avatar_url, user_id')
              .ilike('full_name', '%' + ctx.p2.name + '%')
              .limit(1)
              .maybeSingle();
            // discovery_profiles'dan user_id bulunduysa profiles'a bak
            if (dpRes.data && dpRes.data.user_id) {
              var profRes2b = await window.supabaseClient.from('profiles')
                .select('avatar_url')
                .eq('id', dpRes.data.user_id)
                .maybeSingle();
              if (profRes2b.data && profRes2b.data.avatar_url) p2AvatarUrl = profRes2b.data.avatar_url;
            }
            // profiles'dan bulunamadıysa discovery_profiles avatar kullan
            if (!p2AvatarUrl && dpRes.data && dpRes.data.avatar_url) {
              p2AvatarUrl = dpRes.data.avatar_url;
            }
          } catch(e) { console.warn('[Compat] Partner name-based avatar error:', e); }
        }

        // avatarUtil fallback (cinsiyet bazlı default)
        if (window.avatarUtil) {
          if (!p1AvatarUrl) p1AvatarUrl = window.avatarUtil.getAvatarUrl({ name: ctx.p1.name, gender: ctx.p1.gender });
          if (!p2AvatarUrl) p2AvatarUrl = window.avatarUtil.getAvatarUrl({ name: ctx.p2.name, gender: ctx.p2.gender });
        }

        // Avatarları güncelle
        if (av1El && p1AvatarUrl) av1El.style.backgroundImage = 'url("' + p1AvatarUrl + '")';
        if (av2El && p2AvatarUrl) av2El.style.backgroundImage = 'url("' + p2AvatarUrl + '")';
        console.log('[Compat] Avatarlar yüklendi — p1:', p1AvatarUrl ? 'OK' : 'default', ', p2:', p2AvatarUrl ? 'OK' : 'default', ', p2.userId:', ctx.p2.userId || 'yok');
      } catch(e) { console.warn('[Compat] Avatar load error:', e); }
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
      insightCard.innerHTML = '<div class="flex items-center gap-2 mb-4"><span class="material-symbols-outlined text-primary">auto_awesome</span><h3 class="text-lg font-bold">Kozmik Bağ</h3></div>' +
        '<div id="cosmic-ai-content">' +
          (_cosmicCached
            ? '<div style="animation:compat-in 0.5s ease;color:rgba(186,181,156,0.9);">' + renderText(_cosmicCached) + '</div>'
            : loadingHTML('Kozmik bağ hesaplanıyor...'))
        + '</div>';
      if (!_cosmicCached) {
        fetchCompatAnalysis('cosmic', ctx).then(function(text){
          var el = document.getElementById('cosmic-ai-content');
          if (!el) return;
          if (text) el.innerHTML = '<div style="animation:compat-in 0.5s ease;color:rgba(186,181,156,0.9);">' + renderText(text) + '</div>';
          else el.innerHTML = '<p style="color:#ef4444;font-size:13px;">Analiz yüklenemedi.</p>';
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
    if (quote) quote.textContent = '"' + ctx.p1.name + ' ve ' + ctx.p2.name + ' — sayıların birbirine yazdığı kader."';

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
      contentDiv.style.borderTop = '1px solid rgba(255,255,255,0.08)';
      contentDiv.style.color = 'rgba(255,255,255,0.85)';
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
                  contentDiv.innerHTML = '<p style="padding:16px;color:#ef4444;font-size:13px;">Analiz yüklenemedi.</p>';
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
        target.innerHTML = loadingHTML(loadMsg || 'Analiz hazırlanıyor...');
        fetchCompatAnalysis(promptType, ctx).then(function(text) {
          if (text) {
            target.innerHTML = '<div style="animation:compat-in 0.5s ease;">' + renderText(text) + '</div>';
          } else {
            target.innerHTML = '<p style="color:#ef4444;font-size:13px;">Analiz yüklenemedi.</p>';
          }
        });
      }
    }

    // section[0]: The Karmic Bond → karmic prompt
    fillSection(sections[0], 'karmic', 'Karmik bağ okunuyor...');

    // section[1]: Communication Harmony → communication prompt
    // Bar grafiğinden sonrası için ek div ekle
    if (sections[1]) {
      var bar = sections[1].querySelector('.relative.h-48');
      var commDiv = document.createElement('div');
      commDiv.id = 'comm-ai-content';
      var _commCached = getCachedAnalysis('communication', ctx);
      if (_commCached) { commDiv.innerHTML = '<div style="animation:compat-in 0.5s ease;">' + renderText(_commCached) + '</div>'; }
      else { commDiv.innerHTML = loadingHTML('İletişim uyumu analiz ediliyor...'); }
      commDiv.style.marginTop = '12px';
      if (bar) bar.parentNode.insertBefore(commDiv, bar.nextSibling);

      if (!_commCached) fetchCompatAnalysis('communication', ctx).then(function(text) {
        var el = document.getElementById('comm-ai-content');
        if (!el) return;
        if (text) {
          el.innerHTML = '<div style="animation:compat-in 0.5s ease;color:rgba(255,255,255,0.82);">' + renderText(text) + '</div>';
        } else {
          el.innerHTML = '<p style="color:#ef4444;font-size:13px;">Analiz yüklenemedi.</p>';
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
      fillSection(sections[2], 'soul_urge', 'Duygusal uyum hesaplanıyor...');
    }

    // section[3]: The Shared Destiny → life_path prompt
    fillSection(sections[3], 'life_path', 'Ortak kader okunuyor...');
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

  // Global export
  window.CompatEngine = {
    getCompatData: getCompatData,
    fetchCompatAnalysis: fetchCompatAnalysis,
    initCompatAnalysis: initCompatAnalysis,
    initBreakdown3: initBreakdown3,
    initBreakdown2: initBreakdown2,
    calculateOverall: calculateOverall,
    bondLabel: bondLabel
  };

  // openSoulmateShare alias (bazı sayfalarda smOpen var, bu wrapper her ikisini de destekler)
  if (!window.openSoulmateShare) {
    window.openSoulmateShare = function() {
      if (typeof window.smOpen === 'function') window.smOpen();
    };
  }

})();
