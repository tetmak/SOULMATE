/**
 * Catch-all API router
 * Routes requests to handler modules in _handlers/ directory.
 * Vercel Hobby plan has a 12 serverless function limit.
 * This single catch-all handles 21 endpoints as 1 function.
 * Specific files (openai.js, paddle-webhook.js, etc.) take priority over this catch-all.
 */
import adminContent from './_handlers/admin-content.js';
import adminReports from './_handlers/admin-reports.js';
import adminStats from './_handlers/admin-stats.js';
import adminUsers from './_handlers/admin-users.js';
import accountDelete from './_handlers/account-delete.js';
import accountExport from './_handlers/account-export.js';
import blocks from './_handlers/blocks.js';
import follow from './_handlers/follow.js';
import gamificationLeaderboard from './_handlers/gamification-leaderboard.js';
import gamificationXp from './_handlers/gamification-xp.js';
import messagesReport from './_handlers/messages-report.js';
import messagesSend from './_handlers/messages-send.js';
import notificationsCreate from './_handlers/notifications-create.js';
import postComment from './_handlers/post-comment.js';
import postDetail from './_handlers/post-detail.js';
import postReact from './_handlers/post-react.js';
import postReport from './_handlers/post-report.js';
import posts from './_handlers/posts.js';
import search from './_handlers/search.js';
import subscriptionStatus from './_handlers/subscription-status.js';
import verifySubscription from './_handlers/verify-subscription.js';

var routes = {
    'admin-content': adminContent,
    'admin-reports': adminReports,
    'admin-stats': adminStats,
    'admin-users': adminUsers,
    'account-delete': accountDelete,
    'account-export': accountExport,
    'blocks': blocks,
    'follow': follow,
    'gamification-leaderboard': gamificationLeaderboard,
    'gamification-xp': gamificationXp,
    'messages-report': messagesReport,
    'messages-send': messagesSend,
    'notifications-create': notificationsCreate,
    'post-comment': postComment,
    'post-detail': postDetail,
    'post-react': postReact,
    'post-report': postReport,
    'posts': posts,
    'search': search,
    'subscription-status': subscriptionStatus,
    'verify-subscription': verifySubscription
};

export default async function handler(req, res) {
    // Extract route name from URL path: /api/admin-content?foo=bar → admin-content
    var urlPath = (req.url || '').split('?')[0];
    var routeName = urlPath.replace(/^\/api\//, '').replace(/\/$/, '');

    var fn = routes[routeName];
    if (fn) {
        return fn(req, res);
    }

    return res.status(404).json({ error: 'not_found', path: routeName });
}
