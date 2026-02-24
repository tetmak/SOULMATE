/**
 * NUMERAEL — Google Play Billing Entegrasyonu
 *
 * RevenueCat yerine doğrudan Google Play Billing Library kullanır.
 * Native Capacitor plugin (PlayBillingPlugin.java) ile iletişim kurar.
 *
 * ÜRÜNLER:
 *   - numerael_premium_monthly  (Aylık abonelik)
 *   - numerael_premium_yearly   (Yıllık abonelik)
 */
(function() {
    'use strict';

    var PRODUCT_IDS = ['numerael_premium_monthly', 'numerael_premium_yearly'];
    var PlayBilling = null;
    var billingReady = false;
    var cachedProducts = [];

    // ─── PLATFORM TESPİTİ ─────────────────────────────────────
    function isNativePlatform() {
        return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    }

    function getNativePlatform() {
        if (!window.Capacitor || !window.Capacitor.getPlatform) return 'web';
        return window.Capacitor.getPlatform(); // 'ios', 'android', 'web'
    }

    // ─── INIT ────────────────────────────────────────────────
    async function init() {
        if (!isNativePlatform()) {
            console.log('[Billing] Web platformu — atlanıyor');
            return false;
        }

        try {
            // Capacitor plugin'i yükle
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PlayBilling) {
                PlayBilling = window.Capacitor.Plugins.PlayBilling;
            } else {
                console.warn('[Billing] PlayBilling plugin bulunamadı');
                return false;
            }

            // BillingClient bağlantısı
            await PlayBilling.connect();
            console.log('[Billing] BillingClient bağlandı');

            // Ürünleri sorgula
            try {
                var productsResult = await PlayBilling.queryProducts({ productIds: PRODUCT_IDS });
                if (productsResult && productsResult.products) {
                    cachedProducts = productsResult.products;
                    console.log('[Billing] Ürünler yüklendi:', cachedProducts.length);
                }
            } catch(e) {
                console.warn('[Billing] Ürün sorgulama hatası:', e);
            }

            billingReady = true;
            return true;

        } catch(e) {
            console.error('[Billing] Init hatası:', e);
            return false;
        }
    }

    // ─── PREMIUM DURUMU KONTROL ───────────────────────────────
    async function checkEntitlements() {
        if (!PlayBilling || !billingReady) return false;

        try {
            var status = await PlayBilling.checkStatus();
            if (status && status.premium) {
                console.log('[Billing] Premium aktif! Ürün:', status.productId);

                var isYearly = status.productId && status.productId.indexOf('yearly') !== -1;

                localStorage.setItem('numerael_premium', JSON.stringify({
                    active: true,
                    plan: isYearly ? 'yearly' : 'monthly',
                    expires_at: null,
                    source: 'play_store',
                    store: 'android',
                    isAutoRenewing: status.isAutoRenewing || false,
                    cached_at: new Date().toISOString()
                }));

                syncPremiumToSupabase(status);
                return true;
            }
        } catch(e) {
            console.warn('[Billing] Status kontrol hatası:', e);
        }
        return false;
    }

    async function syncPremiumToSupabase(status) {
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return;
            var isYearly = status.productId && status.productId.indexOf('yearly') !== -1;
            await window.supabaseClient.from('subscriptions').upsert({
                user_id: session.user.id,
                plan: isYearly ? 'yearly' : 'monthly',
                status: 'active',
                starts_at: new Date().toISOString(),
                expires_at: null,
                payment_provider: 'play_store',
                payment_ref: status.productId || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            console.log('[Billing] Supabase sync başarılı');
        } catch(e) {
            console.warn('[Billing] Supabase sync hatası:', e);
        }
    }

    // ─── SATIN ALMA ───────────────────────────────────────────
    async function purchasePackage(plan) {
        plan = plan || 'yearly';

        if (!billingReady || !PlayBilling) {
            console.warn('[Billing] PlayBilling hazır değil');
            return { success: false, error: 'not_ready' };
        }

        var productId = plan === 'yearly' ? 'numerael_premium_yearly' : 'numerael_premium_monthly';

        // Cached ürünlerden offerToken bul
        var offerToken = null;
        for (var i = 0; i < cachedProducts.length; i++) {
            if (cachedProducts[i].productId === productId) {
                offerToken = cachedProducts[i].offerToken || null;
                break;
            }
        }

        console.log('[Billing] Satın alma başlatılıyor:', productId);

        try {
            var purchaseParams = { productId: productId };
            if (offerToken) purchaseParams.offerToken = offerToken;

            var result = await PlayBilling.purchase(purchaseParams);

            if (result && result.success) {
                console.log('[Billing] Satın alma başarılı!');
                // Premium durumunu güncelle
                await checkEntitlements();
                window.dispatchEvent(new CustomEvent('numerael:premium-changed', { detail: { active: true } }));
                return { success: true };
            } else if (result && result.error === 'cancelled') {
                console.log('[Billing] Kullanıcı iptal etti');
                return { success: false, error: 'cancelled' };
            } else {
                return { success: false, error: (result && result.error) || 'unknown' };
            }

        } catch(e) {
            console.error('[Billing] Satın alma hatası:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // ─── RESTORE ──────────────────────────────────────────────
    async function restorePurchases() {
        if (!PlayBilling || !billingReady) {
            return { success: false, error: 'not_ready' };
        }

        try {
            var result = await PlayBilling.restorePurchases();
            if (result && result.success && result.premium) {
                console.log('[Billing] Restore başarılı — premium aktif!');
                await checkEntitlements();
                return { success: true, premium: true };
            }
            console.log('[Billing] Restore tamamlandı — premium bulunamadı');
            return { success: true, premium: false };
        } catch(e) {
            console.error('[Billing] Restore hatası:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // ─── ÜRÜN BİLGİLERİ ──────────────────────────────────────
    function getPackages() {
        return cachedProducts.map(function(p) {
            return {
                identifier: p.productId,
                packageType: p.billingPeriod === 'P1Y' ? 'ANNUAL' :
                             p.billingPeriod === 'P1M' ? 'MONTHLY' : 'UNKNOWN',
                productId: p.productId,
                title: p.title || '',
                description: p.description || '',
                price: p.price || 0,
                priceString: p.priceString || '',
                currencyCode: p.currencyCode || ''
            };
        });
    }

    // ─── GLOBAL EXPORT ────────────────────────────────────────
    window.billing = {
        init: init,
        isReady: function() { return billingReady; },
        isNative: isNativePlatform,
        getPlatform: getNativePlatform,
        checkEntitlements: checkEntitlements,
        purchase: purchasePackage,
        restore: restorePurchases,
        getPackages: getPackages
    };
})();
