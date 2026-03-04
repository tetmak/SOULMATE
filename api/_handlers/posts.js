import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAuth } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { sanitizeText, validateEnum, validatePagination } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const auth = await verifyAuth(req);
    if (!requireAuth(auth, res)) return;

    if (req.method === 'POST') return createPost(req, res, auth);
    if (req.method === 'GET') return getFeed(req, res, auth);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function createPost(req, res, auth) {
    const rl = checkRateLimit('post_create:' + auth.userId, 10, 3600);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limited', retryAfter: rl.resetAt });

    const { content, type, visibility } = req.body || {};
    const cleanContent = sanitizeText(content, 2000);
    if (!cleanContent) return res.status(400).json({ error: 'content_required' });

    const postType = validateEnum(type, ['post', 'manifest', 'insight', 'milestone', 'question']) ? type : 'post';
    const vis = validateEnum(visibility, ['public', 'followers', 'connections', 'private']) ? visibility : 'public';

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('posts')
        .insert({
            user_id: auth.userId,
            content: cleanContent,
            type: postType,
            visibility: vis
        })
        .select('id, user_id, content, type, visibility, like_count, comment_count, created_at')
        .single();

    if (error) return res.status(500).json({ error: 'create_failed', detail: error.message });
    return res.status(201).json({ success: true, post: data });
}

async function getFeed(req, res, auth) {
    const { cursor, limit } = validatePagination(req.query.cursor, req.query.limit, 50);
    const sort = req.query.sort === 'newest' ? 'newest' : 'trending';
    const typeFilter = req.query.type;

    const supabase = getSupabaseAdmin();

    // Blocked users listesi
    const { data: blockedRows } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', auth.userId);
    const blockedIds = (blockedRows || []).map(r => r.blocked_id);

    // Also get users who blocked us
    const { data: blockedByRows } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', auth.userId);
    const blockedByIds = (blockedByRows || []).map(r => r.blocker_id);
    const allBlocked = [...new Set([...blockedIds, ...blockedByIds])];

    // Followed users
    const { data: followRows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', auth.userId);
    const followedIds = (followRows || []).map(r => r.following_id);

    // Build query
    let query = supabase
        .from('posts')
        .select(`
            id, user_id, content, type, visibility, like_count, comment_count, is_hidden, created_at,
            profiles!inner(full_name, avatar_url)
        `)
        .eq('is_hidden', false);

    // Type filter
    if (typeFilter && validateEnum(typeFilter, ['post', 'manifest', 'insight', 'milestone', 'question'])) {
        query = query.eq('type', typeFilter);
    }

    // Exclude blocked users
    if (allBlocked.length > 0) {
        query = query.not('user_id', 'in', '(' + allBlocked.join(',') + ')');
    }

    if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
        if (cursor) {
            // Cursor = created_at of last item
            query = query.lt('created_at', cursor);
        }
        query = query.limit(limit);
    } else {
        // Trending: get more items, sort in memory
        query = query.order('created_at', { ascending: false }).limit(200);
    }

    const { data: posts, error } = await query;
    if (error) return res.status(500).json({ error: 'feed_failed', detail: error.message });

    let result = (posts || []).map(p => {
        const hoursAge = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
        const freshness = 1 / (hoursAge + 2);
        const followBonus = followedIds.includes(p.user_id) ? 10 : 0;
        const score = (p.like_count * 3) + (p.comment_count * 5) + (freshness * 100) + followBonus;

        return {
            id: p.id,
            userId: p.user_id,
            content: p.content,
            type: p.type,
            visibility: p.visibility,
            likeCount: p.like_count,
            commentCount: p.comment_count,
            createdAt: p.created_at,
            authorName: p.profiles ? p.profiles.full_name : null,
            authorAvatar: p.profiles ? p.profiles.avatar_url : null,
            isFollowed: followedIds.includes(p.user_id),
            score: sort === 'trending' ? score : undefined
        };
    });

    if (sort === 'trending') {
        result.sort((a, b) => b.score - a.score);
        // Apply cursor (cursor = last post id)
        if (cursor) {
            const idx = result.findIndex(p => p.id === cursor);
            if (idx >= 0) result = result.slice(idx + 1);
        }
        result = result.slice(0, limit);
    }

    const nextCursor = result.length === limit
        ? (sort === 'newest' ? result[result.length - 1].createdAt : result[result.length - 1].id)
        : null;

    return res.status(200).json({ posts: result, nextCursor });
}
