import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { validateUUID, validateEnum, sanitizeText } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    // Gunluk 10 rapor limiti
    const rl = checkRateLimit('report:' + auth.userId, 10, 86400);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const { targetType, targetId, reason, description } = req.body || {};

    if (!validateEnum(targetType, ['post', 'comment', 'user', 'message'])) {
        return res.status(400).json({ error: 'invalid_target_type' });
    }
    if (!targetId || !validateUUID(targetId)) {
        return res.status(400).json({ error: 'invalid_target_id' });
    }
    if (!validateEnum(reason, ['spam', 'harassment', 'inappropriate', 'hate_speech', 'self_harm', 'other'])) {
        return res.status(400).json({ error: 'invalid_reason' });
    }

    const cleanDesc = description ? sanitizeText(description, 500) : null;
    const supabase = getSupabaseAdmin();

    // Ayni rapor tekrar gonderilmesin
    const { data: existing } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', auth.userId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();

    if (existing) return res.status(409).json({ error: 'already_reported' });

    const { error } = await supabase.from('reports').insert({
        reporter_id: auth.userId,
        target_type: targetType,
        target_id: targetId,
        reason,
        description: cleanDesc
    });

    if (error) return res.status(500).json({ error: 'report_failed' });
    return res.status(201).json({ success: true });
}
