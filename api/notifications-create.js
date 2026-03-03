import { handleCors } from './_lib/cors.js';
import { verifyAuth, requireAuth } from './_lib/auth.js';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { validateUUID, validateEnum } from './_lib/validate.js';

const ALLOWED_TYPES = ['connection_request', 'connection_accepted', 'new_message', 'limit_hit', 'xp_earned', 'rank_up'];

/**
 * POST /api/notifications-create
 * Auth: required
 * Body: { targetUserId: uuid, type: string, payload: object }
 */
export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const senderId = authResult.userId;
    const { targetUserId, type, payload } = req.body || {};

    if (!targetUserId || !validateUUID(targetUserId)) return res.status(400).json({ error: 'invalid_target_user_id' });
    if (!type || !validateEnum(type, ALLOWED_TYPES)) return res.status(400).json({ error: 'invalid_type', allowed: ALLOWED_TYPES });

    const safePayload = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : {};

    const rl = checkRateLimit('notif:' + senderId, 30, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limit', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) });

    const supabase = getSupabaseAdmin();

    try {
        if (type === 'new_message') {
            const userA = senderId < targetUserId ? senderId : targetUserId;
            const userB = senderId < targetUserId ? targetUserId : senderId;
            const { data: conn } = await supabase.from('connections').select('id').eq('user_a', userA).eq('user_b', userB).maybeSingle();
            if (!conn) return res.status(403).json({ error: 'not_connected' });
        }

        if (type === 'connection_request') {
            const { data: pending } = await supabase.from('connection_requests').select('id')
                .eq('sender_id', senderId).eq('receiver_id', targetUserId).eq('status', 'pending').maybeSingle();
            if (!pending) return res.status(403).json({ error: 'no_pending_request' });
        }

        const { error: insErr } = await supabase.from('notifications').insert({ user_id: targetUserId, type: type, payload: safePayload });
        if (insErr) { console.error('[notifications-create] Insert error:', insErr); return res.status(500).json({ error: 'insert_failed' }); }

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('[notifications-create] Error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
}
