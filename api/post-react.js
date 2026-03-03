import { getSupabaseAdmin } from './_lib/supabase.js';
import { verifyAuth, requireAuth } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { validateUUID, validateEnum } from './_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    const rl = checkRateLimit('react:' + auth.userId, 60, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const { postId, type } = req.body || {};
    if (!postId || !validateUUID(postId)) return res.status(400).json({ error: 'invalid_post_id' });

    const reactionType = validateEnum(type, ['like', 'love', 'energy', 'cosmic', 'insight']) ? type : 'like';

    const supabase = getSupabaseAdmin();

    // Post var mi kontrol
    const { data: post } = await supabase
        .from('posts')
        .select('id, like_count')
        .eq('id', postId)
        .eq('is_hidden', false)
        .single();

    if (!post) return res.status(404).json({ error: 'post_not_found' });

    // Mevcut reaction kontrol
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, type')
        .eq('post_id', postId)
        .eq('user_id', auth.userId)
        .maybeSingle();

    let action;
    let newCount = post.like_count;

    if (existing) {
        // Reaction kaldir
        await supabase.from('reactions').delete().eq('id', existing.id);
        newCount = Math.max(0, newCount - 1);
        action = 'removed';
    } else {
        // Reaction ekle
        await supabase.from('reactions').insert({
            post_id: postId,
            user_id: auth.userId,
            type: reactionType
        });
        newCount = newCount + 1;
        action = 'added';
    }

    // Post like_count guncelle
    await supabase.from('posts').update({ like_count: newCount }).eq('id', postId);

    return res.status(200).json({ success: true, action, newCount });
}
