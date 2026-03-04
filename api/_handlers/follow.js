import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { validateUUID } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    if (req.method === 'POST') return followUser(req, res, auth);
    if (req.method === 'DELETE') return unfollowUser(req, res, auth);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function followUser(req, res, auth) {
    const rl = checkRateLimit('follow:' + auth.userId, 30, 3600);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const { userId } = req.body || {};
    if (!userId || !validateUUID(userId)) return res.status(400).json({ error: 'invalid_user_id' });
    if (userId === auth.userId) return res.status(400).json({ error: 'cannot_follow_self' });

    const supabase = getSupabaseAdmin();

    // Block kontrolu
    const { data: blocked } = await supabase
        .from('blocks')
        .select('blocker_id')
        .or('and(blocker_id.eq.' + auth.userId + ',blocked_id.eq.' + userId + '),and(blocker_id.eq.' + userId + ',blocked_id.eq.' + auth.userId + ')')
        .limit(1);

    if (blocked && blocked.length > 0) return res.status(403).json({ error: 'blocked' });

    // Zaten follow ediyor mu
    const { data: existing } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', auth.userId)
        .eq('following_id', userId)
        .maybeSingle();

    if (existing) return res.status(409).json({ error: 'already_following' });

    const { error } = await supabase.from('follows').insert({
        follower_id: auth.userId,
        following_id: userId
    });

    if (error) return res.status(500).json({ error: 'follow_failed' });
    return res.status(200).json({ success: true, action: 'followed' });
}

async function unfollowUser(req, res, auth) {
    const { userId } = req.body || {};
    if (!userId || !validateUUID(userId)) return res.status(400).json({ error: 'invalid_user_id' });

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', auth.userId)
        .eq('following_id', userId);

    if (error) return res.status(500).json({ error: 'unfollow_failed' });
    return res.status(200).json({ success: true, action: 'unfollowed' });
}
