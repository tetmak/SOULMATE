/**
 * POST /api/verify-subscription
 *
 * Server-side satin alma dogrulama.
 * Authorization: Bearer <supabase_jwt>
 *
 * Body: { platform: 'play_store'|'paddle', purchaseToken: '...', productId: '...' }
 * Response: { verified: true/false, plan, expiresAt }
 */

import { handleCors } from './_lib/cors.js';
import { verifyAuth, requireAuth } from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { validateEnum, sanitizeText } from './_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;
    const userId = authResult.userId;

    const rl = checkRateLimit('verify-sub:' + userId, 5, 3600);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const { platform, purchaseToken, productId } = req.body || {};
    if (!validateEnum(platform, ['play_store', 'paddle'])) return res.status(400).json({ error: 'invalid_platform' });
    if (!productId || typeof productId !== 'string') return res.status(400).json({ error: 'invalid_product_id' });
    const cleanProductId = sanitizeText(productId, 100);
    if (!cleanProductId) return res.status(400).json({ error: 'invalid_product_id' });

    try {
        const supabase = getSupabaseAdmin();
        let verified = false, plan = null, expiresAt = null;

        if (platform === 'play_store') {
            plan = cleanProductId.indexOf('yearly') !== -1 ? 'yearly' : 'monthly';
            const expiry = new Date();
            if (plan === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);
            else expiry.setMonth(expiry.getMonth() + 1);
            expiresAt = expiry.toISOString();

            // TODO: Full Google Play Developer API v3 verification
            // When GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is configured:
            // 1. Use google-auth-library to get access token from service account
            // 2. Call androidpublisher/v3/applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{token}
            // 3. Verify purchase state, expiry time, and acknowledgment status
            // For now, trust the client purchase (native PlayBillingPlugin verifies locally)
            if (purchaseToken && typeof purchaseToken === 'string') {
                console.log('[verify-subscription] Play Store stub - userId:', userId, 'productId:', cleanProductId);
            } else {
                console.warn('[verify-subscription] Play Store - no token for userId:', userId);
            }
            verified = true;

        } else if (platform === 'paddle') {
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('plan, status, expires_at')
                .eq('user_id', userId)
                .eq('payment_provider', 'paddle')
                .maybeSingle();
            if (existingSub && (existingSub.status === 'active' || (existingSub.expires_at && new Date(existingSub.expires_at) > new Date()))) {
                verified = true;
                plan = existingSub.plan;
                expiresAt = existingSub.expires_at;
            } else {
                return res.status(200).json({ verified: false, plan: null, expiresAt: null });
            }
        }

        if (verified) {
            const { error: upsertError } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    plan: plan,
                    status: 'active',
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    payment_provider: platform,
                    payment_ref: cleanProductId,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            if (upsertError) console.error('[verify-subscription] Upsert error:', upsertError.message);
            else console.log('[verify-subscription] Verified - userId:', userId, 'plan:', plan);
        }

        return res.status(200).json({ verified, plan, expiresAt });
    } catch (e) {
        console.error('[verify-subscription] Error:', e.message);
        return res.status(500).json({ error: 'internal_error' });
    }
}
