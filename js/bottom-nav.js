/**
 * NUMERAEL — Global Bottom Navigation + Bubble Menu
 * Tüm ana sayfalara otomatik eklenir.
 * Kullanım: <script src="js/bottom-nav.js"></script>
 */
(function() {
    'use strict';

    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // ─── Bu sayfalarda nav GÖSTERME ──────────────────────────
    var EXCLUDED = [
        'mystic_splash_screen.html',
        'branded_celestial_splash_screen.html',
        'cosmic_onboarding_welcome.html',
        'mystic_sign_up_screen.html',
        'cosmic_calculation_loading.html',
        'soul_mate_loading.html',
        'wheel_reward_success.html',
        'premium_checkout_summary.html',
        'data-ready_birth_form.html'
    ];
    if (EXCLUDED.indexOf(currentPage) !== -1) return;

    // ─── Aktif tab tespiti ──────────────────────────────────
    function isActive(pages) {
        for (var i = 0; i < pages.length; i++) {
            if (currentPage.indexOf(pages[i]) !== -1) return true;
        }
        return false;
    }

    var _t = window.i18n ? window.i18n.t : function(k,f){return f||k;};

    var tabs = [
        { icon: 'home', label: _t('nav.home', 'Home'), href: 'mystic_numerology_home_1.html', active: isActive(['mystic_numerology_home_1', 'cosmic_energy_calendar', 'daily_spiritual_guide', 'daily_number_deep_dive', 'numerology_meaning_chart', 'kader_app_ui_design_system']) },
        { icon: 'diversity_3', label: _t('nav.nuconnect', 'NuConnect'), href: 'connections_shared_readings.html', active: isActive(['connections', 'kisi_profil', 'friendship_dynamics', 'name_numerology_breakdown', 'past_reading_archive', 'letter_vibration']) },
        { icon: 'ADD_BUTTON', label: '', href: '', active: false },
        { icon: 'auto_awesome', label: _t('nav.nufest', 'NuFest'), href: 'manifest_community.html', active: isActive(['manifest_community']) },
        { icon: 'mystery', label: _t('nav.numatch', 'NuMatch'), href: 'cosmic_match.html', active: isActive(['cosmic_match']) }
    ];

    // ─── BUBBLE MENU İTEMLERİ ───────────────────────────────
    var bubbleItems = [
        { icon: 'favorite',      label: _t('bubble.compatibility', 'Uyum Analizi'),   href: 'compatibility_input_form.html', color: '#fb7185', bg: 'rgba(225,29,72,0.25)', border: 'rgba(225,29,72,0.5)' },
        { icon: 'calculate',     label: _t('bubble.new_analysis', 'Yeni Analiz'),     href: 'data-ready_birth_form.html?newperson=1',    color: '#fac638', bg: 'rgba(250,198,56,0.2)',  border: 'rgba(250,198,56,0.5)' },
        { icon: 'self_improvement', label: _t('bubble.daily_guide', 'Günlük Rehber'), href: 'daily_spiritual_guide.html',   color: '#a78bfa', bg: 'rgba(139,92,246,0.2)',  border: 'rgba(139,92,246,0.5)' },
        { icon: 'nights_stay',   label: _t('bubble.moon_phase', 'Ay Fazı'),         href: 'lunar_phase_energy_tracker.html',color: '#93c5fd', bg: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.5)' },
        { icon: 'casino',        label: _t('bubble.decision_wheel', 'Karar Çarkı'),     href: 'wheel_of_destiny.html',         color: '#fb923c', bg: 'rgba(251,146,60,0.2)',  border: 'rgba(251,146,60,0.5)' },
        { icon: 'calendar_month',label: _t('bubble.decision_calendar', 'Karar Takvimi'),   href: 'cosmic_energy_calendar_2.html', color: '#60a5fa', bg: 'rgba(96,165,250,0.2)',  border: 'rgba(96,165,250,0.5)' },
        { icon: 'flare',         label: _t('bubble.nufest', 'NuFest'),           href: 'manifest_portal.html',          color: '#fbbf24', bg: 'rgba(251,191,36,0.2)',  border: 'rgba(251,191,36,0.5)' },
        { icon: 'account_circle',label: _t('bubble.profile', 'Profil'),          href: 'profile_soul_journey.html',     color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' }
    ];

    // ─── CSS ─────────────────────────────────────────────────
    var style = document.createElement('style');
    style.id = 'numerael-nav-style';
    style.textContent = [
        '#numerael-bottom-nav{position:fixed;bottom:16px;left:16px;right:16px;height:64px;max-width:448px;margin:0 auto;background:rgba(24,23,17,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:9999px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-around;padding:0 12px;z-index:1000;box-shadow:0 -4px 30px rgba(0,0,0,0.4)}',
        'html:not(.dark) #numerael-bottom-nav{background:rgba(255,255,255,0.92);border-color:rgba(0,0,0,0.08);box-shadow:0 -4px 30px rgba(0,0,0,0.08)}',
        '#numerael-bottom-nav .nav-tab{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;padding:6px 10px;transition:all 0.2s;color:rgba(255,255,255,0.35);font-family:"Space Grotesk",sans-serif}',
        'html:not(.dark) #numerael-bottom-nav .nav-tab{color:rgba(0,0,0,0.35)}',
        '#numerael-bottom-nav .nav-tab.active{color:#f2cc0d}',
        'html:not(.dark) #numerael-bottom-nav .nav-tab.active{color:#b8860b}',
        '#numerael-bottom-nav .nav-tab:not(.active):hover{color:rgba(255,255,255,0.6)}',
        'html:not(.dark) #numerael-bottom-nav .nav-tab:not(.active):hover{color:rgba(0,0,0,0.6)}',
        '#numerael-bottom-nav .nav-tab .material-symbols-outlined{font-size:24px;transition:all 0.2s}',
        '#numerael-bottom-nav .nav-tab.active .material-symbols-outlined{font-variation-settings:"FILL" 1}',
        '#numerael-bottom-nav .nav-tab span:last-child{font-size:9px;font-weight:700;letter-spacing:0.03em}',
        '#numerael-plus-btn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#f2cc0d,#e6b800);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;top:-22px;box-shadow:0 4px 20px rgba(242,204,13,0.35);transition:transform 0.2s,box-shadow 0.2s;z-index:1002}',
        'html:not(.dark) #numerael-plus-btn{background:linear-gradient(135deg,#fbbf24,#f59e0b);box-shadow:0 4px 16px rgba(251,191,36,0.35)}',
        '#numerael-plus-btn:active{transform:scale(0.92)}',
        '#numerael-plus-btn .plus-icon{font-size:32px;color:#0a0907;transition:transform 0.3s}',
        '#numerael-plus-btn.open .plus-icon{transform:rotate(45deg)}',
        '#numerael-bubble-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:999}',
        '#numerael-bubble-menu{display:none;position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:1001;width:300px}',
        '#numerael-bubble-menu .bubble-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;justify-items:center}',
        '#numerael-bubble-menu .bubble-item{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:transform 0.15s}',
        '#numerael-bubble-menu .bubble-item:active{transform:scale(0.9)}',
        '#numerael-bubble-menu .bubble-icon{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;border-width:2px;border-style:solid;transition:box-shadow 0.2s}',
        '#numerael-bubble-menu .bubble-label{font-size:10px;color:rgba(255,255,255,0.8);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;text-align:center;font-family:"Space Grotesk",sans-serif;max-width:70px}',
        'html:not(.dark) #numerael-bubble-overlay{background:rgba(0,0,0,0.3)}',
        '@keyframes numerael-bubble-in{from{opacity:0;transform:translateY(20px) scale(0.8)}to{opacity:1;transform:translateY(0) scale(1)}}',
        '#numerael-bubble-menu.open{display:block}',
        '#numerael-bubble-menu.open .bubble-item{animation:numerael-bubble-in 0.3s ease forwards;opacity:0}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(1){animation-delay:0.02s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(2){animation-delay:0.06s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(3){animation-delay:0.10s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(4){animation-delay:0.14s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(5){animation-delay:0.18s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(6){animation-delay:0.22s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(7){animation-delay:0.26s}',
        '#numerael-bubble-menu.open .bubble-item:nth-child(8){animation-delay:0.30s}',
        '#numerael-bubble-overlay.open{display:block}'
    ].join('\n');
    document.head.appendChild(style);

    // ─── OVERLAY ─────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'numerael-bubble-overlay';
    overlay.addEventListener('click', closeBubble);
    document.body.appendChild(overlay);

    // ─── BUBBLE MENU ─────────────────────────────────────────
    var bubbleMenu = document.createElement('div');
    bubbleMenu.id = 'numerael-bubble-menu';
    var gridHTML = '<div class="bubble-grid">';
    bubbleItems.forEach(function(item) {
        gridHTML += '<div class="bubble-item" onclick="window.location.href=\'' + item.href + '\'">' +
            '<div class="bubble-icon" style="background:' + item.bg + ';border-color:' + item.border + ';box-shadow:0 0 16px ' + item.bg + ';">' +
                '<span class="material-symbols-outlined" style="color:' + item.color + ';font-size:24px;">' + item.icon + '</span>' +
            '</div>' +
            '<span class="bubble-label">' + item.label + '</span>' +
        '</div>';
    });
    gridHTML += '</div>';
    bubbleMenu.innerHTML = gridHTML;
    document.body.appendChild(bubbleMenu);

    // ─── BOTTOM NAV ──────────────────────────────────────────
    var nav = document.createElement('nav');
    nav.id = 'numerael-bottom-nav';

    tabs.forEach(function(tab) {
        if (tab.icon === 'ADD_BUTTON') {
            // Plus button
            var plusBtn = document.createElement('button');
            plusBtn.id = 'numerael-plus-btn';
            plusBtn.innerHTML = '<span class="plus-icon material-symbols-outlined">add</span>';
            plusBtn.addEventListener('click', toggleBubble);
            nav.appendChild(plusBtn);
        } else {
            var btn = document.createElement('button');
            btn.className = 'nav-tab' + (tab.active ? ' active' : '');
            if (tab.label === 'Bağlantılar') {
                btn.innerHTML = '<div style="position:relative;display:inline-flex"><span class="material-symbols-outlined">' + tab.icon + '</span><span id="nav-conn-badge" style="display:none;position:absolute;top:-6px;right:-12px;color:#ef4444;font-size:11px;font-weight:900;text-shadow:0 0 4px rgba(239,68,68,0.4);font-family:Space Grotesk,sans-serif;white-space:nowrap"></span></div><span>' + tab.label + '</span>';
            } else {
                btn.innerHTML = '<span class="material-symbols-outlined">' + tab.icon + '</span><span>' + tab.label + '</span>';
            }
            btn.addEventListener('click', function() {
                window.location.href = tab.href;
            });
            nav.appendChild(btn);
        }
    });

    document.body.appendChild(nav);

    // ─── Body padding (nav için yer aç) ─────────────────────
    var spacer = document.createElement('div');
    spacer.style.height = '90px';
    spacer.id = 'numerael-nav-spacer';
    document.body.appendChild(spacer);

    // ─── TOGGLE / CLOSE ─────────────────────────────────────
    function toggleBubble() {
        var isOpen = bubbleMenu.classList.contains('open');
        if (isOpen) {
            closeBubble();
        } else {
            bubbleMenu.classList.add('open');
            overlay.classList.add('open');
            document.getElementById('numerael-plus-btn').classList.add('open');
        }
    }

    function closeBubble() {
        bubbleMenu.classList.remove('open');
        overlay.classList.remove('open');
        document.getElementById('numerael-plus-btn').classList.remove('open');
    }

    // Global export (bazı sayfalar kullanabilir)
    window.numeraelNav = { toggle: toggleBubble, close: closeBubble };

    // ─── BAĞLANTILAR BADGE: Okunmamış bildirim sayısı ──────
    var _badgeChannel = null;
    var _badgeUpdating = false;

    async function updateConnBadge() {
        if (_badgeUpdating) return;
        _badgeUpdating = true;
        try {
            if (!window.supabaseClient) return;
            if (window.auth && window.auth.whenReady) await window.auth.whenReady();
            var session = null;
            try { session = await window.auth.getSession(); } catch(e) {}
            if (!session || !session.user) return;
            var userId = session.user.id;

            var res = await window.supabaseClient.from('notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('is_read', false)
                .in('type', ['new_message', 'connection_request']);

            var count = (res.data || []).length;
            var badge = document.getElementById('nav-conn-badge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = '+' + count;
                    badge.style.display = 'inline';
                } else {
                    badge.style.display = 'none';
                }
            }

            // Realtime: bildirim değişince otomatik güncelle
            if (!_badgeChannel) {
                _badgeChannel = window.supabaseClient.channel('nav-badge-' + userId)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: 'user_id=eq.' + userId
                    }, function() {
                        updateConnBadge();
                    })
                    .subscribe();
            }
        } catch(e) {
            console.warn('[Nav] Badge error:', e);
        } finally {
            _badgeUpdating = false;
        }
    }

    // Badge güncellemeyi başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(updateConnBadge, 500); });
    } else {
        setTimeout(updateConnBadge, 500);
    }

})();
