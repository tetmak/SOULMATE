/**
 * NUMERAEL — Connection & Messaging Engine
 * Connection requests, bidirectional connections, 1-to-1 messaging.
 */
(function() {
    'use strict';

    function sb() { return window.supabaseClient; }

    // ═══════════════════════════════════════════════════════
    // CONNECTION REQUESTS
    // ═══════════════════════════════════════════════════════

    /**
     * Helper: get user's display name from discovery_profiles.
     */
    async function getUserName(userId) {
        // 1. discovery_profiles tablosu
        try {
            var res = await sb().from('discovery_profiles')
                .select('full_name')
                .eq('user_id', userId)
                .maybeSingle();
            if (res.data && res.data.full_name) return res.data.full_name;
        } catch(e) {}
        // 2. profiles tablosu (fallback)
        try {
            var profRes = await sb().from('profiles')
                .select('full_name')
                .eq('id', userId)
                .maybeSingle();
            if (profRes.data && profRes.data.full_name) return profRes.data.full_name;
        } catch(e) {}
        return 'User';
    }

    /**
     * Send a connection request from sender to receiver.
     * Returns { success, error?, data? }
     */
    async function sendConnectionRequest(senderId, receiverId) {
        // Check if already connected
        var connected = await areConnected(senderId, receiverId);
        if (connected) return { success: false, error: 'already_connected' };

        // Check if request already exists (either direction)
        try {
            var existing = await sb().from('connection_requests')
                .select('id, status')
                .or('and(sender_id.eq.' + senderId + ',receiver_id.eq.' + receiverId + '),and(sender_id.eq.' + receiverId + ',receiver_id.eq.' + senderId + ')')
                .in('status', ['pending', 'accepted']);

            if (existing.data && existing.data.length > 0) {
                return { success: false, error: 'request_exists' };
            }
        } catch(e) {}

        try {
            var res = await sb().from('connection_requests').insert({
                sender_id: senderId,
                receiver_id: receiverId,
                status: 'pending'
            }).select();

            // Notify receiver
            if (res.data && res.data[0] && window.notificationEngine) {
                var senderName = await getUserName(senderId);
                window.notificationEngine.createNotification(receiverId, 'connection_request', {
                    sender_name: senderName,
                    sender_id: senderId
                });
            }

            return { success: true, data: res.data ? res.data[0] : null };
        } catch(e) {
            return { success: false, error: e.message || 'insert_error' };
        }
    }

    /**
     * Get pending incoming requests for a user.
     * Joins sender profile from discovery_profiles.
     */
    async function getIncomingRequests(userId) {
        try {
            var res = await sb().from('connection_requests')
                .select('*')
                .eq('receiver_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            var requests = res.data || [];
            if (!requests.length) return [];

            // Fetch sender profiles from both tables
            var senderIds = requests.map(function(r) { return r.sender_id; });
            var dpRes = await sb().from('discovery_profiles')
                .select('user_id, full_name, gender, life_path, birth_date, avatar_url')
                .in('user_id', senderIds);

            // Also fetch avatar_url from profiles table (primary source)
            var profRes = await sb().from('profiles')
                .select('id, avatar_url')
                .in('id', senderIds);

            var profAvatarMap = {};
            (profRes.data || []).forEach(function(p) {
                if (p.avatar_url) profAvatarMap[p.id] = p.avatar_url;
            });

            var profileMap = {};
            (dpRes.data || []).forEach(function(p) {
                // profiles tablosundaki avatar_url HER ZAMAN öncelikli (en güncel fotoğraf)
                if (profAvatarMap[p.user_id]) {
                    p.avatar_url = profAvatarMap[p.user_id];
                }
                profileMap[p.user_id] = p;
            });

            // discovery_profiles'da olmayan kullanıcılar için profiles tablosundan fallback
            var missingIds = senderIds.filter(function(id) { return !profileMap[id]; });
            if (missingIds.length > 0) {
                var fallbackRes = await sb().from('profiles')
                    .select('id, full_name, gender, birth_date, avatar_url')
                    .in('id', missingIds);
                (fallbackRes.data || []).forEach(function(p) {
                    profileMap[p.id] = {
                        user_id: p.id,
                        full_name: p.full_name,
                        gender: p.gender,
                        avatar_url: p.avatar_url,
                        life_path: null,
                        birth_date: p.birth_date
                    };
                });
            }

            requests.forEach(function(r) {
                r.sender_profile = profileMap[r.sender_id] || null;
            });

            return requests;
        } catch(e) {
            console.error('[Connection] getIncomingRequests error:', e);
            return [];
        }
    }

    /**
     * Accept a connection request.
     * Updates status to 'accepted' and creates a bidirectional connection.
     */
    async function acceptRequest(requestId, receiverId) {
        try {
            // Get the request
            var reqRes = await sb().from('connection_requests')
                .select('*')
                .eq('id', requestId)
                .eq('receiver_id', receiverId)
                .single();

            if (!reqRes.data) return { success: false, error: 'not_found' };
            var req = reqRes.data;

            // Update status
            await sb().from('connection_requests')
                .update({ status: 'accepted' })
                .eq('id', requestId);

            // Create bidirectional connection (user_a < user_b to prevent duplicates)
            var userA = req.sender_id < req.receiver_id ? req.sender_id : req.receiver_id;
            var userB = req.sender_id < req.receiver_id ? req.receiver_id : req.sender_id;

            await sb().from('connections').upsert({
                user_a: userA,
                user_b: userB
            }, { onConflict: 'user_a,user_b' });

            // Notify the original sender that their request was accepted
            if (window.notificationEngine) {
                var accepterName = await getUserName(receiverId);
                window.notificationEngine.createNotification(req.sender_id, 'connection_accepted', {
                    accepter_name: accepterName,
                    accepter_id: receiverId
                });
            }

            return { success: true };
        } catch(e) {
            console.error('[Connection] acceptRequest error:', e);
            return { success: false, error: e.message || 'error' };
        }
    }

    /**
     * Reject a connection request.
     */
    async function rejectRequest(requestId, receiverId) {
        try {
            await sb().from('connection_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId)
                .eq('receiver_id', receiverId);
            return { success: true };
        } catch(e) {
            return { success: false, error: e.message || 'error' };
        }
    }

    // ═══════════════════════════════════════════════════════
    // CONNECTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Check if two users are connected.
     */
    async function areConnected(userIdA, userIdB) {
        var a = userIdA < userIdB ? userIdA : userIdB;
        var b = userIdA < userIdB ? userIdB : userIdA;
        try {
            var res = await sb().from('connections')
                .select('id')
                .eq('user_a', a)
                .eq('user_b', b)
                .maybeSingle();
            return !!(res.data);
        } catch(e) { return false; }
    }

    /**
     * Check if a pending/accepted request exists between two users.
     */
    async function hasActiveRequest(userIdA, userIdB) {
        try {
            var res = await sb().from('connection_requests')
                .select('id, status, sender_id')
                .or('and(sender_id.eq.' + userIdA + ',receiver_id.eq.' + userIdB + '),and(sender_id.eq.' + userIdB + ',receiver_id.eq.' + userIdA + ')')
                .in('status', ['pending', 'accepted']);
            return (res.data && res.data.length > 0) ? res.data[0] : null;
        } catch(e) { return null; }
    }

    /**
     * Get all connections for a user with profiles.
     */
    async function getConnections(userId) {
        try {
            var res = await sb().from('connections')
                .select('*')
                .or('user_a.eq.' + userId + ',user_b.eq.' + userId)
                .order('created_at', { ascending: false });

            var connections = res.data || [];
            if (!connections.length) return [];

            // Get the other user's IDs
            var otherIds = connections.map(function(c) {
                return c.user_a === userId ? c.user_b : c.user_a;
            });

            // Fetch profiles from both tables
            var dpRes = await sb().from('discovery_profiles')
                .select('user_id, full_name, gender, life_path, birth_date, expression_num, soul_urge, personality_num, avatar_url')
                .in('user_id', otherIds);

            // Also fetch avatar_url from profiles table (primary source for uploaded photos)
            var profRes = await sb().from('profiles')
                .select('id, avatar_url')
                .in('id', otherIds);

            var profAvatarMap = {};
            (profRes.data || []).forEach(function(p) {
                if (p.avatar_url) profAvatarMap[p.id] = p.avatar_url;
            });

            var profileMap = {};
            (dpRes.data || []).forEach(function(p) {
                // profiles tablosundaki avatar_url HER ZAMAN öncelikli (en güncel fotoğraf)
                if (profAvatarMap[p.user_id]) {
                    p.avatar_url = profAvatarMap[p.user_id];
                }
                profileMap[p.user_id] = p;
            });

            // discovery_profiles'da olmayan kullanıcılar için profiles tablosundan tam fallback
            var missingConnIds = otherIds.filter(function(uid) { return !profileMap[uid]; });
            if (missingConnIds.length > 0) {
                var fallbackConnRes = await sb().from('profiles')
                    .select('id, full_name, gender, birth_date, avatar_url')
                    .in('id', missingConnIds);
                (fallbackConnRes.data || []).forEach(function(p) {
                    var disc = window.discovery || {};
                    profileMap[p.id] = {
                        user_id: p.id,
                        full_name: p.full_name,
                        gender: p.gender,
                        avatar_url: p.avatar_url || profAvatarMap[p.id] || null,
                        life_path: (p.birth_date && disc.calcLP) ? disc.calcLP(p.birth_date) : null,
                        birth_date: p.birth_date,
                        expression_num: (p.full_name && disc.calcExp) ? disc.calcExp(p.full_name) : null,
                        soul_urge: (p.full_name && disc.calcSoul) ? disc.calcSoul(p.full_name) : null,
                        personality_num: (p.full_name && disc.calcPers) ? disc.calcPers(p.full_name) : null
                    };
                });
            }

            return connections.map(function(c) {
                var otherId = c.user_a === userId ? c.user_b : c.user_a;
                return {
                    connection_id: c.id,
                    user_id: otherId,
                    profile: profileMap[otherId] || null,
                    created_at: c.created_at
                };
            });
        } catch(e) {
            console.error('[Connection] getConnections error:', e);
            return [];
        }
    }

    // ═══════════════════════════════════════════════════════
    // MESSAGING
    // ═══════════════════════════════════════════════════════

    /**
     * Send a message. Only works if users are connected.
     */
    async function sendMessage(senderId, receiverId, content) {
        if (!content || !content.trim()) return { success: false, error: 'empty' };

        // Verify connection
        var connected = await areConnected(senderId, receiverId);
        if (!connected) return { success: false, error: 'not_connected' };

        try {
            var res = await sb().from('messages').insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: content.trim()
            }).select();

            // Notify receiver of new message
            if (res.data && res.data[0] && window.notificationEngine) {
                var senderName = await getUserName(senderId);
                window.notificationEngine.createNotification(receiverId, 'new_message', {
                    sender_name: senderName,
                    sender_id: senderId
                });
            }

            return { success: true, data: res.data ? res.data[0] : null };
        } catch(e) {
            return { success: false, error: e.message || 'error' };
        }
    }

    /**
     * Get conversation between two users.
     */
    async function getConversation(userIdA, userIdB, limit) {
        try {
            var res = await sb().from('messages')
                .select('*')
                .or(
                    'and(sender_id.eq.' + userIdA + ',receiver_id.eq.' + userIdB + '),' +
                    'and(sender_id.eq.' + userIdB + ',receiver_id.eq.' + userIdA + ')'
                )
                .order('created_at', { ascending: true })
                .limit(limit || 100);
            return res.data || [];
        } catch(e) {
            console.error('[Messaging] getConversation error:', e);
            return [];
        }
    }

    /**
     * Subscribe to new messages in a conversation (real-time).
     * Returns the subscription channel for cleanup.
     */
    function subscribeToMessages(userId, otherUserId, onMessage) {
        var channel = sb().channel('messages-' + userId + '-' + otherUserId)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: 'receiver_id=eq.' + userId
            }, function(payload) {
                var msg = payload.new;
                if (msg && (msg.sender_id === otherUserId)) {
                    onMessage(msg);
                }
            })
            .subscribe();
        return channel;
    }

    /**
     * Subscribe to new incoming connection requests (real-time).
     */
    function subscribeToRequests(userId, onRequest) {
        var channel = sb().channel('conn-requests-' + userId)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'connection_requests',
                filter: 'receiver_id=eq.' + userId
            }, function(payload) {
                onRequest(payload.new);
            })
            .subscribe();
        return channel;
    }

    /**
     * Get count of pending incoming requests.
     */
    async function getPendingRequestCount(userId) {
        try {
            var res = await sb().from('connection_requests')
                .select('id', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('status', 'pending');
            return res.count || 0;
        } catch(e) { return 0; }
    }

    // ═══════════════════════════════════════════════════════
    // GLOBAL EXPORT
    // ═══════════════════════════════════════════════════════

    window.connectionEngine = {
        // Requests
        sendConnectionRequest: sendConnectionRequest,
        getIncomingRequests: getIncomingRequests,
        acceptRequest: acceptRequest,
        rejectRequest: rejectRequest,
        getPendingRequestCount: getPendingRequestCount,
        hasActiveRequest: hasActiveRequest,

        // Connections
        areConnected: areConnected,
        getConnections: getConnections,

        // Messaging
        sendMessage: sendMessage,
        getConversation: getConversation,
        subscribeToMessages: subscribeToMessages,
        subscribeToRequests: subscribeToRequests
    };

})();
