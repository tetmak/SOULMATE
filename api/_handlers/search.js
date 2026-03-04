import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { sanitizeText, validatePagination } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    const rl = checkRateLimit('search:' + auth.userId, 30, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited' });

    const type = req.query.type;
    const q = sanitizeText(req.query.q, 100);
    if (!q || q.length < 2) return res.status(400).json({ error: 'query_too_short' });

    if (type === 'users') return searchUsers(req, res, auth, q);
    if (type === 'posts') return searchPosts(req, res, auth, q);
    return res.status(400).json({ error: 'invalid_type' });
}

async function searchUsers(req, res, auth, q) {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const supabase = getSupabaseAdmin();

    // Blocked users
    const { data: blockedRows } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', auth.userId);
    const blockedIds = (blockedRows || []).map(r => r.blocked_id);

    let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .ilike('full_name', '%' + q + '%')
        .eq('is_suspended', false)
        .limit(limit);

    if (blockedIds.length > 0) {
        query = query.not('id', 'in', '(' + blockedIds.join(',') + ')');
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'search_failed' });

    const results = (data || []).map(u => ({
        id: u.id,
        name: u.full_name,
        avatar: u.avatar_url
    }));

    return res.status(200).json({ results });
}

async function searchPosts(req, res, auth, q) {
    const { cursor, limit } = validatePagination(req.query.cursor, req.query.limit, 30);
    const supabase = getSupabaseAdmin();

    // Blocked users
    const { data: blockedRows } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', auth.userId);
    const blockedIds = (blockedRows || []).map(r => r.blocked_id);

    let query = supabase
        .from('posts')
        .select('id, user_id, content, type, like_count, comment_count, created_at, profiles(full_name, avatar_url)')
        .ilike('content', '%' + q + '%')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (blockedIds.length > 0) {
        query = query.not('user_id', 'in', '(' + blockedIds.join(',') + ')');
    }

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'search_failed' });

    const results = (data || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        content: p.content,
        type: p.type,
        likeCount: p.like_count,
        commentCount: p.comment_count,
        createdAt: p.created_at,
        authorName: p.profiles ? p.profiles.full_name : null,
        authorAvatar: p.profiles ? p.profiles.avatar_url : null
    }));

    const nextCursor = results.length === limit ? results[results.length - 1].createdAt : null;
    return res.status(200).json({ results, nextCursor });
}
