import { handleCors } from '../_lib/cors.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { sanitizeText, validateUUID } from '../_lib/validate.js';

/**
 * POST /api/messages-send
 * Auth: required
 * Body: { receiverId: uuid, content: string }
 */
export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const senderId = authResult.userId;
    const { receiverId, content } = req.body || {};

    if (!receiverId || !validateUUID(receiverId)) return res.status(400).json({ error: 'invalid_receiver_id' });
    if (senderId === receiverId) return res.status(400).json({ error: 'cannot_message_self' });

    const cleanContent = sanitizeText(content, 1000);
    if (!cleanContent) return res.status(400).json({ error: 'empty_content' });

    const rl = checkRateLimit('msg:' + senderId, 10, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limit', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) });

    const supabase = getSupabaseAdmin();

    try {
        const { data: blocks } = await supabase.from('blocks').select('blocker_id')
            .or('and(blocker_id.eq.' + senderId + ',blocked_id.eq.' + receiverId + '),and(blocker_id.eq.' + receiverId + ',blocked_id.eq.' + senderId + ')')
            .limit(1);
        if (blocks && blocks.length > 0) return res.status(403).json({ error: 'blocked' });

        const userA = senderId < receiverId ? senderId : receiverId;
        const userB = senderId < receiverId ? receiverId : senderId;
        const { data: conn } = await supabase.from('connections').select('id').eq('user_a', userA).eq('user_b', userB).maybeSingle();
        if (!conn) return res.status(403).json({ error: 'not_connected' });

        const { data: recent } = await supabase.from('messages').select('content')
            .eq('sender_id', senderId).eq('receiver_id', receiverId)
            .order('created_at', { ascending: false }).limit(3);
        if (recent && recent.length >= 3) {
            if (recent.every(function(m) { return m.content === cleanContent; })) {
                return res.status(429).json({ error: 'spam_detected' });
            }
        }

        const { data: message, error: insErr } = await supabase.from('messages')
            .insert({ sender_id: senderId, receiver_id: receiverId, content: cleanContent })
            .select('id, sender_id, receiver_id, content, created_at').single();
        if (insErr) { console.error('[messages-send] Insert error:', insErr); return res.status(500).json({ error: 'insert_failed' }); }

        try {
            let senderName = 'User';
            const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', senderId).maybeSingle();
            if (sp && sp.full_name) { senderName = sp.full_name; }
            else { const { data: dp } = await supabase.from('discovery_profiles').select('full_name').eq('user_id', senderId).maybeSingle(); if (dp && dp.full_name) senderName = dp.full_name; }
            await supabase.from('notifications').insert({ user_id: receiverId, type: 'new_message', payload: { sender_name: senderName, sender_id: senderId } });
        } catch (ne) { console.warn('[messages-send] Notif failed:', ne); }

        return res.status(200).json({ success: true, message: message });
    } catch (e) {
        console.error('[messages-send] Error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
}
