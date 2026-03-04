import { handleCors } from '../_lib/cors.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { sanitizeText, validateUUID, validateEnum } from '../_lib/validate.js';

const ALLOWED_REASONS = ['spam', 'harassment', 'inappropriate', 'scam', 'other'];

/**
 * POST /api/messages-report
 * Auth: required
 * Body: { messageId: uuid, reason: string, description?: string }
 */
export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const userId = authResult.userId;
    const { messageId, reason, description } = req.body || {};

    if (!messageId || !validateUUID(messageId)) return res.status(400).json({ error: 'invalid_message_id' });
    if (!reason || !validateEnum(reason, ALLOWED_REASONS)) return res.status(400).json({ error: 'invalid_reason', allowed: ALLOWED_REASONS });

    const cleanDesc = description ? sanitizeText(description, 500) : null;
    const supabase = getSupabaseAdmin();

    try {
        const { data: msg } = await supabase.from('messages').select('id, sender_id, receiver_id').eq('id', messageId).maybeSingle();
        if (!msg) return res.status(404).json({ error: 'message_not_found' });
        if (msg.sender_id !== userId && msg.receiver_id !== userId) return res.status(403).json({ error: 'not_participant' });

        const { data: existing } = await supabase.from('reports').select('id').eq('reporter_id', userId).eq('target_type', 'message').eq('target_id', messageId).maybeSingle();
        if (existing) return res.status(409).json({ error: 'already_reported' });

        const { error: insErr } = await supabase.from('reports').insert({
            reporter_id: userId, target_type: 'message', target_id: messageId,
            reason: reason, description: cleanDesc, status: 'pending'
        });
        if (insErr) { console.error('[messages-report] Insert error:', insErr); return res.status(500).json({ error: 'insert_failed' }); }

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('[messages-report] Error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
}
