import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAdmin } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';
import { validateUUID, validateEnum, validatePagination, sanitizeText } from '../_lib/validate.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    var authResult = await verifyAuth(req);
    if (\!requireAdmin(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var rl = checkRateLimit('admin-reports:' + authResult.userId, 60, 60);
    if (\!rl.allowed) return res.status(429).json({ error: 'rate_limit' });
    if (req.method === 'GET') return handleGet(req, res, supabase);
    if (req.method === 'POST') return handlePost(req, res, supabase, authResult);
    return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleGet(req, res, supabase) {
    var url = new URL(req.url, 'http://localhost');
    var status = url.searchParams.get('status') || 'pending';
    var pag = validatePagination(url.searchParams.get('cursor'), url.searchParams.get('limit'), 50);
    if (\!validateEnum(status, ['pending', 'reviewed', 'actioned', 'dismissed'])) {
        return res.status(400).json({ error: 'invalid_status' });
    }
    var query = supabase.from('reports')
        .select('id, reporter_id, target_type, target_id, reason, description, status, reviewed_by, created_at')
        .eq('status', status).order('created_at', { ascending: false }).limit(pag.limit + 1);
    if (pag.cursor) {
        var cursorRes = await supabase.from('reports').select('created_at').eq('id', pag.cursor).single();
        if (cursorRes.data) query = query.lt('created_at', cursorRes.data.created_at);
    }
    var result = await query;
    if (result.error) return res.status(500).json({ error: 'query_failed' });
    var reports = result.data || [];
    var nextCursor = null;
    if (reports.length > pag.limit) { reports.pop(); nextCursor = reports[reports.length - 1].id; }
    var enriched = await Promise.all(reports.map(async function(r) {
        var reporterName = 'Unknown';
        if (r.reporter_id) {
            var profRes = await supabase.from('profiles').select('full_name').eq('id', r.reporter_id).single();
            if (profRes.data && profRes.data.full_name) reporterName = profRes.data.full_name;
        }
        var targetContent = null;
        if (r.target_type === 'post' && r.target_id) {
            var p = await supabase.from('posts').select('id, user_id, content, type, is_hidden, created_at').eq('id', r.target_id).single();
            if (p.data) targetContent = p.data;
        } else if (r.target_type === 'user' && r.target_id) {
            var u = await supabase.from('profiles').select('id, full_name, is_suspended, role, created_at').eq('id', r.target_id).single();
            if (u.data) targetContent = u.data;
        } else if (r.target_type === 'message' && r.target_id) {
            var m = await supabase.from('messages').select('id, sender_id, receiver_id, content, created_at').eq('id', r.target_id).single();
            if (m.data) targetContent = m.data;
        }
        return { id: r.id, reporter: { id: r.reporter_id, name: reporterName }, targetType: r.target_type,
            targetId: r.target_id, targetContent: targetContent, reason: r.reason, description: r.description,
            status: r.status, reviewedBy: r.reviewed_by, createdAt: r.created_at };
    }));
    return res.status(200).json({ reports: enriched, nextCursor: nextCursor });
}

async function handlePost(req, res, supabase, authResult) {
    var body = req.body || {};
    if (\!body.reportId || \!validateUUID(body.reportId)) return res.status(400).json({ error: 'invalid_report_id' });
    if (\!validateEnum(body.action, ['dismiss', 'action'])) return res.status(400).json({ error: 'invalid_action' });
    var sanitizedNote = body.note ? sanitizeText(body.note, 500) : null;
    var rr = await supabase.from('reports').select('*').eq('id', body.reportId).single();
    if (rr.error || \!rr.data) return res.status(404).json({ error: 'report_not_found' });
    var report = rr.data;
    if (body.action === 'dismiss') {
        await supabase.from('reports').update({ status: 'dismissed', reviewed_by: authResult.userId }).eq('id', body.reportId);
        return res.status(200).json({ success: true });
    }
    await supabase.from('reports').update({ status: 'actioned', reviewed_by: authResult.userId }).eq('id', body.reportId);
    if (report.target_type === 'post' && report.target_id) {
        await supabase.from('posts').update({ is_hidden: true }).eq('id', report.target_id);
    } else if (report.target_type === 'user' && report.target_id) {
        await supabase.from('profiles').update({ is_suspended: true, suspended_at: new Date().toISOString(),
            suspension_reason: sanitizedNote || 'Reported and actioned by admin' }).eq('id', report.target_id);
    } else if (report.target_type === 'message' && report.target_id) {
        await supabase.from('messages').delete().eq('id', report.target_id);
    }
    return res.status(200).json({ success: true });
}
