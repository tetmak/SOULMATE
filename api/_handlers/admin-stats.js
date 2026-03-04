import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyAuth, requireAdmin } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rate-limit.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
    var authResult = await verifyAuth(req);
    if (!requireAdmin(authResult, res)) return;
    var supabase = getSupabaseAdmin();
    var rl = checkRateLimit('admin-stats:' + authResult.userId, 30, 60);
    if (!rl.allowed) return res.status(429).json({ error: 'rate_limit' });
    var todayStart = new Date(); todayStart.setHours(0,0,0,0);
    var todayISO = todayStart.toISOString();
    try {
        var [totalUsers, activeToday, pendingReports, totalPosts, premiumUsers, aiUsage] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', todayISO),
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('ai_usage').select('tokens_input, tokens_output').gte('created_at', todayISO)
        ]);
        var aiRequests = aiUsage.data ? aiUsage.data.length : 0;
        var aiTokens = 0;
        if (aiUsage.data) aiUsage.data.forEach(function(r) { aiTokens += (r.tokens_input || 0) + (r.tokens_output || 0); });
        return res.status(200).json({
            totalUsers: totalUsers.count || 0,
            activeToday: activeToday.count || 0,
            pendingReports: pendingReports.count || 0,
            totalPosts: totalPosts.count || 0,
            premiumUsers: premiumUsers.count || 0,
            aiUsageToday: { requests: aiRequests, tokensUsed: aiTokens }
        });
    } catch(e) {
        return res.status(500).json({ error: 'stats_failed', message: e.message });
    }
}
