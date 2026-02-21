import { createClient } from '@supabase/supabase-js';

/**
 * RevenueCat Webhook Handler
 *
 * RevenueCat Dashboard → Project Settings → Integrations → Webhooks
 * URL: https://soulmate-kohl.vercel.app/api/revenuecat-webhook
 * Authorization Header: Bearer <REVENUECAT_WEBHOOK_SECRET>
 *
 * Vercel Environment Variables:
 *   SUPABASE_SERVICE_ROLE_KEY    — Supabase service role key
 *   REVENUECAT_WEBHOOK_SECRET    — RevenueCat webhook auth key
 *
 * Events handled:
 *   - INITIAL_PURCHASE          — Yeni abonelik satın alındı
 *   - RENEWAL                   — Abonelik yenilendi
 *   - CANCELLATION              — Abonelik iptal edildi
 *   - UNCANCELLATION            — İptal geri alındı
 *   - BILLING_ISSUE             — Ödeme sorunu
 *   - SUBSCRIBER_ALIAS          — Kullanıcı alias'ı değişti
 *   - PRODUCT_CHANGE            — Plan değiştirildi
 *   - EXPIRATION                — Abonelik süresi doldu
 *   - TRANSFER                  — Abonelik transfer edildi
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RC_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Authorization header doğrulama
    if (RC_WEBHOOK_SECRET) {
        var authHeader = req.headers['authorization'] || '';
        var token = authHeader.replace('Bearer ', '');
        if (token !== RC_WEBHOOK_SECRET) {
            console.warn('[RC Webhook] Invalid authorization');
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    if (!SUPABASE_SERVICE_KEY) {
        console.error('[RC Webhook] SUPABASE_SERVICE_ROLE_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    var supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        var body = req.body;
        if (!body || !body.event) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        var event = body.event;
        var eventType = event.type;

        // RevenueCat app_user_id = Supabase user UUID
        var userId = event.app_user_id || null;

        // $RCAnonymousID prefix'li ise skip
        if (!userId || userId.indexOf('$RCAnonymousID') === 0) {
            console.log('[RC Webhook] Anonymous user, skipping. Event:', eventType);
            return res.status(200).json({ ok: true, skipped: 'anonymous_user' });
        }

        // Ürün bilgileri
        var productId = event.product_id || '';
        var isYearly = productId.indexOf('year') !== -1 || productId.indexOf('annual') !== -1;
        var plan = isYearly ? 'yearly' : 'monthly';

        // Store bilgisi
        var store = event.store || 'unknown';
        var paymentProvider = store === 'APP_STORE' ? 'app_store' :
                              store === 'PLAY_STORE' ? 'play_store' :
                              store.toLowerCase();

        // Tarih bilgileri
        var expiresAt = event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null;
        var purchasedAt = event.purchased_at_ms
            ? new Date(event.purchased_at_ms).toISOString()
            : new Date().toISOString();

        // Fiyat bilgisi (RevenueCat cent olarak gönderir)
        var amount = event.price_in_purchased_currency
            ? Math.round(event.price_in_purchased_currency * 100)
            : (isYearly ? 59999 : 7999);
        var currency = event.currency || 'TRY';

        console.log('[RC Webhook] Event:', eventType, 'User:', userId, 'Product:', productId, 'Store:', store);

        switch (eventType) {
            // ─── Yeni satın alma ───
            case 'INITIAL_PURCHASE':
                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: plan,
                    status: 'active',
                    amount: amount,
                    currency: currency,
                    starts_at: purchasedAt,
                    expires_at: expiresAt,
                    cancelled_at: null,
                    payment_provider: paymentProvider,
                    payment_ref: event.transaction_id || event.original_transaction_id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── Yenileme ───
            case 'RENEWAL':
                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: plan,
                    status: 'active',
                    amount: amount,
                    currency: currency,
                    starts_at: purchasedAt,
                    expires_at: expiresAt,
                    cancelled_at: null,
                    payment_provider: paymentProvider,
                    payment_ref: event.transaction_id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── İptal ───
            case 'CANCELLATION':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── İptal geri alma ───
            case 'UNCANCELLATION':
                await supabase.from('subscriptions').update({
                    status: 'active',
                    cancelled_at: null,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── Ödeme sorunu ───
            case 'BILLING_ISSUE':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── Plan değişikliği ───
            case 'PRODUCT_CHANGE':
                var newProductId = event.new_product_id || productId;
                var newIsYearly = newProductId.indexOf('year') !== -1 || newProductId.indexOf('annual') !== -1;
                var newPlan = newIsYearly ? 'yearly' : 'monthly';

                await supabase.from('subscriptions').update({
                    plan: newPlan,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── Süre dolumu ───
            case 'EXPIRATION':
                await supabase.from('subscriptions').update({
                    status: 'expired',
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── Transfer ───
            case 'TRANSFER':
                var newUserId = event.transferred_to && event.transferred_to[0];
                if (newUserId) {
                    // Eski kullanıcının aboneliğini kaldır
                    await supabase.from('subscriptions').update({
                        status: 'expired',
                        updated_at: new Date().toISOString()
                    }).eq('user_id', userId);

                    // Yeni kullanıcıya ata
                    await supabase.from('subscriptions').upsert({
                        user_id: newUserId,
                        plan: plan,
                        status: 'active',
                        amount: amount,
                        currency: currency,
                        starts_at: purchasedAt,
                        expires_at: expiresAt,
                        cancelled_at: null,
                        payment_provider: paymentProvider,
                        payment_ref: event.transaction_id || null,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });
                }
                break;

            default:
                console.log('[RC Webhook] Unhandled event:', eventType);
        }

        return res.status(200).json({ ok: true, event: eventType });
    } catch (error) {
        console.error('[RC Webhook] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
