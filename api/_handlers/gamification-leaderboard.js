import { handleCors } from '../_lib/cors.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

/**
 * GET /api/gamification-leaderboard?period=weekly|alltime&limit=<int>
 * Auth: required
 */
export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const userId = authResult.userId;
    const period = req.query.period === 'weekly' ? 'weekly' : 'alltime';
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    const supabase = getSupabaseAdmin();
    const sortCol = period === 'weekly' ? 'weekly_xp' : 'nbp';

    try {
        const { data: top, error: tErr } = await supabase.from('user_gamification')
            .select('user_id, display_name, weekly_xp, nbp, rank_id')
            .order(sortCol, { ascending: false }).limit(limit);
        if (tErr) { console.error('[gamification-leaderboard] Query error:', tErr); return res.status(500).json({ error: 'query_failed' }); }

        const lb = (top || []).map(function(e, i) {
            const r = { rank: i + 1, displayName: e.display_name || 'Explorer', rankId: e.rank_id || 'novice' };
            if (period === 'weekly') r.weeklyXp = e.weekly_xp || 0; else r.nbp = e.nbp || 0;
            return r;
        });

        let ur = null, uil = false;
        for (let i = 0; i < (top || []).length; i++) {
            if (top[i].user_id === userId) {
                ur = { rank: i + 1, displayName: top[i].display_name || 'Explorer', rankId: top[i].rank_id || 'novice' };
                if (period === 'weekly') ur.weeklyXp = top[i].weekly_xp || 0; else ur.nbp = top[i].nbp || 0;
                uil = true; break;
            }
        }

        if (!uil) {
            const { data: ud } = await supabase.from('user_gamification').select('display_name, weekly_xp, nbp, rank_id').eq('user_id', userId).maybeSingle();
            if (ud) {
                const us = period === 'weekly' ? (ud.weekly_xp || 0) : (ud.nbp || 0);
                const { count } = await supabase.from('user_gamification').select('user_id', { count: 'exact', head: true }).gt(sortCol, us);
                ur = { rank: (count || 0) + 1, displayName: ud.display_name || 'Explorer', rankId: ud.rank_id || 'novice' };
                if (period === 'weekly') ur.weeklyXp = ud.weekly_xp || 0; else ur.nbp = ud.nbp || 0;
            }
        }

        return res.status(200).json({ success: true, period, leaderboard: lb, userRank: ur });
    } catch (e) {
        console.error('[gamification-leaderboard] Error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
}
