import { getSupabaseAdmin } from './_lib/supabase.js';
import { verifyAuth, requireAdmin } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { validateUUID, validateEnum, sanitizeText } from './_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    var authResult = await verifyAuth(req);
    if (\!requireAdmin(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var rl = checkRateLimit('admin-users:' + authResult.userId, 60, 60);
    if (\!rl.allowed) return res.status(429).json({ error: 'rate_limit' });
    if (req.method === 'GET') return handleGet(req, res, supabase);
    if (req.method === 'POST') return handlePost(req, res, supabase, authResult);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleGet(req, res, supabase) {
    var url = new URL(req.url, 'http://localhost');
    var userId = url.searchParams.get('id');
    var query = url.searchParams.get('q');
    var limit = parseInt(url.searchParams.get('limit') || '20', 10);
    if (limit > 50) limit = 50;
    if (userId && validateUUID(userId)) {
        var profileRes = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileRes.error || \!profileRes.data) return res.status(404).json({ error: 'user_not_found' });
        var p = profileRes.data;
        var postCount = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId);
        var reportCount = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('target_id', userId).eq('target_type', 'user');
        return res.status(200).json({ user: { id: p.id, fullName: p.full_name, role: p.role || 'user',
            isSuspended: p.is_suspended || false, suspendedAt: p.suspended_at, suspensionReason: p.suspension_reason,
            gender: p.gender, createdAt: p.created_at, avatarUrl: p.avatar_url,
            postCount: (postCount.count || 0), reportCount: (reportCount.count || 0) } });
    }
    if (query && query.trim()) {
        var searchRes = await supabase.from('profiles').select('id, full_name, role, is_suspended, created_at, avatar_url')
            .ilike('full_name', '%' + query.trim() + '%').limit(limit);
        return res.status(200).json({ users: (searchRes.data || []).map(function(p) {
            return { id: p.id, fullName: p.full_name, role: p.role || 'user',
                isSuspended: p.is_suspended || false, createdAt: p.created_at, avatarUrl: p.avatar_url };
        }) });
    }
    var allRes = await supabase.from('profiles').select('id, full_name, role, is_suspended, created_at, avatar_url')
        .order('created_at', { ascending: false }).limit(limit);
    return res.status(200).json({ users: (allRes.data || []).map(function(p) {
        return { id: p.id, fullName: p.full_name, role: p.role || 'user',
            isSuspended: p.is_suspended || false, createdAt: p.created_at, avatarUrl: p.avatar_url };
    }) });
}

async function handlePost(req, res, supabase, authResult) {
    var body = req.body || {};
    if (\!body.userId || \!validateUUID(body.userId)) return res.status(400).json({ error: 'invalid_user_id' });
    if (\!validateEnum(body.action, ['ban', 'unban', 'shadowban', 'set_role'])) return res.status(400).json({ error: 'invalid_action' });
    var sanitizedReason = body.reason ? sanitizeText(body.reason, 500) : null;
    if (body.action === 'ban') {
        await supabase.from('profiles').update({ is_suspended: true, suspended_at: new Date().toISOString(),
            suspension_reason: sanitizedReason || 'Banned by admin' }).eq('id', body.userId);
        return res.status(200).json({ success: true });
    }
    if (body.action === 'unban') {
        await supabase.from('profiles').update({ is_suspended: false, suspended_at: null, suspension_reason: null }).eq('id', body.userId);
        return res.status(200).json({ success: true });
    }
    if (body.action === 'shadowban') {
        await supabase.from('profiles').update({ is_suspended: true, suspended_at: new Date().toISOString(),
            suspension_reason: sanitizedReason || 'Shadowbanned by admin' }).eq('id', body.userId);
        return res.status(200).json({ success: true });
    }
    if (body.action === 'set_role') {
        if (authResult.role \!== 'admin') return res.status(403).json({ error: 'only_admin_can_set_role' });
        if (\!validateEnum(body.role, ['user', 'admin', 'moderator'])) return res.status(400).json({ error: 'invalid_role' });
        await supabase.from('profiles').update({ role: body.role }).eq('id', body.userId);
        return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'unknown_action' });
}
