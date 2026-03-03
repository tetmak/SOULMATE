import { getSupabaseAdmin } from './_lib/supabase.js';
import { verifyAuth, requireAuth } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import { validateUUID } from './_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    if (req.method === 'POST') return blockUser(req, res, auth);
    if (req.method === 'DELETE') return unblockUser(req, res, auth);
    if (req.method === 'GET') return getBlocks(req, res, auth);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function blockUser(req, res, auth) {
    const { userId } = req.body || {};
    if (!userId || !validateUUID(userId)) return res.status(400).json({ error: 'invalid_user_id' });
    if (userId === auth.userId) return res.status(400).json({ error: 'cannot_block_self' });

    const supabase = getSupabaseAdmin();

    // Zaten block edilmis mi
    const { data: existing } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocker_id', auth.userId)
        .eq('blocked_id', userId)
        .maybeSingle();

    if (existing) return res.status(409).json({ error: 'already_blocked' });

    // Block ekle
    await supabase.from('blocks').insert({ blocker_id: auth.userId, blocked_id: userId });

    // Follow iliskilerini kaldir
    await supabase.from('follows').delete()
        .eq('follower_id', auth.userId).eq('following_id', userId);
    await supabase.from('follows').delete()
        .eq('follower_id', userId).eq('following_id', auth.userId);

    // Pending connection request'leri reject et
    await supabase.from('connection_requests').update({ status: 'rejected' })
        .or('and(sender_id.eq.' + auth.userId + ',receiver_id.eq.' + userId + '),and(sender_id.eq.' + userId + ',receiver_id.eq.' + auth.userId + ')')
        .eq('status', 'pending');

    return res.status(200).json({ success: true, action: 'blocked' });
}

async function unblockUser(req, res, auth) {
    const { userId } = req.body || {};
    if (!userId || !validateUUID(userId)) return res.status(400).json({ error: 'invalid_user_id' });

    const supabase = getSupabaseAdmin();
    await supabase.from('blocks').delete()
        .eq('blocker_id', auth.userId).eq('blocked_id', userId);

    return res.status(200).json({ success: true, action: 'unblocked' });
}

async function getBlocks(req, res, auth) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
        .from('blocks')
        .select('blocked_id, created_at, profiles!blocks_blocked_id_fkey(full_name, avatar_url)')
        .eq('blocker_id', auth.userId)
        .order('created_at', { ascending: false });

    const blocks = (data || []).map(b => ({
        userId: b.blocked_id,
        name: b.profiles ? b.profiles.full_name : null,
        avatar: b.profiles ? b.profiles.avatar_url : null,
        blockedAt: b.created_at
    }));

    return res.status(200).json({ blocks });
}
