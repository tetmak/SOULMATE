import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Paddle Webhook Handler
 *
 * Paddle Dashboard → Developer Tools → Notifications → New destination
 * URL: https://soulmate-kohl.vercel.app/api/paddle-webhook
 * Events: subscription.created, subscription.updated, subscription.canceled,
 *         subscription.past_due, subscription.activated, transaction.completed
 *
 * Vercel Environment Variables:
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key
 *   PADDLE_WEBHOOK_SECRET     — Paddle webhook secret key (pdl_ntfset_ ile başlar)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

function verifyPaddleSignature(rawBody, signature) {
    if (!PADDLE_WEBHOOK_SECRET || !signature) return false;
    try {
        // Paddle Billing v2 signature format: ts=TIMESTAMP;h1=HASH
        var parts = {};
        signature.split(';').forEach(function(part) {
            var kv = part.split('=');
            if (kv.length === 2) parts[kv[0]] = kv[1];
        });
        if (!parts.ts || !parts.h1) return false;

        // Timestamp validation (max 5 min age)
        if (parts.ts) {
            var tsAge = Date.now() - (parseInt(parts.ts) * 1000);
            if (tsAge > 5 * 60 * 1000) {
                console.warn("[Paddle Webhook] Timestamp too old:", tsAge);
                return false;
            }
        }

        var signedPayload = parts.ts + ':' + rawBody;
        var expectedSignature = crypto
            .createHmac('sha256', PADDLE_WEBHOOK_SECRET)
            .update(signedPayload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(parts.h1, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch(e) {
        console.error('[Paddle Webhook] Signature verification error:', e);
        return false;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Paddle-Signature');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Webhook imza doğrulama
    if (PADDLE_WEBHOOK_SECRET) {
        var signature = req.headers['paddle-signature'] || '';
        var rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        if (!verifyPaddleSignature(rawBody, signature)) {
            console.warn('[Paddle Webhook] Invalid signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    if (!SUPABASE_SERVICE_KEY) {
        console.error('[Paddle Webhook] SUPABASE_SERVICE_ROLE_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    var supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        var event = req.body;
        if (!event || !event.event_type) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        var eventType = event.event_type;
        var data = event.data || {};
        // Replay prevention — check if event already processed
        var eventId = event.event_id || event.notification_id;
        if (eventId) {
            var { data: existing } = await supabase.from("webhook_events")
                .select("event_id").eq("event_id", eventId).maybeSingle();
            if (existing) return res.status(200).json({ ok: true, skipped: "duplicate" });
            await supabase.from("webhook_events").insert({ event_id: eventId, event_type: eventType, processed_at: new Date().toISOString() });
        }


        // custom_data'dan user_id al (checkout sırasında gönderildi)
        var userId = null;
        if (data.custom_data && data.custom_data.user_id) {
            userId = data.custom_data.user_id;
        }

        // Transaction event'lerinde items[0].custom_data'dan al
        if (!userId && data.items && data.items[0] && data.items[0].custom_data && data.items[0].custom_data.user_id) {
            userId = data.items[0].custom_data.user_id;
        }

        if (!userId) {
            console.log('[Paddle Webhook] No user_id in custom_data, skipping. Event:', eventType);
            return res.status(200).json({ ok: true, skipped: 'no_user_id' });
        }

        // Plan tipini belirle
        var plan = 'monthly';
        if (data.items && data.items.length > 0) {
            var priceData = data.items[0].price || {};
            var billingCycle = priceData.billing_cycle;
            if (billingCycle && billingCycle.interval === 'year') plan = 'yearly';
        }

        // Fiyat bilgisi
        var amount = plan === 'yearly' ? 59999 : 7999;

        // Bitiş tarihi
        var expiresAt = data.current_billing_period && data.current_billing_period.ends_at
            ? data.current_billing_period.ends_at
            : null;

        console.log('[Paddle Webhook] Event:', eventType, 'User:', userId, 'Plan:', plan);

        switch (eventType) {
            // ─── Yeni abonelik ───
            case 'subscription.created':
            case 'subscription.activated':
                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: plan,
                    status: 'active',
                    amount: amount,
                    currency: 'TRY',
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    cancelled_at: null,
                    payment_provider: 'paddle',
                    payment_ref: data.id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── Abonelik güncelleme (yenileme, plan değişikliği) ───
            case 'subscription.updated':
                var status = data.status; // active, past_due, canceled, paused, trialing
                var dbStatus = 'active';
                if (status === 'canceled') dbStatus = 'cancelled';
                else if (status === 'past_due') dbStatus = 'cancelled';
                else if (status === 'paused') dbStatus = 'cancelled';

                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: plan,
                    status: dbStatus,
                    amount: amount,
                    currency: 'TRY',
                    expires_at: expiresAt,
                    cancelled_at: dbStatus === 'cancelled' ? new Date().toISOString() : null,
                    payment_provider: 'paddle',
                    payment_ref: data.id || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                break;

            // ─── İptal ───
            case 'subscription.canceled':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── Ödeme sorunu ───
            case 'subscription.past_due':
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
                break;

            // ─── İşlem tamamlandı (ilk ödeme veya yenileme) ───
            case 'transaction.completed':
                if (data.subscription_id) {
                    await supabase.from('subscriptions').upsert({
                        user_id: userId,
                        plan: plan,
                        status: 'active',
                        amount: amount,
                        currency: 'TRY',
                        starts_at: new Date().toISOString(),
                        expires_at: expiresAt,
                        cancelled_at: null,
                        payment_provider: 'paddle',
                        payment_ref: data.subscription_id,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });
                }
                break;

            default:
                console.log('[Paddle Webhook] Unhandled event:', eventType);
        }

        return res.status(200).json({ ok: true, event: eventType });
    } catch (error) {
        console.error('[Paddle Webhook] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
