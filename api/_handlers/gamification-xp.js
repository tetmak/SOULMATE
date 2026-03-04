import { handleCors } from '../_lib/cors.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { validateEnum } from '../_lib/validate.js';

const XP_AMOUNTS = { app_open: 5, daily_reading: 10, compatibility: 20, add_connection: 25, cosmic_match_view: 10, streak_day: 15, quest_complete: 30, all_quests_bonus: 100, share_card: 20, reveal_match: 15, manifest_set: 10, wheel_spin: 10 };
const ALLOWED_ACTIONS = Object.keys(XP_AMOUNTS);
const DAILY_LIMITED = ['app_open'];
const RANK_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 3500];
const RANK_NAMES = ['novice', 'student', 'warrior', 'guide', 'master', 'sage', 'oracle'];

function getRankId(nbp) {
    let rid = 0;
    for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) { if (nbp >= RANK_THRESHOLDS[i]) { rid = i; break; } }
    return rid;
}

/**
 * POST /api/gamification-xp
 * Auth: required
 * Body: { action: string }
 */
export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const userId = authResult.userId;
    const { action } = req.body || {};
    if (!action || !validateEnum(action, ALLOWED_ACTIONS)) return res.status(400).json({ error: 'invalid_action', allowed: ALLOWED_ACTIONS });

    const rl = checkRateLimit('xp:' + userId, 60, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limit' });

    const xpAmount = XP_AMOUNTS[action];
    const supabase = getSupabaseAdmin();

    try {
        if (DAILY_LIMITED.includes(action)) {
            const ts = new Date(); ts.setHours(0, 0, 0, 0);
            const { data: ex } = await supabase.from('xp_events').select('id').eq('user_id', userId).eq('action', action).gte('created_at', ts.toISOString()).maybeSingle();
            if (ex) {
                const { data: cg } = await supabase.from('user_gamification').select('total_xp, nbp').eq('user_id', userId).maybeSingle();
                const tx = (cg && cg.total_xp) || 0, nb = (cg && cg.nbp) || 0;
                return res.status(200).json({ success: true, xpAwarded: 0, totalXp: tx, nbp: nb, rankId: getRankId(nb), deduplicated: true });
            }
        }

        await supabase.from('xp_events').insert({ user_id: userId, action: action, xp_amount: xpAmount }).then(() => {}).catch(e => console.warn('[gamification-xp] xp_events insert error:', e));

        const { data: gd } = await supabase.from('user_gamification').select('total_xp, nbp, weekly_xp').eq('user_id', userId).maybeSingle();
        const ctx = (gd && gd.total_xp) || 0, cwx = (gd && gd.weekly_xp) || 0;
        const ntx = ctx + xpAmount, nnbp = Math.round(ntx * 0.7), nwx = cwx + xpAmount, nrid = getRankId(nnbp);

        const now = new Date(), day = now.getDay(), diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const ws = new Date(new Date(now).setDate(diff)).toISOString().slice(0, 10);

        const { error: ue } = await supabase.from('user_gamification').upsert({
            user_id: userId, total_xp: ntx, nbp: nnbp, weekly_xp: nwx,
            rank_id: RANK_NAMES[nrid] || 'novice', week_start: ws, updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (ue) { console.error('[gamification-xp] Upsert error:', ue); return res.status(500).json({ error: 'update_failed' }); }

        return res.status(200).json({ success: true, xpAwarded: xpAmount, totalXp: ntx, nbp: nnbp, rankId: nrid });
    } catch (e) {
        console.error('[gamification-xp] Error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
}
