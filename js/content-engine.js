/**
 * SOULMATE Content Engine
 * Post CRUD, feed, reactions, comments, follow, block, search, report
 */
(function() {
    'use strict';

    var API_BASE = window.__NUMERAEL_API_BASE || '';

    async function _headers() {
        var h = { 'Content-Type': 'application/json' };
        try {
            var session = await window.auth.getSession();
            if (session && session.access_token) {
                h['Authorization'] = 'Bearer ' + session.access_token;
            }
        } catch(e) {}
        return h;
    }

    async function _get(url) {
        var h = await _headers();
        var res = await fetch(API_BASE + url, { method: 'GET', headers: h });
        return await res.json();
    }

    async function _post(url, body) {
        var h = await _headers();
        var res = await fetch(API_BASE + url, { method: 'POST', headers: h, body: JSON.stringify(body) });
        return await res.json();
    }

    async function _del(url, body) {
        var h = await _headers();
        var res = await fetch(API_BASE + url, { method: 'DELETE', headers: h, body: body ? JSON.stringify(body) : undefined });
        return await res.json();
    }

    var contentEngine = {
        // ─── Feed ───────────────────────────────────────
        loadFeed: async function(options) {
            options = options || {};
            var params = [];
            if (options.cursor) params.push('cursor=' + encodeURIComponent(options.cursor));
            if (options.limit) params.push('limit=' + options.limit);
            if (options.type) params.push('type=' + encodeURIComponent(options.type));
            if (options.sort) params.push('sort=' + encodeURIComponent(options.sort));
            var qs = params.length > 0 ? '?' + params.join('&') : '';
            return await _get('/api/posts' + qs);
        },

        // ─── Post CRUD ─────────────────────────────────
        createPost: async function(content, type, visibility) {
            return await _post('/api/posts', {
                content: content,
                type: type || 'post',
                visibility: visibility || 'public'
            });
        },

        getPost: async function(postId) {
            return await _get('/api/post-detail?id=' + encodeURIComponent(postId));
        },

        deletePost: async function(postId) {
            return await _del('/api/post-detail?id=' + encodeURIComponent(postId));
        },

        // ─── Reactions ─────────────────────────────────
        toggleReaction: async function(postId, type) {
            return await _post('/api/post-react', {
                postId: postId,
                type: type || 'like'
            });
        },

        // ─── Comments ──────────────────────────────────
        getComments: async function(postId, cursor, limit) {
            var params = ['postId=' + encodeURIComponent(postId)];
            if (cursor) params.push('cursor=' + encodeURIComponent(cursor));
            if (limit) params.push('limit=' + limit);
            return await _get('/api/post-comment?' + params.join('&'));
        },

        addComment: async function(postId, content) {
            return await _post('/api/post-comment', {
                postId: postId,
                content: content
            });
        },

        // ─── Follow ────────────────────────────────────
        follow: async function(userId) {
            return await _post('/api/follow', { userId: userId });
        },

        unfollow: async function(userId) {
            return await _del('/api/follow', { userId: userId });
        },

        // ─── Block ─────────────────────────────────────
        block: async function(userId) {
            return await _post('/api/blocks', { userId: userId });
        },

        unblock: async function(userId) {
            return await _del('/api/blocks', { userId: userId });
        },

        getBlocks: async function() {
            return await _get('/api/blocks');
        },

        // ─── Search ────────────────────────────────────
        searchUsers: async function(query, limit) {
            var params = ['type=users', 'q=' + encodeURIComponent(query)];
            if (limit) params.push('limit=' + limit);
            return await _get('/api/search?' + params.join('&'));
        },

        searchPosts: async function(query, cursor, limit) {
            var params = ['type=posts', 'q=' + encodeURIComponent(query)];
            if (cursor) params.push('cursor=' + encodeURIComponent(cursor));
            if (limit) params.push('limit=' + limit);
            return await _get('/api/search?' + params.join('&'));
        },

        // ─── Report ────────────────────────────────────
        report: async function(targetType, targetId, reason, description) {
            return await _post('/api/post-report', {
                targetType: targetType,
                targetId: targetId,
                reason: reason,
                description: description || null
            });
        }
    };

    window.contentEngine = contentEngine;
})();
