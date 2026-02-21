/**
 * KADER — RevenueCat Entegrasyonu (iOS & Android In-App Purchase)
 *
 * Apple App Store ve Google Play Store için native ödeme sistemi.
 * Web'de Paddle, native uygulamalarda RevenueCat kullanılır.
 *
 * KURULUM:
 *   1. https://app.revenuecat.com → Hesap oluştur
 *   2. Projects → New Project → "Kader" oluştur
 *   3. Apple App Store Connect ve Google Play Console bağla
 *   4. Products → Entitlements → "premium" oluştur
 *   5. Offerings → "default" offering oluştur (monthly + yearly package)
 *   6. Aşağıdaki API key'leri doldur
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //    YAPILANDIRMA — RevenueCat Dashboard'dan al
    // ═══════════════════════════════════════════════════════════
    var RC_API_KEY_APPLE  = 'appl_XXXXXXXXXXXXXXXXXXXXXXX';   // RevenueCat → Project → API Keys → Apple
    var RC_API_KEY_GOOGLE = 'goog_XXXXXXXXXXXXXXXXXXXXXXX';   // RevenueCat → Project → API Keys → Google
    var RC_ENTITLEMENT_ID = 'premium';                        // RevenueCat → Entitlements → identifier

    var rcReady = false;
    var rcOfferings = null;
    var Purchases = null;
    var listenerRegistered = false;

    // ─── PLATFORM TESPİTİ ─────────────────────────────────────
    function isNativePlatform() {
        return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    }

    function getNativePlatform() {
        if (!window.Capacitor || !window.Capacitor.getPlatform) return 'web';
        return window.Capacitor.getPlatform(); // 'ios', 'android', 'web'
    }

    // ─── REVENUEcat INIT ──────────────────────────────────────
    async function initRevenueCat() {
        if (!isNativePlatform()) {
            console.log('[RevenueCat] Web platformu — atlanıyor');
            return false;
        }

        try {
            // Capacitor plugin'i yükle
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Purchases) {
                Purchases = window.Capacitor.Plugins.Purchases;
            } else {
                console.warn('[RevenueCat] Purchases plugin bulunamadı');
                return false;
            }

            var platform = getNativePlatform();
            var apiKey = platform === 'ios' ? RC_API_KEY_APPLE : RC_API_KEY_GOOGLE;

            if (apiKey.indexOf('XXXX') !== -1) {
                console.warn('[RevenueCat] API key ayarlanmamış — demo mod');
                return false;
            }

            // RevenueCat'i başlat
            await Purchases.configure({
                apiKey: apiKey
            });

            console.log('[RevenueCat] Başlatıldı (' + platform + ')');

            // Kullanıcı ID'sini bağla (Supabase user_id)
            try {
                var session = await window.auth.getSession();
                if (session && session.user) {
                    await Purchases.logIn({ appUserID: session.user.id });
                    console.log('[RevenueCat] Kullanıcı bağlandı:', session.user.id);
                }
            } catch(e) {
                console.warn('[RevenueCat] Kullanıcı bağlama hatası:', e);
            }

            // Offering'leri yükle
            try {
                var offeringsResult = await Purchases.getOfferings();
                if (offeringsResult && offeringsResult.current) {
                    rcOfferings = offeringsResult.current;
                    console.log('[RevenueCat] Offerings yüklendi:', rcOfferings.identifier);
                }
            } catch(e) {
                console.warn('[RevenueCat] Offerings yükleme hatası:', e);
            }

            // Gerçek zamanlı abonelik değişikliği listener'ı
            registerListener();

            rcReady = true;
            return true;

        } catch(e) {
            console.error('[RevenueCat] Init hatası:', e);
            return false;
        }
    }

    // ─── REAL-TIME LISTENER ─────────────────────────────────
    function registerListener() {
        if (listenerRegistered || !Purchases) return;
        try {
            Purchases.addCustomerInfoUpdateListener(function(info) {
                console.log('[RevenueCat] CustomerInfo güncellendi');
                if (info && info.customerInfo) {
                    var active = info.customerInfo.entitlements && info.customerInfo.entitlements.active;
                    if (active && active[RC_ENTITLEMENT_ID]) {
                        var ent = active[RC_ENTITLEMENT_ID];
                        console.log('[RevenueCat] Premium durumu değişti → aktif');
                        localStorage.setItem('kader_premium', JSON.stringify({
                            active: true,
                            plan: ent.productIdentifier && ent.productIdentifier.indexOf('yearly') !== -1 ? 'yearly' : 'monthly',
                            expires_at: ent.expirationDate || null,
                            source: 'revenuecat',
                            store: ent.store || getNativePlatform(),
                            cached_at: new Date().toISOString()
                        }));
                        syncPremiumToSupabase(ent);
                        // UI'ı bilgilendir
                        window.dispatchEvent(new CustomEvent('kader:premium-changed', { detail: { active: true } }));
                    } else {
                        console.log('[RevenueCat] Premium durumu değişti → pasif');
                        localStorage.removeItem('kader_premium');
                        window.dispatchEvent(new CustomEvent('kader:premium-changed', { detail: { active: false } }));
                    }
                }
            });
            listenerRegistered = true;
            console.log('[RevenueCat] Listener kayıt edildi');
        } catch(e) {
            console.warn('[RevenueCat] Listener kayıt hatası:', e);
        }
    }

    // ─── PREMIUM DURUMU KONTROL ───────────────────────────────
    async function checkEntitlements() {
        if (!Purchases || !rcReady) return false;

        try {
            var customerInfo = await Purchases.getCustomerInfo();
            if (customerInfo && customerInfo.customerInfo && customerInfo.customerInfo.entitlements && customerInfo.customerInfo.entitlements.active) {
                var active = customerInfo.customerInfo.entitlements.active;
                if (active[RC_ENTITLEMENT_ID]) {
                    var entitlement = active[RC_ENTITLEMENT_ID];
                    console.log('[RevenueCat] Premium aktif! Son kullanma:', entitlement.expirationDate);

                    // localStorage'ı güncelle (premium.js ile uyumlu)
                    localStorage.setItem('kader_premium', JSON.stringify({
                        active: true,
                        plan: entitlement.productIdentifier && entitlement.productIdentifier.indexOf('yearly') !== -1 ? 'yearly' : 'monthly',
                        expires_at: entitlement.expirationDate || null,
                        source: 'revenuecat',
                        store: entitlement.store || getNativePlatform(),
                        cached_at: new Date().toISOString()
                    }));

                    // Supabase'e de sync
                    syncPremiumToSupabase(entitlement);
                    return true;
                }
            }
        } catch(e) {
            console.warn('[RevenueCat] Entitlement kontrol hatası:', e);
        }
        return false;
    }

    async function syncPremiumToSupabase(entitlement) {
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return;
            await window.supabaseClient.from('subscriptions').upsert({
                user_id: session.user.id,
                plan: entitlement.productIdentifier && entitlement.productIdentifier.indexOf('yearly') !== -1 ? 'yearly' : 'monthly',
                status: 'active',
                starts_at: entitlement.latestPurchaseDate || new Date().toISOString(),
                expires_at: entitlement.expirationDate || null,
                payment_provider: getNativePlatform() === 'ios' ? 'app_store' : 'play_store',
                payment_ref: entitlement.productIdentifier || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            console.log('[RevenueCat] Supabase sync başarılı');
        } catch(e) {
            console.warn('[RevenueCat] Supabase sync hatası:', e);
        }
    }

    // ─── SATIN ALMA ───────────────────────────────────────────
    async function purchasePackage(plan) {
        plan = plan || 'yearly';

        if (!rcReady || !rcOfferings) {
            console.warn('[RevenueCat] Offerings hazır değil');
            return { success: false, error: 'not_ready' };
        }

        // Offering'den doğru paketi bul
        var packages = rcOfferings.availablePackages || [];
        var targetPkg = null;

        for (var i = 0; i < packages.length; i++) {
            var pkg = packages[i];
            var pkgType = (pkg.packageType || '').toUpperCase();
            if (plan === 'yearly' && (pkgType === 'ANNUAL' || pkgType === 'YEARLY')) {
                targetPkg = pkg;
                break;
            }
            if (plan === 'monthly' && pkgType === 'MONTHLY') {
                targetPkg = pkg;
                break;
            }
        }

        // Eğer type'a göre bulunamadıysa identifier'a göre dene
        if (!targetPkg) {
            for (var j = 0; j < packages.length; j++) {
                var id = (packages[j].identifier || '').toLowerCase();
                if (plan === 'yearly' && (id.indexOf('year') !== -1 || id.indexOf('annual') !== -1)) {
                    targetPkg = packages[j];
                    break;
                }
                if (plan === 'monthly' && id.indexOf('month') !== -1) {
                    targetPkg = packages[j];
                    break;
                }
            }
        }

        if (!targetPkg) {
            console.warn('[RevenueCat] Paket bulunamadı:', plan, 'Mevcut paketler:', packages.map(function(p) { return p.identifier; }));
            return { success: false, error: 'package_not_found' };
        }

        console.log('[RevenueCat] Satın alma başlatılıyor:', targetPkg.identifier);

        try {
            var result = await Purchases.purchasePackage({ aPackage: targetPkg });

            if (result && result.customerInfo) {
                var active = result.customerInfo.entitlements && result.customerInfo.entitlements.active;
                if (active && active[RC_ENTITLEMENT_ID]) {
                    console.log('[RevenueCat] Satın alma başarılı!');

                    // Premium durumunu güncelle
                    await checkEntitlements();
                    return { success: true };
                }
            }

            return { success: false, error: 'entitlement_not_active' };

        } catch(e) {
            if (e.code === 1 || (e.message && e.message.indexOf('cancel') !== -1)) {
                console.log('[RevenueCat] Kullanıcı iptal etti');
                return { success: false, error: 'cancelled' };
            }
            console.error('[RevenueCat] Satın alma hatası:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // ─── RESTORE PURCHASES ───────────────────────────────────
    async function restorePurchases() {
        if (!Purchases || !rcReady) {
            return { success: false, error: 'not_ready' };
        }

        try {
            var result = await Purchases.restorePurchases();
            if (result && result.customerInfo) {
                var active = result.customerInfo.entitlements && result.customerInfo.entitlements.active;
                if (active && active[RC_ENTITLEMENT_ID]) {
                    console.log('[RevenueCat] Restore başarılı — premium aktif!');
                    await checkEntitlements();
                    return { success: true, premium: true };
                }
            }
            console.log('[RevenueCat] Restore tamamlandı — premium bulunamadı');
            return { success: true, premium: false };
        } catch(e) {
            console.error('[RevenueCat] Restore hatası:', e);
            return { success: false, error: e.message || 'unknown' };
        }
    }

    // ─── OFFERING BİLGİLERİ ──────────────────────────────────
    function getPackages() {
        if (!rcOfferings || !rcOfferings.availablePackages) return [];
        return rcOfferings.availablePackages.map(function(pkg) {
            var product = pkg.product || {};
            return {
                identifier: pkg.identifier,
                packageType: pkg.packageType,
                productId: product.identifier || '',
                title: product.title || '',
                description: product.description || '',
                price: product.price || 0,
                priceString: product.priceString || '',
                currencyCode: product.currencyCode || ''
            };
        });
    }

    // ─── INIT ─────────────────────────────────────────────────
    // RevenueCat init, premium.js tarafından çağrılacak
    // (Hemen değil, platform kontrolünden sonra)

    // ─── GLOBAL EXPORT ────────────────────────────────────────
    window.revenuecat = {
        init: initRevenueCat,
        isReady: function() { return rcReady; },
        isNative: isNativePlatform,
        getPlatform: getNativePlatform,
        checkEntitlements: checkEntitlements,
        purchase: purchasePackage,
        restore: restorePurchases,
        getPackages: getPackages
    };
})();
