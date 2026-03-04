import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { validateUUID } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    const postId = req.query.id;
    if (!postId || !validateUUID(postId)) {
        return res.status(400).json({ error: 'invalid_post_id' });
    }

    if (req.method === 'GET') return getPostDetail(req, res, auth, postId);
    if (req.method === 'DELETE') return deletePost(req, res, auth, postId);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function getPostDetail(req, res, auth, postId) {
    const supabase = getSupabaseAdmin();

    const { data: post, error } = await supabase
        .from('posts')
        .select('id, user_id, content, type, visibility, like_count, comment_count, is_hidden, created_at, profiles(full_name, avatar_url)')
        .eq('id', postId)
        .single();

    if (error || !post) return res.status(404).json({ error: 'post_not_found' });
    if (post.is_hidden && post.user_id !== auth.userId) return res.status(404).json({ error: 'post_not_found' });

    // Comments
    const { data: comments } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at, profiles(full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);

    // Reactions summary
    const { data: reactions } = await supabase
        .from('reactions')
        .select('id, user_id, type')
        .eq('post_id', postId);

    // User's own reaction
    const userReaction = (reactions || []).find(r => r.user_id === auth.userId);

    return res.status(200).json({
        post: {
            id: post.id,
            userId: post.user_id,
            content: post.content,
            type: post.type,
            visibility: post.visibility,
            likeCount: post.like_count,
            commentCount: post.comment_count,
            createdAt: post.created_at,
            authorName: post.profiles ? post.profiles.full_name : null,
            authorAvatar: post.profiles ? post.profiles.avatar_url : null
        },
        comments: (comments || []).map(c => ({
            id: c.id,
            userId: c.user_id,
            content: c.content,
            createdAt: c.created_at,
            authorName: c.profiles ? c.profiles.full_name : null,
            authorAvatar: c.profiles ? c.profiles.avatar_url : null
        })),
        reactions: (reactions || []).map(r => ({ userId: r.user_id, type: r.type })),
        userReaction: userReaction ? userReaction.type : null
    });
}

async function deletePost(req, res, auth, postId) {
    const supabase = getSupabaseAdmin();

    const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (!post) return res.status(404).json({ error: 'post_not_found' });
    if (post.user_id !== auth.userId && auth.role !== 'admin') {
        return res.status(403).json({ error: 'not_owner' });
    }

    await supabase.from('comments').delete().eq('post_id', postId);
    await supabase.from('reactions').delete().eq('post_id', postId);
    await supabase.from('posts').delete().eq('id', postId);

    return res.status(200).json({ success: true });
}
