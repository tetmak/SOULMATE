/**
 * NUMERAEL — Premium Abonelik Sistemi (Çoklu Platform)
 *
 * Platform bazlı ödeme:
 *   - Web: Paddle.js v2 SDK ile overlay checkout
 *   - Android: Google Play Billing Library (doğrudan)
 *
 * FREE:  Temel numeroloji, 1 arkadaş, 1 uyumluluk/ay, Deep Insight sayfa 1
 * PREMIUM: Sınırsız her şey, AI analizler, Cosmic Match reveal, 3 sayfa breakdown
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //    YAPILANDIRMA — Paddle Dashboard'dan al
    // ═══════════════════════════════════════════════════════════
    var PADDLE_CLIENT_TOKEN = 'test_1917c8739eeec42ab948b39da0d';           // Paddle Sandbox → Developer Tools → Authentication → Client-side token
    var PADDLE_PRICE_MONTHLY = 'pri_01khyq04yfrd52w6qn8bar13q1';          // Sandbox Aylık
    var PADDLE_PRICE_YEARLY = 'pri_01khyq0rwvw8cttc184xas0h5t';           // Sandbox Yıllık
    var PADDLE_ENV = 'sandbox';             // 'sandbox' veya 'production'

    // ─── FREE LİMİTLER ──────────────────────────────────────
    var FREE_LIMITS = {
        connections: 3,                   // kendi profil + 2 arkadaş
        compatibility_per_month: 2,       // ayda 2 uyumluluk analizi
        daily_ai: false,
        deep_insight_full: false,
        cosmic_match_reveal: false,
        friendship_dynamics: false,
        manifest_per_month: 5,           // ayda 5 niyet (free)
        manifest_per_day: 1,             // günde 1 niyet (herkes)
        breakdown_pages: 1
    };

    var PREMIUM_PRICE = { monthly: 79.99, yearly: 599.99, currency: 'TRY' };

    // ─── PADDLE SDK ────────────────────────────────────────────
    var paddleReady = false;

    function loadPaddleSDK() {
        return new Promise(function(resolve) {
            if (window.Paddle) { resolve(); return; }
            var script = document.createElement('script');
            script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
            script.onload = resolve;
            script.onerror = function() {
                console.warn('[Premium] Paddle SDK yüklenemedi');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    async function initPaddle() {
        if (!PADDLE_CLIENT_TOKEN) {
            console.info('[Premium] Paddle client token ayarlanmamış — localStorage fallback aktif');
            return;
        }
        try {
            await loadPaddleSDK();
            if (!window.Paddle) return;

            if (PADDLE_ENV === 'sandbox') {
                try {
                    window.Paddle.Environment.set('sandbox');
                    console.log('[Premium] Sandbox modu ayarlandı');
                } catch(envErr) {
                    console.warn('[Premium] Paddle.Environment.set hatası:', envErr);
                }
            }
            window.Paddle.Initialize({
                token: PADDLE_CLIENT_TOKEN,
                eventCallback: handlePaddleEvent
            });
            paddleReady = true;
            console.log('[Premium] Paddle başlatıldı (' + PADDLE_ENV + ')');
        } catch(e) { console.warn('[Premium] Paddle init error:', e); }
    }

    // ─── PADDLE EVENT HANDLER ──────────────────────────────────
    function handlePaddleEvent(event) {
        if (!event || !event.name) return;
        console.log('[Premium] Paddle event:', event.name, JSON.stringify(event, null, 2));

        if (event.name === 'checkout.completed') {
            var data = event.data;
            // Checkout başarılı — premium aktif et
            var priceId = '';
            if (data && data.items && data.items.length > 0) {
                priceId = data.items[0].price_id || '';
            }
            var plan = priceId === PADDLE_PRICE_YEARLY ? 'yearly' : 'monthly';
            var days = plan === 'yearly' ? 365 : 30;
            var expires = new Date();
            expires.setDate(expires.getDate() + days);

            localStorage.setItem('numerael_premium', JSON.stringify({
                active: true,
                plan: plan,
                expires_at: expires.toISOString(),
                source: 'paddle',
                cached_at: new Date().toISOString()
            }));

            // Supabase'e de kaydet
            syncToSupabase(plan, expires.toISOString(), data);

            console.log('[Premium] Ödeme başarılı! Plan:', plan);

            // Kısa gecikme ile sayfayı yenile (checkout overlay kapansın)
            setTimeout(function() { window.location.reload(); }, 1500);
        }

        if (event.name === 'checkout.closed') {
            console.log('[Premium] Checkout kapatıldı');
        }
    }

    async function syncToSupabase(plan, expiresAt, checkoutData) {
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return;
            await window.supabaseClient.from('subscriptions').upsert({
                user_id: session.user.id,
                plan: plan,
                status: 'active',
                starts_at: new Date().toISOString(),
                expires_at: expiresAt,
                amount: plan === 'yearly' ? 59999 : 7999,
                currency: 'TRY',
                payment_provider: 'paddle',
                payment_ref: checkoutData && checkoutData.transaction_id ? checkoutData.transaction_id : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        } catch(e) { console.warn('[Premium] Supabase sync error:', e); }
    }

    // ─── PREMIUM DURUMU ──────────────────────────────────────
    // ⚠️ GEÇICI: Tüm kullanıcılar premium — Google Developer onayı sonrası false yap
    var EVERYONE_IS_PREMIUM = true;

    function isPremium() {
        if (EVERYONE_IS_PREMIUM) return true;
        try {
            var cache = JSON.parse(localStorage.getItem('numerael_premium') || 'null');
            if (cache && cache.active) {
                if (cache.expires_at && new Date(cache.expires_at) > new Date()) return true;
                if (!cache.expires_at) return true;
                localStorage.removeItem('numerael_premium');
            }
        } catch(e) {}
        return false;
    }

    async function checkPremiumStatus() {
        if (EVERYONE_IS_PREMIUM) return true;

        // HER ZAMAN Supabase'den kontrol et (tek doğru kaynak)
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return isPremium(); // offline → cache'e güven
            var res = await window.supabaseClient.from('subscriptions').select('*').eq('user_id', session.user.id).in('status', ['active', 'cancelled']).maybeSingle();
            if (res.data) {
                var isActive = res.data.status === 'active' || (res.data.expires_at && new Date(res.data.expires_at) > new Date());
                if (isActive) {
                    localStorage.setItem('numerael_premium', JSON.stringify({ active: true, plan: res.data.plan || 'monthly', expires_at: res.data.expires_at, source: 'supabase', cached_at: new Date().toISOString() }));
                    return true;
                } else {
                    // Supabase'de aktif abonelik yok — cache'i temizle
                    localStorage.removeItem('numerael_premium');
                }
            } else {
                // Supabase'de kayıt yok — cache'i temizle
                localStorage.removeItem('numerael_premium');
            }
        } catch(e) {
            console.warn('[Premium] Supabase kontrol hatası (offline?):', e.message);
            // Ağ hatası — cache'e güven
            return isPremium();
        }

        // platformInit bitmesini bekle (PlayBilling hazır olsun)
        try { await platformReady; } catch(e) {}

        // Native platform → PlayBilling'ten kontrol et
        if (window.billing && window.billing.isNative() && window.billing.isReady()) {
            try {
                var rcPremium = await window.billing.checkEntitlements();
                if (rcPremium) return true;
            } catch(e) {
                console.warn('[Premium] Billing entitlement check hatası:', e);
            }
        }

        return false;
    }

    // ─── KULLANIM LİMİTLERİ (Supabase + localStorage cache) ─────
    function getUsageKey(f) { return 'numerael_usage_' + f + '_' + new Date().toISOString().slice(0, 7); }
    function getDailyUsageKey(f) { return 'numerael_usage_' + f + '_' + new Date().toISOString().slice(0, 10); }
    function getUsageCount(f) { try { return parseInt(localStorage.getItem(getUsageKey(f)) || '0'); } catch(e) { return 0; } }
    function getDailyUsageCount(f) { try { return parseInt(localStorage.getItem(getDailyUsageKey(f)) || '0'); } catch(e) { return 0; } }

    function incrementUsage(f) {
        var c = getUsageCount(f) + 1;
        try { localStorage.setItem(getUsageKey(f), c.toString()); } catch(e) {}
        // Supabase'e de kaydet
        _syncUsageToSupabase(f, new Date().toISOString().slice(0, 7), c);
        return c;
    }
    function incrementDailyUsage(f) {
        var c = getDailyUsageCount(f) + 1;
        try { localStorage.setItem(getDailyUsageKey(f), c.toString()); } catch(e) {}
        // Supabase'e de kaydet
        _syncUsageToSupabase(f, new Date().toISOString().slice(0, 10), c);
        return c;
    }

    // Supabase'e kullanım sayacı senkronize et
    async function _syncUsageToSupabase(feature, period, count) {
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user || !window.supabaseClient) return;
            await window.supabaseClient.from('usage_counters').upsert({
                user_id: session.user.id,
                feature: feature,
                period: period,
                count: count,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,feature,period' });
        } catch(e) { /* sessiz hata — offline olabilir */ }
    }

    // Sayfa yüklendiğinde Supabase'den güncel sayaçları çek
    async function _loadUsageFromSupabase() {
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user || !window.supabaseClient) return;
            var monthPeriod = new Date().toISOString().slice(0, 7);
            var dayPeriod = new Date().toISOString().slice(0, 10);
            var res = await window.supabaseClient.from('usage_counters')
                .select('feature, period, count')
                .eq('user_id', session.user.id)
                .in('period', [monthPeriod, dayPeriod]);
            if (res.data) {
                res.data.forEach(function(row) {
                    var key = 'numerael_usage_' + row.feature + '_' + row.period;
                    var localCount = parseInt(localStorage.getItem(key) || '0');
                    // Supabase'deki sayaç daha yüksekse güncelle
                    if (row.count > localCount) {
                        try { localStorage.setItem(key, row.count.toString()); } catch(e) {}
                    }
                });
                console.log('[Premium] Kullanım sayaçları Supabase\'den yüklendi');
            }
        } catch(e) { /* sessiz hata */ }
    }

    // ─── FEATURE GATE ────────────────────────────────────────
    function canUseFeature(feature) {
        // manifest_portal özel: premium da günlük 1 limit var
        if (feature === 'manifest_portal') {
            var dailyUsed = getDailyUsageCount('manifest');
            if (dailyUsed >= FREE_LIMITS.manifest_per_day) {
                return { allowed: false, reason: 'Bugün zaten bir manifest oluşturdun. Yarın yeni bir niyet belirleyebilirsin!', daily_limit: true };
            }
            if (!isPremium()) {
                var monthlyUsed = getUsageCount('manifest');
                var monthlyLeft = FREE_LIMITS.manifest_per_month - monthlyUsed;
                if (monthlyLeft <= 0) {
                    return { allowed: false, reason: 'Bu ay ' + FREE_LIMITS.manifest_per_month + ' niyet hakkını kullandın. Premium ile her gün manifest oluştur!' };
                }
                return { allowed: true, monthlyLeft: monthlyLeft, dailyLeft: FREE_LIMITS.manifest_per_day - dailyUsed };
            }
            return { allowed: true, dailyLeft: FREE_LIMITS.manifest_per_day - dailyUsed };
        }
        if (isPremium()) return { allowed: true };
        switch (feature) {
            case 'add_connection':
                // Bağlantı sayısını localStorage cache'den hesapla
                var cc = 0;
                try {
                    var session2 = null;
                    try {
                        if (window.auth && window.auth.getSession) {
                            // Senkron erişim: localStorage'dan session oku
                            var rawSession = localStorage.getItem('numerael-auth-token');
                            if (rawSession) {
                                var parsed = JSON.parse(rawSession);
                                session2 = parsed && parsed.user ? parsed : (parsed && parsed.session ? parsed.session : null);
                            }
                        }
                    } catch(e2) {}
                    var connKey = 'numerael_connections_' + ((session2 && session2.user) ? session2.user.id : 'guest');
                    cc = JSON.parse(localStorage.getItem(connKey) || '[]').length;
                } catch(e) {}
                var friendCount = Math.max(0, cc - 1);
                var friendLimit = FREE_LIMITS.connections - 1;
                return friendCount < friendLimit ? { allowed: true } : { allowed: false, reason: 'Ücretsiz planda ' + friendLimit + ' arkadaş ekleyebilirsin. Premium ile sınırsız!' };
            case 'compatibility':
                var compUsed = getUsageCount('compatibility');
                var compLeft = FREE_LIMITS.compatibility_per_month - compUsed;
                return compLeft > 0 ? { allowed: true } : { allowed: false, reason: 'Bu ay ' + FREE_LIMITS.compatibility_per_month + ' uyumluluk hakkını kullandın. Premium ile sınırsız!' };
            case 'daily_ai': return { allowed: false, reason: 'AI destekli günlük rehber Premium özelliği.' };
            case 'deep_insight_full': return { allowed: false, reason: 'Tam Deep Insight analizi Premium özelliği.' };
            case 'cosmic_match_reveal': return { allowed: false, reason: 'Eşleşme açma Premium özelliği.' };
            case 'friendship_dynamics': return { allowed: false, reason: 'Arkadaşlık Dinamiği analizi Premium özelliği.' };
            case 'breakdown_page_2': case 'breakdown_page_3': return { allowed: false, reason: 'Bu analiz sayfası Premium özelliği.' };
            default: return { allowed: true };
        }
    }

    // ─── ÖDEME BAŞLAT (Platform bazlı) ──────────────────────
    function startPurchase(plan) {
        plan = plan || 'yearly';

        // Native platform → PlayBilling kullan
        if (window.billing && window.billing.isNative()) {
            startNativePurchase(plan);
            return;
        }

        // Web platform → Paddle kullan
        startPaddlePurchase(plan);
    }

    async function startNativePurchase(plan) {
        console.log('[Premium] Native satın alma başlatılıyor:', plan);

        if (!window.billing || !window.billing.isReady()) {
            console.warn('[Premium] PlayBilling hazır değil, init deneniyor...');
            if (window.billing) {
                await window.billing.init();
            }
            if (!window.billing || !window.billing.isReady()) {
                alert('Satın alma servisi başlatılamadı. Lütfen tekrar deneyin.');
                return;
            }
        }

        var result = await window.billing.purchase(plan);

        if (result.success) {
            console.log('[Premium] Native satın alma başarılı!');
            setTimeout(function() { window.location.reload(); }, 500);
        } else if (result.error === 'cancelled') {
            console.log('[Premium] Kullanıcı satın almayı iptal etti');
        } else {
            console.error('[Premium] Satın alma hatası:', result.error);
            alert('Satın alma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    function startPaddlePurchase(plan) {
        if (!paddleReady || !window.Paddle) {
            console.warn('[Premium] Paddle SDK hazır değil');
            window.location.href = 'premium_checkout_summary.html?plan=' + plan + '&return=' + encodeURIComponent(window.location.href);
            return;
        }

        var priceId = plan === 'yearly' ? PADDLE_PRICE_YEARLY : PADDLE_PRICE_MONTHLY;

        if (!priceId) {
            console.warn('[Premium] Paddle fiyat ID ayarlanmamış');
            window.location.href = 'premium_checkout_summary.html?plan=' + plan + '&return=' + encodeURIComponent(window.location.href);
            return;
        }

        console.log('[Premium] Paddle checkout açılıyor, priceId:', priceId, 'plan:', plan);
        var checkoutConfig = {
            items: [{ priceId: priceId, quantity: 1 }],
            settings: {
                successUrl: window.location.origin + '/mystic_numerology_home_1.html?checkout=success',
                allowLogout: false
            }
        };

        try {
            if (window.auth && window.auth.getSession) {
                window.auth.getSession().then(function(s) {
                    if (s && s.user && s.user.email) {
                        checkoutConfig.customer = { email: s.user.email };
                    }
                    if (s && s.user) {
                        checkoutConfig.customData = { user_id: s.user.id };
                    }
                    window.Paddle.Checkout.open(checkoutConfig);
                }).catch(function() {
                    window.Paddle.Checkout.open(checkoutConfig);
                });
            } else {
                window.Paddle.Checkout.open(checkoutConfig);
            }
        } catch(e) {
            window.Paddle.Checkout.open(checkoutConfig);
        }
    }

    // ─── PLATFORM HELPER ─────────────────────────────────────
    function isNativeApp() {
        return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    }

    // ─── PAYWALL UI ──────────────────────────────────────────
    var paywallVisible = false;

    function showPaywall(reason, source) {
        if (paywallVisible) return;
        paywallVisible = true;

        // Fire limit_hit notification
        if (window.notificationEngine) {
            try {
                var session = JSON.parse(localStorage.getItem('numerael-auth-token') || '{}');
                var uid = session && session.user ? session.user.id : null;
                if (uid) {
                    window.notificationEngine.createNotification(uid, 'limit_hit', {
                        limit_type: source || 'feature'
                    });
                }
            } catch(e) {}
        }

        var overlay = document.createElement('div');
        overlay.id = 'numerael-paywall-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:flex-end;justify-content:center';

        var modal = document.createElement('div');
        modal.style.cssText = 'width:100%;max-width:480px;background:linear-gradient(180deg,#1a0e2e 0%,#0f0a1a 100%);border-radius:28px 28px 0 0;border-top:1px solid rgba(139,92,246,0.3);padding:24px 20px 32px;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.34,1.1,0.64,1)';

        modal.innerHTML =
            '<div style="display:flex;justify-content:center;margin-bottom:16px"><div style="width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px"></div></div>' +
            '<div style="display:flex;justify-content:center;margin-bottom:20px"><div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(139,92,246,0.4)"><span class="material-symbols-outlined" style="color:white;font-size:36px">workspace_premium</span></div></div>' +
            '<h3 style="text-align:center;color:white;font-size:22px;font-weight:800;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Numantic Premium</h3>' +
            '<p style="text-align:center;color:rgba(255,255,255,0.45);font-size:13px;font-family:Space Grotesk,sans-serif;margin-bottom:20px">' + (reason || 'Bu özellik Premium abonelik gerektirir.') + '</p>' +
            '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">' +
                perkRow('all_inclusive', 'Sınırsız AI Analiz') +
                perkRow('group', 'Sınırsız Arkadaş & Uyumluluk') +
                perkRow('auto_awesome', 'Cosmic Match Reveal') +
                perkRow('calendar_month', 'Tam Kozmik Takvim') +
            '</div>' +
            '<div style="display:flex;gap:10px;margin-bottom:16px">' +
                '<div id="pw-m" style="flex:1;padding:14px;border-radius:16px;border:2px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);text-align:center;cursor:pointer;transition:all 0.2s"><p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Aylık</p><p style="color:white;font-size:22px;font-weight:800;font-family:Space Grotesk">₺79<span style="font-size:13px;color:rgba(255,255,255,0.4)">.99/ay</span></p></div>' +
                '<div id="pw-y" style="flex:1;padding:14px;border-radius:16px;border:2px solid rgba(139,92,246,0.5);background:rgba(139,92,246,0.08);text-align:center;cursor:pointer;transition:all 0.2s;position:relative"><div style="position:absolute;top:-8px;right:8px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:8px;padding:2px 8px"><span style="color:white;font-size:9px;font-weight:800">%37 TASARRUF</span></div><p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Yıllık</p><p style="color:white;font-size:22px;font-weight:800;font-family:Space Grotesk">₺49<span style="font-size:13px;color:rgba(255,255,255,0.4)">.99/ay</span></p></div>' +
            '</div>' +
            '<button id="pw-btn" style="width:100%;padding:16px;border-radius:9999px;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:white;font-size:16px;font-weight:700;font-family:Space Grotesk,sans-serif;border:none;cursor:pointer;box-shadow:0 0 20px rgba(139,92,246,0.3)">Premium\'a Geç</button>' +
            (isNativeApp() ? '<p id="pw-restore" style="text-align:center;color:rgba(139,92,246,0.6);font-size:12px;margin-top:12px;cursor:pointer;font-family:Space Grotesk,sans-serif;text-decoration:underline">Satın alımları geri yükle</p>' : '') +
            '<p id="pw-close" style="text-align:center;color:rgba(255,255,255,0.25);font-size:12px;margin-top:' + (isNativeApp() ? '8' : '14') + 'px;cursor:pointer;font-family:Space Grotesk,sans-serif">Şimdilik geç</p>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function() { modal.style.transform = 'translateY(0)'; }, 30);

        var sel = 'yearly';
        var mE = modal.querySelector('#pw-m'), yE = modal.querySelector('#pw-y');
        mE.addEventListener('click', function() { sel='monthly'; mE.style.borderColor='rgba(139,92,246,0.5)'; mE.style.background='rgba(139,92,246,0.08)'; yE.style.borderColor='rgba(255,255,255,0.08)'; yE.style.background='rgba(255,255,255,0.03)'; });
        yE.addEventListener('click', function() { sel='yearly'; yE.style.borderColor='rgba(139,92,246,0.5)'; yE.style.background='rgba(139,92,246,0.08)'; mE.style.borderColor='rgba(255,255,255,0.08)'; mE.style.background='rgba(255,255,255,0.03)'; });

        var pwBtn = modal.querySelector('#pw-btn');
        var purchasing = false;
        pwBtn.addEventListener('click', async function() {
            if (purchasing) return;
            purchasing = true;
            var originalText = pwBtn.innerHTML;
            pwBtn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:pw-spin 0.6s linear infinite"></span><span style="margin-left:8px">İşleniyor...</span>';
            pwBtn.style.opacity = '0.7';
            pwBtn.style.pointerEvents = 'none';

            // Spinner animasyonu ekle
            if (!document.getElementById('pw-spin-style')) {
                var spinStyle = document.createElement('style');
                spinStyle.id = 'pw-spin-style';
                spinStyle.textContent = '@keyframes pw-spin{to{transform:rotate(360deg)}}';
                document.head.appendChild(spinStyle);
            }

            try {
                // Native platform → PlayBilling
                if (window.billing && window.billing.isNative()) {
                    if (!window.billing.isReady()) await window.billing.init();
                    if (!window.billing.isReady()) {
                        showPaywallError(modal, 'Satın alma servisi başlatılamadı. İnternet bağlantınızı kontrol edin.');
                        purchasing = false;
                        pwBtn.innerHTML = originalText;
                        pwBtn.style.opacity = '1';
                        pwBtn.style.pointerEvents = 'auto';
                        return;
                    }
                    var result = await window.billing.purchase(sel);
                    if (result.success) {
                        pwBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">check_circle</span><span style="margin-left:8px">Başarılı!</span>';
                        pwBtn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                        pwBtn.style.opacity = '1';
                        setTimeout(function() { window.location.reload(); }, 800);
                        return;
                    } else if (result.error === 'cancelled') {
                        // Kullanıcı iptal etti — sessizce buton eski haline dönsün
                    } else {
                        showPaywallError(modal, 'Satın alma başarısız oldu. Lütfen tekrar deneyin.');
                    }
                } else {
                    // Web → Paddle (startPurchase zaten handle ediyor)
                    startPurchase(sel);
                }
            } catch(e) {
                console.error('[Premium] Purchase error:', e);
                showPaywallError(modal, 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }

            purchasing = false;
            pwBtn.innerHTML = originalText;
            pwBtn.style.opacity = '1';
            pwBtn.style.pointerEvents = 'auto';
        });

        function close() { modal.style.transform='translateY(100%)'; setTimeout(function(){overlay.remove();paywallVisible=false;},400); }
        modal.querySelector('#pw-close').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if(e.target===overlay) close(); });

        // Native: Restore Purchases butonu
        var restoreBtn = modal.querySelector('#pw-restore');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', async function() {
                restoreBtn.textContent = 'Geri yükleniyor...';
                var ok = await restorePurchases();
                if (!ok) {
                    restoreBtn.textContent = 'Aktif abonelik bulunamadı';
                    setTimeout(function() { restoreBtn.textContent = 'Satın alımları geri yükle'; }, 2000);
                }
            });
        }
    }

    function showPaywallError(modal, msg) {
        var existing = modal.querySelector('.pw-error');
        if (existing) existing.remove();
        var errDiv = document.createElement('div');
        errDiv.className = 'pw-error';
        errDiv.style.cssText = 'margin:0 0 12px;padding:10px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;display:flex;align-items:center;gap:8px';
        errDiv.innerHTML = '<span class="material-symbols-outlined" style="color:#ef4444;font-size:16px">error</span><span style="color:rgba(255,255,255,0.6);font-size:12px;font-family:Space Grotesk,sans-serif">' + msg + '</span>';
        var btn = modal.querySelector('#pw-btn');
        if (btn) btn.parentNode.insertBefore(errDiv, btn);
        setTimeout(function() { if (errDiv.parentNode) errDiv.remove(); }, 5000);
    }

    function perkRow(icon, title) {
        return '<div style="display:flex;align-items:center;gap:12px;padding:0 4px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(139,92,246,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="color:#a78bfa;font-size:16px">' + icon + '</span></div><span style="color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;font-family:Space Grotesk,sans-serif">' + title + '</span><span class="material-symbols-outlined" style="color:rgba(139,92,246,0.5);font-size:16px;margin-left:auto;font-variation-settings:\'FILL\' 1">check_circle</span></div>';
    }

    function showPremiumBadge(container) {
        if (!container) return;
        var b = document.createElement('div');
        b.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.06));border:1px solid rgba(139,92,246,0.15);border-radius:12px;cursor:pointer;margin-top:8px';
        b.innerHTML = '<span class="material-symbols-outlined" style="color:#a78bfa;font-size:16px">lock</span><span style="color:rgba(255,255,255,0.5);font-size:12px;font-family:Space Grotesk,sans-serif;font-weight:600">Premium ile kilidi aç</span><span class="material-symbols-outlined" style="color:rgba(255,255,255,0.2);font-size:14px;margin-left:auto">chevron_right</span>';
        b.addEventListener('click', function() { showPaywall(); });
        container.appendChild(b);
    }

    function gate(feature, onAllowed, onBlocked) {
        var c = canUseFeature(feature);
        if (c.allowed) { if (onAllowed) onAllowed(); }
        else { if (onBlocked) onBlocked(c.reason); else showPaywall(c.reason); }
    }

    // ─── DEV TOOLS ───────────────────────────────────────────
    function simulatePremium(days) {
        var exp = new Date(); exp.setDate(exp.getDate()+(days||30));
        localStorage.setItem('numerael_premium', JSON.stringify({active:true,plan:'monthly',expires_at:exp.toISOString(),source:'simulated',cached_at:new Date().toISOString()}));
        console.log('[Premium] Simulated ' + (days||30) + ' days'); window.location.reload();
    }
    function clearPremium() { localStorage.removeItem('numerael_premium'); console.log('[Premium] Cleared'); window.location.reload(); }

    // ─── INIT ────────────────────────────────────────────────
    // Platform bazlı init: native → PlayBilling, web → Paddle
    // platformReady diğer modüller tarafından await edilebilir
    var platformReady = (async function platformInit() {
        // Supabase'den kullanım sayaçlarını yükle (auth hazır olduktan sonra)
        if (window.auth && window.auth.whenReady) {
            window.auth.whenReady().then(function() { _loadUsageFromSupabase(); });
        }

        // ⚠️ GEÇICI: Herkes premium — ödeme platformu init atla
        if (EVERYONE_IS_PREMIUM) {
            console.log('[Premium] EVERYONE_IS_PREMIUM aktif — platform init atlandı');
            return;
        }

        var isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();

        if (isNative && window.billing) {
            console.log('[Premium] Native platform — PlayBilling başlatılıyor');
            try {
                var rcOk = await window.billing.init();
                if (rcOk) {
                    await window.billing.checkEntitlements();
                    console.log('[Premium] PlayBilling hazır');
                } else {
                    console.warn('[Premium] PlayBilling başlatılamadı — native ortamda Paddle kullanılamaz');
                }
            } catch(e) {
                console.error('[Premium] platformInit hatası:', e);
            }
        } else {
            console.log('[Premium] Web platform — Paddle başlatılıyor');
            await initPaddle();
        }
    })();

    // ─── RESTORE (native) ────────────────────────────────────
    async function restorePurchases() {
        if (window.billing && window.billing.isNative()) {
            var result = await window.billing.restore();
            if (result.success && result.premium) {
                window.location.reload();
                return true;
            }
            return false;
        }
        return false;
    }

    // ─── GLOBAL EXPORT ───────────────────────────────────────
    window.premium = {
        isPremium: isPremium, checkStatus: checkPremiumStatus,
        canUse: canUseFeature, gate: gate,
        showPaywall: showPaywall, showBadge: showPremiumBadge,
        startPurchase: startPurchase,
        restorePurchases: restorePurchases,
        incrementUsage: incrementUsage, getUsageCount: getUsageCount,
        incrementDailyUsage: incrementDailyUsage, getDailyUsageCount: getDailyUsageCount,
        isReady: function() {
            if (window.billing && window.billing.isNative()) return window.billing.isReady();
            return paddleReady;
        },
        waitReady: function() { return platformReady; },
        isNative: function() { return window.billing && window.billing.isNative(); },
        PRICE: PREMIUM_PRICE, FREE_LIMITS: FREE_LIMITS,
        simulate: simulatePremium, clear: clearPremium
    };
})();
