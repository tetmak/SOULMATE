/**
 * NUMERAEL — Apple In-App Purchase Entegrasyonu
 *
 * StoreKit 2 native plugin (AppleIAPPlugin.swift) ile iletisim kurar.
 * play-billing.js ile ayni arayuz saglar.
 *
 * URUNLER:
 *   - numerael_premium_monthly  (Aylik abonelik)
 *   - numerael_premium_yearly   (Yillik abonelik)
 */
(function() {
    'use strict';

    var PRODUCT_IDS = ['numerael_premium_monthly', 'numerael_premium_yearly'];
    var AppleIAP = null;
    var billingReady = false;
    var cachedProducts = [];

    // --- PLATFORM TESPITI ---
    function isNativePlatform() {
        return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    }

    function getNativePlatform() {
        if (!window.Capacitor || !window.Capacitor.getPlatform) return 'web';
        return window.Capacitor.getPlatform(); // 'ios', 'android', 'web'
    }

    function isIOS() {
        return getNativePlatform() === 'ios';
    }

    // --- INIT ---
    async function init() {
        if (!isNativePlatform() || !isIOS()) {
            console.log('[AppleBilling] iOS degil - atlaniyor');
            return false;
        }

        try {
            // Capacitor plugin'i yukle
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AppleIAP) {
                AppleIAP = window.Capacitor.Plugins.AppleIAP;
            } else {
                console.warn('[AppleBilling] AppleIAP plugin bulunamadi');
                return false;
            }

            // Baglanti (StoreKit 2 icin formalikte)
            await AppleIAP.connect();
            console.log('[AppleBilling] StoreKit baglandi');

            // Urunleri sorgula
            try {
                var productsResult = await AppleIAP.queryProducts({ productIds: PRODUCT_IDS });
                if (productsResult && productsResult.products) {
                    cachedProducts = productsResult.products;
                    console.log('[AppleBilling] Urunler yuklendi:', cachedProducts.length);
                }
            } catch(e) {
                console.warn('[AppleBilling] Urun sorgulama hatasi:', e);
            }

            billingReady = true;
            return true;

        } catch(e) {
            console.error('[AppleBilling] Init hatasi:', e);
            return false;
        }
    }

    // --- PREMIUM DURUMU KONTROL ---
    async function checkEntitlements() {
        if (!AppleIAP || !billingReady) return false;

        try {
            var status = await AppleIAP.checkStatus();
            if (status && status.premium) {
                console.log('[AppleBilling] Premium aktif! Urun:', status.productId);

                var isYearly = status.productId && status.productId.indexOf('yearly') !== -1;

                localStorage.setItem('numerael_premium', JSON.stringify({
                    active: true,
                    plan: isYearly ? 'yearly' : 'monthly',
                    expires_at: null,
                    source: 'app_store',
                    store: 'ios',
                    isAutoRenewing: status.isAutoRenewing || false,
                    cached_at: new Date().toISOString()
                }));

                syncPremiumToSupabase(status);
                return true;
            }
        } catch(e) {
            console.warn('[AppleBilling] Status kontrol hatasi:', e);
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
                payment_provider: 'app_store',
                payment_ref: status.productId || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            console.log('[AppleBilling] Supabase sync basarili');
        } catch(e) {
            console.warn('[AppleBilling] Supabase sync hatasi:', e);
        }
    }

    // --- SATIN ALMA ---
    async function purchasePackage(plan) {
        plan = plan || 'yearly';

        if (!billingReady || !AppleIAP) {
            console.warn('[AppleBilling] AppleIAP hazir degil');
            return { success: false, error: 'not_ready' };
        }

        var productId = plan === 'yearly' ? 'numerael_premium_yearly' : 'numerael_premium_monthly';

        console.log('[AppleBilling] Satin alma baslatiliyor:', productId);

        try {
            var result = await AppleIAP.purchase({ productId: productId });

            if (result && result.success) {
                console.log('[AppleBilling] Satin alma basarili!');
                // Premium durumunu guncelle
                await checkEntitlements();

                // Server-side dogrulama
                try {
                    var session = await window.auth.getSession();
                    if (session && session.access_token) {
                        var API_BASE = window.__NUMERAEL_API_BASE || '';
                        var purchaseToken = (result && result.purchaseToken) || '';
                        await fetch(API_BASE + '/api/verify-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + session.access_token
                            },
                            body: JSON.stringify({
                                platform: 'app_store',
                                purchaseToken: purchaseToken,
                                productId: productId
                            })
                        });
                        console.log('[AppleBilling] Server-side dogrulama gonderildi');
                    }
                } catch(verifyErr) {
                    console.warn('[AppleBilling] Server-side dogrulama hatasi:', verifyErr);
                }
                window.dispatchEvent(new CustomEvent('numerael:premium-changed', { detail: { active: true } }));
                return { success: true };
            } else if (result && result.error === 'cancelled') {
                console.log('[AppleBilling] Kullanici iptal etti');
                return { success: false, error: 'cancelled' };
            } else {
                return { success: false, error: (result && result.error) || 'unknown' };
            }

        } catch(e) {
            console.error('[AppleBilling] Satin alma hatasi:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // --- RESTORE ---
    async function restorePurchases() {
        if (!AppleIAP || !billingReady) {
            return { success: false, error: 'not_ready' };
        }

        try {
            var result = await AppleIAP.restorePurchases();
            if (result && result.success && result.premium) {
                console.log('[AppleBilling] Restore basarili - premium aktif!');
                await checkEntitlements();
                return { success: true, premium: true };
            }
            console.log('[AppleBilling] Restore tamamlandi - premium bulunamadi');
            return { success: true, premium: false };
        } catch(e) {
            console.error('[AppleBilling] Restore hatasi:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // --- URUN BILGILERI ---
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

    // --- GLOBAL EXPORT ---
    window.appleBilling = {
        init: init,
        isReady: function() { return billingReady; },
        isNative: isNativePlatform,
        isIOS: isIOS,
        getPlatform: getNativePlatform,
        checkEntitlements: checkEntitlements,
        purchase: purchasePackage,
        restore: restorePurchases,
        getPackages: getPackages
    };
})();
