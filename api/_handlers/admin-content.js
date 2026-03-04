import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAdmin } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { validateUUID, validateEnum } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method \!== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    var authResult = await verifyAuth(req);
    if (\!requireAdmin(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var rl = checkRateLimit('admin-content:' + authResult.userId, 30, 60);
    if (\!rl.allowed) return res.status(429).json({ error: 'rate_limit' });
    var body = req.body || {};
    if (\!validateEnum(body.action, ['hide', 'unhide', 'delete'])) return res.status(400).json({ error: 'invalid_action' });
    if (\!validateEnum(body.targetType, ['post', 'comment'])) return res.status(400).json({ error: 'invalid_target_type' });
    if (\!body.targetId || \!validateUUID(body.targetId)) return res.status(400).json({ error: 'invalid_target_id' });
    var table = body.targetType === 'post' ? 'posts' : 'comments';
    if (body.action === 'hide') {
        await supabase.from(table).update({ is_hidden: true }).eq('id', body.targetId);
    } else if (body.action === 'unhide') {
        await supabase.from(table).update({ is_hidden: false }).eq('id', body.targetId);
    } else if (body.action === 'delete') {
        await supabase.from(table).delete().eq('id', body.targetId);
    }
    return res.status(200).json({ success: true });
}
