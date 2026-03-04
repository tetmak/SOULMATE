import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method \!== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    var authResult = await verifyAuth(req);
    if (\!requireAuth(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var rl = checkRateLimit('account-delete:' + authResult.userId, 3, 3600);
    if (\!rl.allowed) return res.status(429).json({ error: 'rate_limit' });
    var body = req.body || {};
    if (body.confirmPhrase \!== 'DELETE') return res.status(400).json({ error: 'confirmation_required', message: 'Send confirmPhrase: DELETE' });
    var userId = authResult.userId;
    try {
        // GDPR full data deletion — delete ALL user data
        var tables = [
            { t: 'messages', cols: ['sender_id', 'receiver_id'] },
            { t: 'notifications', cols: ['user_id'] },
            { t: 'connection_requests', cols: ['sender_id', 'receiver_id'] },
            { t: 'connections', cols: ['user_a', 'user_b'] },
            { t: 'manifests', cols: ['user_id'] },
            { t: 'manifest_likes', cols: ['user_id'] },
            { t: 'daily_matches', cols: ['user_id', 'matched_user_id'] },
            { t: 'user_streaks', cols: ['user_id'] },
            { t: 'user_gamification', cols: ['user_id'] },
            { t: 'quiz_results', cols: ['user_id'] },
            { t: 'posts', cols: ['user_id'] },
            { t: 'comments', cols: ['user_id'] },
            { t: 'reactions', cols: ['user_id'] },
            { t: 'follows', cols: ['follower_id', 'following_id'] },
            { t: 'blocks', cols: ['blocker_id', 'blocked_id'] },
            { t: 'reports', cols: ['reporter_id'] },
            { t: 'ai_usage', cols: ['user_id'] },
            { t: 'xp_events', cols: ['user_id'] },
            { t: 'subscriptions', cols: ['user_id'] },
            { t: 'usage_counters', cols: ['user_id'] },
            { t: 'saved_contacts', cols: ['user_id'] },
            { t: 'compatibility_readings', cols: ['user_id'] },
            { t: 'discovery_profiles', cols: ['user_id'] }
        ];
        for (var i = 0; i < tables.length; i++) {
            var tbl = tables[i];
            for (var j = 0; j < tbl.cols.length; j++) {
                try { await supabase.from(tbl.t).delete().eq(tbl.cols[j], userId); } catch(e) {}
            }
        }
        // Delete avatar from storage
        try {
            var listRes = await supabase.storage.from('avatars').list(userId + '/');
            if (listRes.data && listRes.data.length > 0) {
                var paths = listRes.data.map(function(f) { return userId + '/' + f.name; });
                await supabase.storage.from('avatars').remove(paths);
            }
        } catch(e) {}
        // Delete profile
        await supabase.from('profiles').delete().eq('id', userId);
        // Delete auth user
        await supabase.auth.admin.deleteUser(userId);
        return res.status(200).json({ success: true, message: 'Account and all data deleted' });
    } catch(e) {
        console.error('[AccountDelete] Error:', e.message);
        return res.status(500).json({ error: 'deletion_failed', message: e.message });
    }
}
