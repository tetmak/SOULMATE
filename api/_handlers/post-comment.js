import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { sanitizeText, validateUUID, validatePagination } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    if (req.method === 'GET') return getComments(req, res, auth);
    if (req.method === 'POST') return addComment(req, res, auth);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function getComments(req, res, auth) {
    const postId = req.query.postId;
    if (!postId || !validateUUID(postId)) return res.status(400).json({ error: 'invalid_post_id' });

    const { cursor, limit } = validatePagination(req.query.cursor, req.query.limit, 50);
    const supabase = getSupabaseAdmin();

    let query = supabase
        .from('comments')
        .select('id, user_id, content, created_at, profiles(full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (cursor) {
        query = query.gt('created_at', cursor);
    }

    const { data: comments, error } = await query;
    if (error) return res.status(500).json({ error: 'fetch_failed' });

    const result = (comments || []).map(c => ({
        id: c.id,
        userId: c.user_id,
        content: c.content,
        createdAt: c.created_at,
        authorName: c.profiles ? c.profiles.full_name : null,
        authorAvatar: c.profiles ? c.profiles.avatar_url : null
    }));

    const nextCursor = result.length === limit ? result[result.length - 1].createdAt : null;
    return res.status(200).json({ comments: result, nextCursor });
}

async function addComment(req, res, auth) {
    const rl = checkRateLimit('comment:' + auth.userId, 20, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const { postId, content } = req.body || {};
    if (!postId || !validateUUID(postId)) return res.status(400).json({ error: 'invalid_post_id' });

    const cleanContent = sanitizeText(content, 500);
    if (!cleanContent) return res.status(400).json({ error: 'content_required' });

    const supabase = getSupabaseAdmin();

    // Post var mi
    const { data: post } = await supabase
        .from('posts')
        .select('id, comment_count')
        .eq('id', postId)
        .eq('is_hidden', false)
        .single();

    if (!post) return res.status(404).json({ error: 'post_not_found' });

    // Yorum ekle
    const { data: comment, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: auth.userId,
            content: cleanContent
        })
        .select('id, user_id, content, created_at')
        .single();

    if (error) return res.status(500).json({ error: 'create_failed' });

    // comment_count guncelle
    await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', postId);

    // Author bilgisi
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', auth.userId)
        .single();

    return res.status(201).json({
        success: true,
        comment: {
            id: comment.id,
            userId: comment.user_id,
            content: comment.content,
            createdAt: comment.created_at,
            authorName: profile ? profile.full_name : null,
            authorAvatar: profile ? profile.avatar_url : null
        }
    });
}
