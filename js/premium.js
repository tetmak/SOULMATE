/**
 * KADER — Premium Abonelik Sistemi (Paddle Billing)
 *
 * Paddle entegrasyonu:
 *   - Paddle.js v2 SDK ile overlay checkout
 *   - Paddle Merchant of Record (vergi/KDV otomatik)
 *   - Webhook ile Supabase senkronizasyonu
 *
 * KURULUM:
 *   1. https://vendors.paddle.com → Hesap oluştur
 *   2. Catalog → Products → Ürün oluştur: "Kader Premium"
 *   3. Ürüne 2 fiyat ekle: Aylık (₺79.99/ay), Yıllık (₺599.99/yıl)
 *   4. Developer Tools → Authentication → Client-side token al
 *   5. Aşağıdaki PADDLE_* değerlerini doldur
 *
 * FREE:  Temel numeroloji, 1 arkadaş, 1 uyumluluk/ay, Deep Insight sayfa 1
 * PREMIUM: Sınırsız her şey, AI analizler, Cosmic Match reveal, 3 sayfa breakdown
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //    YAPILANDIRMA — Paddle Dashboard'dan al
    // ═══════════════════════════════════════════════════════════
    var PADDLE_CLIENT_TOKEN = 'live_59edd8bebc28b6a13576a572172';           // Paddle → Developer Tools → Authentication → Client-side token
    var PADDLE_PRICE_MONTHLY = 'pri_01khyjaczgd78ad1qnjhn344ph';          // Paddle → Catalog → Prices → aylık fiyat ID (pri_...)
    var PADDLE_PRICE_YEARLY = 'pri_01khyj8vyqh159d29723wzv3tc';           // Paddle → Catalog → Prices → yıllık fiyat ID (pri_...)
    var PADDLE_ENV = 'production';             // 'sandbox' veya 'production'

    // ─── FREE LİMİTLER ──────────────────────────────────────
    var FREE_LIMITS = {
        connections: 3,                   // kendi profil + 2 arkadaş
        compatibility_per_month: 2,       // ayda 2 uyumluluk analizi
        daily_ai: false,
        deep_insight_full: false,
        cosmic_match_reveal: false,
        friendship_dynamics: false,
        manifest_portal: 2,              // ayda 2 niyet
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

            if (PADDLE_ENV === 'sandbox' && window.Paddle.Environment && window.Paddle.Environment.set) {
                window.Paddle.Environment.set('sandbox');
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
        console.log('[Premium] Paddle event:', event.name);

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

            localStorage.setItem('kader_premium', JSON.stringify({
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
    function isPremium() {
        try {
            var cache = JSON.parse(localStorage.getItem('kader_premium') || 'null');
            if (cache && cache.active) {
                if (cache.expires_at && new Date(cache.expires_at) > new Date()) return true;
                if (!cache.expires_at) return true;
                localStorage.removeItem('kader_premium');
            }
        } catch(e) {}
        return false;
    }

    async function checkPremiumStatus() {
        if (isPremium()) return true;
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return false;
            var res = await window.supabaseClient.from('subscriptions').select('*').eq('user_id', session.user.id).in('status', ['active', 'cancelled']).single();
            if (res.data) {
                // İptal edilmiş ama süresi dolmamış abonelik hâlâ aktif sayılır
                var isActive = res.data.status === 'active' || (res.data.expires_at && new Date(res.data.expires_at) > new Date());
                if (isActive) {
                    localStorage.setItem('kader_premium', JSON.stringify({ active: true, plan: res.data.plan || 'monthly', expires_at: res.data.expires_at, source: 'supabase', cached_at: new Date().toISOString() }));
                    return true;
                }
            }
        } catch(e) {}
        return false;
    }

    // ─── KULLANIM LİMİTLERİ ─────────────────────────────────
    function getUsageKey(f) { return 'kader_usage_' + f + '_' + new Date().toISOString().slice(0, 7); }
    function getUsageCount(f) { try { return parseInt(localStorage.getItem(getUsageKey(f)) || '0'); } catch(e) { return 0; } }
    function incrementUsage(f) { var c = getUsageCount(f) + 1; try { localStorage.setItem(getUsageKey(f), c.toString()); } catch(e) {} return c; }

    // ─── FEATURE GATE ────────────────────────────────────────
    function canUseFeature(feature) {
        if (isPremium()) return { allowed: true };
        switch (feature) {
            case 'add_connection':
                var cc = 0;
                try { var ks = Object.keys(localStorage); for (var i=0;i<ks.length;i++) { if (ks[i].indexOf('kader_connections_')===0) { cc = JSON.parse(localStorage.getItem(ks[i])||'[]').length; break; } } } catch(e) {}
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
            case 'manifest_portal':
                var manUsed = getUsageCount('manifest');
                var manLeft = FREE_LIMITS.manifest_portal - manUsed;
                return manLeft > 0 ? { allowed: true } : { allowed: false, reason: 'Bu ay ' + FREE_LIMITS.manifest_portal + ' niyet hakkını kullandın. Premium ile sınırsız!' };
            default: return { allowed: true };
        }
    }

    // ─── ÖDEME BAŞLAT (Paddle Overlay Checkout) ──────────────
    function startPurchase(plan) {
        plan = plan || 'yearly';

        if (!paddleReady || !window.Paddle) {
            console.warn('[Premium] Paddle SDK hazır değil');
            // Checkout sayfasına yönlendir, orada tekrar denenecek
            window.location.href = 'premium_checkout_summary.html?plan=' + plan + '&return=' + encodeURIComponent(window.location.href);
            return;
        }

        var priceId = plan === 'yearly' ? PADDLE_PRICE_YEARLY : PADDLE_PRICE_MONTHLY;

        if (!priceId) {
            console.warn('[Premium] Paddle fiyat ID ayarlanmamış');
            window.location.href = 'premium_checkout_summary.html?plan=' + plan + '&return=' + encodeURIComponent(window.location.href);
            return;
        }

        // Kullanıcı bilgilerini al
        var checkoutConfig = {
            items: [{ priceId: priceId, quantity: 1 }]
        };

        // Kullanıcı email'i varsa ekle
        try {
            var session = null;
            if (window.auth && window.auth.getSession) {
                window.auth.getSession().then(function(s) {
                    if (s && s.user && s.user.email) {
                        checkoutConfig.customer = { email: s.user.email };
                    }
                    // customData ile user_id gönder (webhook'ta kullanılacak)
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

    // ─── PAYWALL UI ──────────────────────────────────────────
    var paywallVisible = false;

    function showPaywall(reason) {
        if (paywallVisible) return;
        paywallVisible = true;

        var overlay = document.createElement('div');
        overlay.id = 'kader-paywall-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:flex-end;justify-content:center';

        var modal = document.createElement('div');
        modal.style.cssText = 'width:100%;max-width:480px;background:linear-gradient(180deg,#1a0e2e 0%,#0f0a1a 100%);border-radius:28px 28px 0 0;border-top:1px solid rgba(139,92,246,0.3);padding:24px 20px 32px;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.34,1.1,0.64,1)';

        modal.innerHTML =
            '<div style="display:flex;justify-content:center;margin-bottom:16px"><div style="width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px"></div></div>' +
            '<div style="display:flex;justify-content:center;margin-bottom:20px"><div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(139,92,246,0.4)"><span class="material-symbols-outlined" style="color:white;font-size:36px">workspace_premium</span></div></div>' +
            '<h3 style="text-align:center;color:white;font-size:22px;font-weight:800;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Kader Premium</h3>' +
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
            '<p id="pw-close" style="text-align:center;color:rgba(255,255,255,0.25);font-size:12px;margin-top:14px;cursor:pointer;font-family:Space Grotesk,sans-serif">Şimdilik geç</p>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function() { modal.style.transform = 'translateY(0)'; }, 30);

        var sel = 'yearly';
        var mE = modal.querySelector('#pw-m'), yE = modal.querySelector('#pw-y');
        mE.addEventListener('click', function() { sel='monthly'; mE.style.borderColor='rgba(139,92,246,0.5)'; mE.style.background='rgba(139,92,246,0.08)'; yE.style.borderColor='rgba(255,255,255,0.08)'; yE.style.background='rgba(255,255,255,0.03)'; });
        yE.addEventListener('click', function() { sel='yearly'; yE.style.borderColor='rgba(139,92,246,0.5)'; yE.style.background='rgba(139,92,246,0.08)'; mE.style.borderColor='rgba(255,255,255,0.08)'; mE.style.background='rgba(255,255,255,0.03)'; });
        modal.querySelector('#pw-btn').addEventListener('click', function() { startPurchase(sel); });

        function close() { modal.style.transform='translateY(100%)'; setTimeout(function(){overlay.remove();paywallVisible=false;},400); }
        modal.querySelector('#pw-close').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if(e.target===overlay) close(); });
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
        localStorage.setItem('kader_premium', JSON.stringify({active:true,plan:'monthly',expires_at:exp.toISOString(),source:'simulated',cached_at:new Date().toISOString()}));
        console.log('[Premium] Simulated ' + (days||30) + ' days'); window.location.reload();
    }
    function clearPremium() { localStorage.removeItem('kader_premium'); console.log('[Premium] Cleared'); window.location.reload(); }

    // ─── INIT ────────────────────────────────────────────────
    initPaddle();

    // ─── GLOBAL EXPORT ───────────────────────────────────────
    window.premium = {
        isPremium: isPremium, checkStatus: checkPremiumStatus,
        canUse: canUseFeature, gate: gate,
        showPaywall: showPaywall, showBadge: showPremiumBadge,
        startPurchase: startPurchase,
        incrementUsage: incrementUsage, getUsageCount: getUsageCount,
        isReady: function() { return paddleReady; },
        PRICE: PREMIUM_PRICE, FREE_LIMITS: FREE_LIMITS,
        simulate: simulatePremium, clear: clearPremium
    };
})();
