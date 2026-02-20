import { createClient } from '@supabase/supabase-js';

/**
 * RevenueCat Webhook Handler
 *
 * RevenueCat Dashboard → Project Settings → Integrations → Webhooks
 * URL: https://YOUR_DOMAIN/api/revenuecat-webhook
 * Authorization Header: Bearer <REVENUECAT_WEBHOOK_AUTH_KEY>
 *
 * Bu endpoint abonelik olaylarını (satın alma, yenileme, iptal, süre bitimi)
 * alır ve Supabase subscriptions tablosunu günceller.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RC_WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Webhook doğrulama
    if (RC_WEBHOOK_AUTH_KEY) {
        var auth = req.headers['authorization'] || '';
        if (auth !== 'Bearer ' + RC_WEBHOOK_AUTH_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    if (!SUPABASE_SERVICE_KEY) {
        console.error('[Webhook] SUPABASE_SERVICE_ROLE_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    var supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        var event = req.body;
        if (!event || !event.event) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        var eventType = event.event.type;
        var appUserId = event.event.app_user_id;

        // RevenueCat anonymous ID'leri atla ($RCAnonymousID)
        if (!appUserId || appUserId.startsWith('$RCAnonymousID')) {
            return res.status(200).json({ ok: true, skipped: 'anonymous_user' });
        }

        var subscriber = event.event;
        var productId = subscriber.product_id || '';
        var plan = productId.includes('yearly') || productId.includes('annual') ? 'yearly' : 'monthly';
        var expiresAt = subscriber.expiration_at_ms ? new Date(subscriber.expiration_at_ms).toISOString() : null;
        var amount = plan === 'yearly' ? 59999 : 7999;

        console.log('[Webhook] Event:', eventType, 'User:', appUserId, 'Plan:', plan);

        switch (eventType) {
            // ─── Yeni satın alma ───
            case 'INITIAL_PURCHASE':
            case 'NON_RENEWING_PURCHASE':
                await supabase.from('subscriptions').upsert({
                    user_id: appUserId,
                    plan: plan,
                    status: 'active',
                    amount: amount,
                    currency: 'TRY',
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    cancelled_at: null,
                    payment_provider: 'revenuecat',
                    payment_ref: subscriber.transaction_id || subscriber.id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── Yenileme ───
            case 'RENEWAL':
                await supabase.from('subscriptions').upsert({
                    user_id: appUserId,
                    plan: plan,
                    status: 'active',
                    amount: amount,
                    currency: 'TRY',
                    expires_at: expiresAt,
                    cancelled_at: null,
                    payment_provider: 'revenuecat',
                    payment_ref: subscriber.transaction_id || subscriber.id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── İptal (süre sonuna kadar aktif kalır) ───
            case 'CANCELLATION':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('user_id', appUserId);
                break;

            // ─── Süre bitimi ───
            case 'EXPIRATION':
                await supabase.from('subscriptions').update({
                    status: 'expired',
                    updated_at: new Date().toISOString()
                }).eq('user_id', appUserId);
                break;

            // ─── Faturalandırma sorunu ───
            case 'BILLING_ISSUE':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('user_id', appUserId);
                break;

            // ─── Abonelik geri yükleme ───
            case 'UNCANCELLATION':
                await supabase.from('subscriptions').update({
                    status: 'active',
                    cancelled_at: null,
                    updated_at: new Date().toISOString()
                }).eq('user_id', appUserId);
                break;

            default:
                console.log('[Webhook] Unhandled event type:', eventType);
        }

        return res.status(200).json({ ok: true, event: eventType });
    } catch (error) {
        console.error('[Webhook] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
