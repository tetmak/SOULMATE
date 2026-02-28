/**
 * NUMERAEL — In-App Notification Engine
 * Real-time notifications with bell icon + panel UI.
 * Auto-injects bell into page header or as floating element.
 * Usage: <script src="js/notification-engine.js"></script> (after auth.js, supabase-config.js)
 */
(function() {
    'use strict';

    function sb() { return window.supabaseClient; }

    // ═══════════════════════════════════════════════════════
    // NOTIFICATION CREATION — Available on ALL pages
    // (connection-engine.js calls this from cosmic_match, messaging, etc.)
    // ═══════════════════════════════════════════════════════

    async function createNotification(targetUserId, type, payload) {
        try {
            await sb().from('notifications').insert({
                user_id: targetUserId,
                type: type,
                payload: payload || {}
            });
        } catch(e) {
            console.warn('[Notif] Create error:', e);
        }
    }

    // Export immediately so createNotification is available on ALL pages
    window.notificationEngine = {
        createNotification: createNotification
    };

    // ─── Bell UI + Panel only on allowed pages ───────────
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var ALLOWED = ['mystic_numerology_home_1.html', 'connections_shared_readings.html'];
    if (ALLOWED.indexOf(currentPage) === -1) return;

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (only on ALLOWED pages)
    // ═══════════════════════════════════════════════════════

    var _userId = null;
    var _channel = null;
    var _notifications = [];
    var _panelOpen = false;
    var _notifCallbacks = [];

    // ═══════════════════════════════════════════════════════
    // NOTIFICATION TEXTS & ACTIONS
    // ═══════════════════════════════════════════════════════

    var NOTIF_TEXT = {
        'connection_request': 'Yeni bağlantı isteği',
        'connection_accepted': 'Bağlantı isteğiniz kabul edildi',
        'new_message': 'Yeni mesaj',
        'limit_hit': 'Devam etmek için Premium gerekli'
    };

    var NOTIF_ICON = {
        'connection_request': 'person_add',
        'connection_accepted': 'how_to_reg',
        'new_message': 'chat',
        'limit_hit': 'workspace_premium'
    };

    function getClickAction(notif) {
        var p = notif.payload || {};
        switch (notif.type) {
            case 'connection_request':
                return 'profile_soul_journey.html';
            case 'connection_accepted':
                return 'connections_shared_readings.html';
            case 'new_message':
                return p.sender_id ? 'messaging.html?uid=' + encodeURIComponent(p.sender_id) : 'connections_shared_readings.html';
            case 'limit_hit':
                return '__paywall__';
            default:
                return null;
        }
    }

    // ═══════════════════════════════════════════════════════
    // CSS
    // ═══════════════════════════════════════════════════════

    var style = document.createElement('style');
    style.id = 'numerael-notif-style';
    style.textContent = [
        '#numerael-notif-bell{position:fixed;top:16px;right:16px;z-index:900;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;color:#fff;transition:background 0.2s}',
        '#numerael-notif-bell:hover{background:rgba(255,255,255,0.1)}',
        '#numerael-notif-bell .material-symbols-outlined{font-size:22px}',
        '#numerael-notif-badge{position:absolute;top:2px;right:2px;min-width:16px;height:16px;border-radius:8px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 4px;font-family:"Space Grotesk",sans-serif;line-height:1}',
        '#numerael-notif-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:950}',
        '#numerael-notif-panel{display:none;position:fixed;top:0;right:0;width:min(340px,90vw);height:100vh;background:#1a1810;border-left:1px solid rgba(255,255,255,0.06);z-index:960;flex-direction:column;overflow:hidden;font-family:"Space Grotesk",sans-serif}',
        '#numerael-notif-panel.open{display:flex}',
        '#numerael-notif-overlay.open{display:block}',
        '.notif-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0}',
        '.notif-header h3{color:#fff;font-size:16px;font-weight:700;margin:0}',
        '.notif-header button{background:none;border:none;color:rgba(255,255,255,0.35);font-size:12px;font-weight:600;cursor:pointer;font-family:"Space Grotesk",sans-serif;padding:6px 12px;border-radius:8px;transition:background 0.15s}',
        '.notif-header button:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6)}',
        '.notif-list{flex:1;overflow-y:auto;padding:8px 0}',
        '.notif-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.2);font-size:13px}',
        '.notif-item{display:flex;align-items:flex-start;gap:12px;padding:14px 20px;cursor:pointer;transition:background 0.15s;border-bottom:1px solid rgba(255,255,255,0.03)}',
        '.notif-item:hover{background:rgba(255,255,255,0.03)}',
        '.notif-item.unread{background:rgba(139,92,246,0.04)}',
        '.notif-item .notif-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(139,92,246,0.12)}',
        '.notif-item .notif-icon .material-symbols-outlined{font-size:18px;color:#8b5cf6}',
        '.notif-item.unread .notif-icon{background:rgba(139,92,246,0.2)}',
        '.notif-item .notif-body{flex:1;min-width:0}',
        '.notif-item .notif-text{color:rgba(255,255,255,0.7);font-size:13px;line-height:1.4;margin:0}',
        '.notif-item.unread .notif-text{color:#fff;font-weight:600}',
        '.notif-item .notif-time{color:rgba(255,255,255,0.2);font-size:10px;margin-top:4px}',
        '.notif-item .notif-dot{width:8px;height:8px;border-radius:50%;background:#8b5cf6;flex-shrink:0;margin-top:6px}',
        '.notif-close-btn{background:none;border:none;color:rgba(255,255,255,0.35);cursor:pointer;padding:4px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s}',
        '.notif-close-btn:hover{background:rgba(255,255,255,0.08)}'
    ].join('\n');
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════════
    // UI ELEMENTS
    // ═══════════════════════════════════════════════════════

    // Bell button
    var bell = document.createElement('button');
    bell.id = 'numerael-notif-bell';
    bell.innerHTML = '<span class="material-symbols-outlined">notifications</span><div id="numerael-notif-badge">0</div>';
    bell.addEventListener('click', togglePanel);

    // Overlay
    var overlay = document.createElement('div');
    overlay.id = 'numerael-notif-overlay';
    overlay.addEventListener('click', closePanel);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'numerael-notif-panel';
    panel.innerHTML =
        '<div class="notif-header">' +
            '<h3>Bildirimler</h3>' +
            '<button id="notif-mark-all">Tümünü okundu işaretle</button>' +
        '</div>' +
        '<div class="notif-list" id="notif-list">' +
            '<div class="notif-empty" id="notif-empty">' +
                '<span class="material-symbols-outlined" style="font-size:32px;margin-bottom:8px;opacity:0.4">notifications_off</span>' +
                'Bildirim yok' +
            '</div>' +
        '</div>';

    // ═══════════════════════════════════════════════════════
    // INJECT INTO PAGE
    // ═══════════════════════════════════════════════════════

    function injectBell() {
        // Check if home page has btn-notif — replace its behavior
        var existingBtn = document.getElementById('btn-notif');
        if (existingBtn) {
            // Override the existing notification button
            existingBtn.onclick = null;
            existingBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                togglePanel();
            });
            // Add badge to existing button
            var badge = document.createElement('div');
            badge.id = 'numerael-notif-badge';
            badge.style.cssText = 'position:absolute;top:2px;right:2px;min-width:16px;height:16px;border-radius:8px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 4px;font-family:"Space Grotesk",sans-serif;line-height:1';
            existingBtn.style.position = 'relative';
            existingBtn.appendChild(badge);
            // Don't inject floating bell
        } else {
            // Inject floating bell
            document.body.appendChild(bell);
        }
        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        // Mark all as read handler
        document.getElementById('notif-mark-all').addEventListener('click', markAllAsRead);
    }

    // ═══════════════════════════════════════════════════════
    // PANEL TOGGLE
    // ═══════════════════════════════════════════════════════

    function togglePanel() {
        if (_panelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    function openPanel() {
        _panelOpen = true;
        panel.classList.add('open');
        overlay.classList.add('open');
        renderNotifications();
    }

    function closePanel() {
        _panelOpen = false;
        panel.classList.remove('open');
        overlay.classList.remove('open');
    }

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════

    function updateBadge() {
        var unread = _notifications.filter(function(n) { return !n.is_read; }).length;
        var badges = document.querySelectorAll('#numerael-notif-badge');
        for (var i = 0; i < badges.length; i++) {
            if (unread > 0) {
                badges[i].textContent = unread > 99 ? '99+' : unread;
                badges[i].style.display = 'flex';
            } else {
                badges[i].style.display = 'none';
            }
        }
    }

    function formatTimeAgo(ts) {
        try {
            var now = Date.now();
            var d = new Date(ts).getTime();
            var diff = Math.floor((now - d) / 1000);
            if (diff < 60) return 'şimdi';
            if (diff < 3600) return Math.floor(diff / 60) + 'dk';
            if (diff < 86400) return Math.floor(diff / 3600) + 'sa';
            if (diff < 604800) return Math.floor(diff / 86400) + 'g';
            return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        } catch(e) { return ''; }
    }

    function renderNotifications() {
        var listEl = document.getElementById('notif-list');
        var emptyEl = document.getElementById('notif-empty');
        if (!listEl) return;

        // Clear existing items (keep empty state)
        var items = listEl.querySelectorAll('.notif-item');
        for (var i = 0; i < items.length; i++) items[i].remove();

        if (_notifications.length === 0) {
            emptyEl.style.display = 'flex';
            return;
        }
        emptyEl.style.display = 'none';

        _notifications.forEach(function(notif) {
            var item = document.createElement('div');
            item.className = 'notif-item' + (notif.is_read ? '' : ' unread');
            item.setAttribute('data-notif-id', notif.id);

            var icon = NOTIF_ICON[notif.type] || 'notifications';
            var text = NOTIF_TEXT[notif.type] || 'Bildirim';
            var p = notif.payload || {};
            // Kişi adını bildirime ekle
            if (notif.type === 'connection_request' && p.sender_name && p.sender_name !== 'User') {
                text = p.sender_name + ' bağlantı isteği gönderdi';
            } else if (notif.type === 'connection_accepted' && p.accepter_name && p.accepter_name !== 'User') {
                text = p.accepter_name + ' isteğinizi kabul etti';
            } else if (notif.type === 'new_message' && p.sender_name && p.sender_name !== 'User') {
                text = p.sender_name + ' mesaj gönderdi';
            }

            item.innerHTML =
                '<div class="notif-icon"><span class="material-symbols-outlined">' + icon + '</span></div>' +
                '<div class="notif-body">' +
                    '<p class="notif-text">' + text + '</p>' +
                    '<div class="notif-time">' + formatTimeAgo(notif.created_at) + '</div>' +
                '</div>' +
                (!notif.is_read ? '<div class="notif-dot"></div>' : '');

            item.addEventListener('click', function() {
                handleNotifClick(notif);
            });

            listEl.appendChild(item);
        });
    }

    // ═══════════════════════════════════════════════════════
    // CLICK HANDLER
    // ═══════════════════════════════════════════════════════

    async function handleNotifClick(notif) {
        // Mark as read
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }

        closePanel();

        var action = getClickAction(notif);
        if (!action) return;

        if (action === '__paywall__') {
            if (window.premium && window.premium.showPaywall) {
                window.premium.showPaywall('Premium required to continue');
            }
            return;
        }

        window.location.href = action;
    }

    // ═══════════════════════════════════════════════════════
    // DATA OPERATIONS
    // ═══════════════════════════════════════════════════════

    async function loadNotifications() {
        if (!_userId) return;
        try {
            var res = await sb().from('notifications')
                .select('*')
                .eq('user_id', _userId)
                .order('created_at', { ascending: false })
                .limit(50);
            _notifications = res.data || [];
            updateBadge();
            if (_panelOpen) renderNotifications();
        } catch(e) {
            console.error('[Notif] Load error:', e);
        }
    }

    async function markAsRead(notifId) {
        try {
            await sb().from('notifications')
                .update({ is_read: true })
                .eq('id', notifId)
                .eq('user_id', _userId);
        } catch(e) {}

        for (var i = 0; i < _notifications.length; i++) {
            if (_notifications[i].id === notifId) {
                _notifications[i].is_read = true;
                break;
            }
        }
        updateBadge();
        if (_panelOpen) renderNotifications();
    }

    async function markAllAsRead() {
        if (!_userId) return;
        try {
            await sb().from('notifications')
                .update({ is_read: true })
                .eq('user_id', _userId)
                .eq('is_read', false);
        } catch(e) {}

        _notifications.forEach(function(n) { n.is_read = true; });
        updateBadge();
        if (_panelOpen) renderNotifications();
    }

    // ═══════════════════════════════════════════════════════
    // NATIVE LOCAL NOTIFICATIONS (Capacitor)
    // ═══════════════════════════════════════════════════════

    var _localNotifPlugin = null;
    var _localNotifReady = false;

    function initLocalNotifications() {
        try {
            if (typeof window.Capacitor !== 'undefined' &&
                window.Capacitor.isNativePlatform &&
                window.Capacitor.isNativePlatform() &&
                window.Capacitor.Plugins &&
                window.Capacitor.Plugins.LocalNotifications) {
                _localNotifPlugin = window.Capacitor.Plugins.LocalNotifications;
                _localNotifPlugin.requestPermissions().then(function(perm) {
                    if (perm && perm.display === 'granted') {
                        _localNotifReady = true;
                        console.log('[Notif] Local notifications izni verildi');
                    }
                }).catch(function(e) {
                    console.warn('[Notif] Local notifications izni hatası:', e);
                });
                // Bildirime tıklandığında ilgili sayfaya yönlendir
                _localNotifPlugin.addListener('localNotificationActionPerformed', function(action) {
                    try {
                        var extra = action.notification && action.notification.extra;
                        if (extra && extra.url) {
                            window.location.href = extra.url;
                        }
                    } catch(e) {}
                });
            }
        } catch(e) {
            console.warn('[Notif] Local notifications init hatası:', e);
        }
    }

    function fireNativeNotification(notif) {
        if (!_localNotifReady || !_localNotifPlugin) return;
        try {
            var NATIVE_TEXT = {
                'connection_request': 'Yeni bağlantı isteği geldi',
                'connection_accepted': 'Bağlantı isteğiniz kabul edildi',
                'new_message': 'Yeni mesaj geldi',
                'limit_hit': 'Premium gerekli'
            };
            var title = 'Soulnum';
            var body = NATIVE_TEXT[notif.type] || 'Yeni bildirim';
            var p = notif.payload || {};
            if (notif.type === 'new_message' && p.sender_name) {
                body = p.sender_name + ' size mesaj gönderdi';
            }
            if (notif.type === 'connection_request' && p.sender_name) {
                body = p.sender_name + ' bağlantı isteği gönderdi';
            }
            var url = getClickAction(notif);
            _localNotifPlugin.schedule({
                notifications: [{
                    id: Date.now(),
                    title: title,
                    body: body,
                    extra: { url: url, type: notif.type }
                }]
            });
        } catch(e) {
            console.warn('[Notif] Native bildirim hatası:', e);
        }
    }

    // ═══════════════════════════════════════════════════════
    // REAL-TIME SUBSCRIPTION
    // ═══════════════════════════════════════════════════════

    function subscribeToNotifications() {
        if (!_userId || _channel) return;

        _channel = sb().channel('notif-' + _userId)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: 'user_id=eq.' + _userId
            }, function(payload) {
                var notif = payload.new;
                if (!notif) return;
                // Prepend to local list
                _notifications.unshift(notif);
                updateBadge();
                if (_panelOpen) renderNotifications();
                // Native local notification (telefon bildirimi)
                fireNativeNotification(notif);
                // Fire registered external callbacks
                for (var ci = 0; ci < _notifCallbacks.length; ci++) {
                    try { _notifCallbacks[ci](notif); } catch(cbErr) {}
                }
            })
            .subscribe();
    }

    // ═══════════════════════════════════════════════════════
    // INIT (with auth.whenReady() to ensure session is loaded)
    // ═══════════════════════════════════════════════════════

    async function init() {
        try {
            // Auth hazır olana kadar bekle (session recovery tamamlansın)
            if (window.auth && window.auth.whenReady) {
                await window.auth.whenReady();
            }
            var session = await window.auth.getSession();
            if (session && session.user) {
                _userId = session.user.id;
            }
        } catch(e) {
            console.warn('[Notif] Auth session error:', e);
        }

        if (!_userId) {
            console.warn('[Notif] userId bulunamadı, bell inject edilmeyecek');
            return;
        }

        injectBell();
        initLocalNotifications();
        await loadNotifications();
        subscribeToNotifications();
    }

    // Wait for DOM + auth
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }

    // ═══════════════════════════════════════════════════════
    // EXTEND GLOBAL EXPORT (add UI methods for ALLOWED pages)
    // ═══════════════════════════════════════════════════════

    window.notificationEngine.loadNotifications = loadNotifications;
    window.notificationEngine.markAsRead = markAsRead;
    window.notificationEngine.markAllAsRead = markAllAsRead;
    window.notificationEngine.getUnreadMessageSenders = function() {
        return _notifications
            .filter(function(n) { return n.type === 'new_message' && !n.is_read && n.payload && n.payload.sender_id; })
            .map(function(n) { return n.payload.sender_id; });
    };
    window.notificationEngine.onNewNotification = function(cb) {
        if (typeof cb === 'function') _notifCallbacks.push(cb);
    };

})();
