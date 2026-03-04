import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method \!== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
    var authResult = await verifyAuth(req);
    if (\!requireAuth(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var userId = authResult.userId;
    var rl = checkRateLimit('account-export:' + userId, 1, 86400);
    if (\!rl.allowed) return res.status(429).json({ error: 'rate_limit', message: '1 export per day' });
    try {
        var tables = ['profiles','subscriptions','discovery_profiles','daily_matches','user_streaks',
            'user_gamification','quiz_results','connection_requests','connections','messages',
            'notifications','posts','ai_usage','reports'];
        var exportData = { exportedAt: new Date().toISOString(), userId: userId };
        for (var i = 0; i < tables.length; i++) {
            var t = tables[i];
            try {
                var col = t === 'profiles' ? 'id' : 'user_id';
                var r = await supabase.from(t).select('*').eq(col, userId);
                exportData[t] = r.data || [];
            } catch(e) { exportData[t] = []; }
        }
        // Also fetch messages where user is receiver
        try { var mr = await supabase.from('messages').select('*').eq('receiver_id', userId);
            if (mr.data) exportData.messages_received = mr.data; } catch(e) {}
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=numerael-data-export.json');
        return res.status(200).json(exportData);
    } catch(e) {
        return res.status(500).json({ error: 'export_failed', message: e.message });
    }
}
