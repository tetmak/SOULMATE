/**
 * GET /api/subscription-status
 *
 * Server-side premium durum kontrolu.
 * Authorization: Bearer <supabase_jwt>
 *
 * Response: {
 *   premium: true/false,
 *   plan: 'monthly'|'yearly'|null,
 *   expiresAt: ISO string|null,
 *   source: 'supabase'|'play_store'|'paddle'|null
 * }
 */

import { handleCors } from './_lib/cors.js';
import { verifyAuth, requireAuth } from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { checkRateLimit } from './_lib/rate-limit.js';

export default async function handler(req, res) {
    // CORS
    if (handleCors(req, res)) return;

    // Only GET allowed
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    // Auth
    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const userId = authResult.userId;

    // Rate limit: 30 requests per minute per user
    const rl = checkRateLimit('sub-status:' + userId, 30, 60);
    if (!rl.allowed) {
        return res.status(429).json({
            error: 'rate_limited',
            retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000)
        });
    }

    try {
        const supabase = getSupabaseAdmin();

        // Query subscriptions table for active or recently-cancelled subscriptions
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('plan, status, expires_at, payment_provider, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

        if (subError) {
            console.error('[subscription-status] Supabase query error:', subError.message);
            return res.status(500).json({ error: 'database_error' });
        }

        // Determine premium status
        if (subscription) {
            const now = new Date();
            const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
            const isActive = subscription.status === 'active' ||
                (expiresAt && expiresAt > now);

            if (isActive) {
                // Map payment_provider to source
                let source = 'supabase';
                if (subscription.payment_provider === 'play_store') source = 'play_store';
                else if (subscription.payment_provider === 'paddle') source = 'paddle';

                return res.status(200).json({
                    premium: true,
                    plan: subscription.plan || null,
                    expiresAt: subscription.expires_at || null,
                    source: source
                });
            }
        }

        // No active subscription found
        return res.status(200).json({
            premium: false,
            plan: null,
            expiresAt: null,
            source: null
        });

    } catch (e) {
        console.error('[subscription-status] Unexpected error:', e.message);
        return res.status(500).json({ error: 'internal_error' });
    }
}
