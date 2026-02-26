/**
 * NUMERAEL — Gamification Engine v1.1
 * XP, Rütbe, Günlük Görev, Ödül, Sayısal Görünürlük
 *
 * Kullanım:
 *   gamification.addXP('daily_reading', 10)
 *   gamification.getRank()
 *   gamification.getDailyQuests()
 *   gamification.getVisibilityMultiplier()
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // RÜTBE SİSTEMİ
    // ═══════════════════════════════════════════════════════════
    var RANKS = [
        { id: 'novice',     name: 'Çaylak Kaşif',      minNBP: 0,    color: '#9ca3af', icon: 'explore',        visibility: 1, radarSize: 6,  premiumDays: 0, frame: null },
        { id: 'student',    name: 'Yıldız Öğrencisi',  minNBP: 100,  color: '#22c55e', icon: 'school',         visibility: 2, radarSize: 8,  premiumDays: 0, frame: 'glow-green' },
        { id: 'warrior',    name: 'Sayı Savaşçısı',    minNBP: 300,  color: '#3b82f6', icon: 'shield',         visibility: 3, radarSize: 10, premiumDays: 0, frame: 'glow-blue' },
        { id: 'guide',      name: 'Sayısal Rehber',      minNBP: 600,  color: '#a855f7', icon: 'assistant_navigation', visibility: 4, radarSize: 12, premiumDays: 0, frame: 'glow-purple' },
        { id: 'master',     name: 'Usta Numerolog',     minNBP: 1000, color: '#f59e0b', icon: 'auto_awesome',   visibility: 5, radarSize: 14, premiumDays: 1, frame: 'glow-gold' },
        { id: 'sage',       name: 'Yıldız Bilgesi',    minNBP: 2000, color: '#e2e8f0', icon: 'diamond',        visibility: 7, radarSize: 16, premiumDays: 1, frame: 'glow-platinum' },
        { id: 'oracle',     name: 'Sayısal Kahin',       minNBP: 3500, color: '#ec4899', icon: 'blur_on',        visibility: 10, radarSize: 20, premiumDays: 3, frame: 'glow-galaxy' }
    ];

    // ═══════════════════════════════════════════════════════════
    // XP EYLEM TABLOSU
    // ═══════════════════════════════════════════════════════════
    var XP_ACTIONS = {
        app_open:          5,    // günde 1 kez
        daily_reading:     10,   // günlük titreşim oku
        compatibility:     20,   // uyumluluk analizi yap
        add_connection:    25,   // arkadaş ekle
        cosmic_match_view: 10,   // günlük eşleşme bak
        streak_day:        15,   // her streak günü
        streak_7:          100,  // 7 gün streak bonus
        streak_30:         500,  // 30 gün streak bonus
        quest_complete:    30,   // günlük görev tamamla
        all_quests:        100,  // tüm günlük görevler bonus
        share_card:        20,   // kart paylaş
        reveal_match:      15,   // cosmic match reveal
        manifest_set:      10,   // niyet belirle
        wheel_spin:        10    // çark çevir
    };

    // ═══════════════════════════════════════════════════════════
    // BAŞARIM ROZETLERİ
    // ═══════════════════════════════════════════════════════════
    var BADGES = [
        { id: 'first_step',     name: 'İlk Adım',           desc: 'İlk analizini yap',            icon: 'footprint',        condition: function(s) { return s.total_analyses >= 1; } },
        { id: 'connector',      name: 'Bağ Kurucusu',        desc: '5 arkadaş ekle',                icon: 'group_add',        condition: function(s) { return s.connections >= 5; } },
        { id: 'streak_fire',    name: 'Streak Ateşi',        desc: '7 gün üst üste giriş',         icon: 'local_fire_department', condition: function(s) { return s.max_streak >= 7; } },
        { id: 'streak_blaze',   name: 'Söndürülmez Alev',    desc: '30 gün streak',                 icon: 'whatshot',         condition: function(s) { return s.max_streak >= 30; } },
        { id: 'streak_eternal', name: 'Sonsuz Ateş',         desc: '100 gün streak',                icon: 'emergency_heat',         condition: function(s) { return s.max_streak >= 100; } },
        { id: 'soul_hunter',    name: 'Uyum Avcısı',   desc: '10 Eşleşme reveal',        icon: 'favorite',         condition: function(s) { return s.reveals >= 10; } },
        { id: 'all_quests_7',   name: 'Görev Avcısı',        desc: '7 gün üst üste tüm görevleri tamamla', icon: 'task_alt', condition: function(s) { return s.all_quests_streak >= 7; } },
        { id: 'oracle_rank',    name: 'Sayısal Uyanış',       desc: 'Sayısal Kahin rütbesine ulaş',  icon: 'blur_on',          condition: function(s) { return s.nbp >= 3500; } }
    ];

    // ═══════════════════════════════════════════════════════════
    // GÜNLÜK GÖREVLER
    // ═══════════════════════════════════════════════════════════
    var QUEST_TEMPLATES = [
        { id: 'read_daily',      name: 'Günlük Titreşimini Oku',  icon: 'auto_stories',  xp: 10, action: 'daily_reading' },
        { id: 'view_match',      name: 'Eşleşmene Bak',   icon: 'favorite',       xp: 10, action: 'cosmic_match_view' },
        { id: 'check_compat',    name: 'Uyumluluk Analizi Yap',   icon: 'compare_arrows', xp: 20, action: 'compatibility' },
        { id: 'set_manifest',    name: 'Bir Niyet Belirle',       icon: 'self_improvement',xp: 10, action: 'manifest_set' },
        { id: 'share_card',      name: 'Analiz Kartını Paylaş',   icon: 'share',          xp: 20, action: 'share_card' },
        { id: 'spin_wheel',      name: 'Kader Çarkını Çevir',     icon: 'casino',         xp: 10, action: 'wheel_spin' },
        { id: 'add_friend',      name: 'Yeni Arkadaş Ekle',       icon: 'person_add',     xp: 25, action: 'add_connection' },
        { id: 'visit_calendar',  name: 'Karar Takvimini Ziyaret Et', icon: 'calendar_month', xp: 10, action: 'calendar_visit' }
    ];

    // ═══════════════════════════════════════════════════════════
    // STATE YÖNETİMİ (localStorage)
    // ═══════════════════════════════════════════════════════════
    var STATE_KEY = 'numerael_gamification';

    function getState() {
        try {
            var s = JSON.parse(localStorage.getItem(STATE_KEY));
            if (s && s.version === 1) return s;
        } catch(e) {}
        return createDefaultState();
    }

    function saveState(s) {
        s.updated_at = new Date().toISOString();
        try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch(e) {}

        // Supabase'e senkronize et (debounced)
        clearTimeout(saveState._timer);
        saveState._timer = setTimeout(function() { syncToSupabase(s); }, 2000);
    }

    // ─── SUPABASE SENKRONİZASYON ─────────────────────────────
    var _syncing = false;

    async function syncToSupabase(s) {
        if (_syncing) return;
        if (!window.supabaseClient || !window.auth) return;
        try {
            _syncing = true;
            var session = await window.auth.getSession();
            if (!session || !session.user) { _syncing = false; return; }

            var uid = session.user.id;
            var rank = getRankByNBP(s.nbp);
            var weekStart = getWeekStart();

            var userData = null;
            try { userData = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
            var displayName = (userData && userData.name) ? userData.name : 'Kaşif';
            // İsmi kısalt (gizlilik): "Ahmet Yılmaz" → "Ahmet Y."
            var parts = displayName.trim().split(/\s+/);
            if (parts.length > 1) displayName = parts[0] + ' ' + parts[parts.length-1].charAt(0) + '.';

            await window.supabaseClient.from('user_gamification').upsert({
                user_id: uid,
                display_name: displayName,
                nbp: s.nbp,
                total_xp: s.total_xp,
                rank_id: rank.id,
                current_streak: s.current_streak,
                max_streak: s.max_streak,
                total_analyses: s.total_analyses,
                connections_count: s.connections,
                reveals_count: s.reveals,
                premium_days_earned: s.premium_days_earned,
                bonus_reveals: s.bonus_reveals,
                unlocked_badges: s.unlocked_badges,
                equipped_frame: s.equipped_frame,
                weekly_xp: s.daily_xp_earned,
                week_start: weekStart,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            _syncing = false;
        } catch(e) {
            console.warn('[Gamification] Supabase sync error:', e);
            _syncing = false;
        }
    }

    function getWeekStart() {
        var d = new Date();
        var day = d.getDay(); // 0=pazar
        var diff = d.getDate() - day + (day === 0 ? -6 : 1); // pazartesi
        var mon = new Date(d.setDate(diff));
        return mon.toISOString().slice(0, 10);
    }

    // Uygulama açılınca Supabase'den state çek — HER ZAMAN Supabase kaynak
    async function loadFromSupabase() {
        if (!window.supabaseClient || !window.auth) return;
        try {
            var session = await window.auth.getSession();
            if (!session || !session.user) return;
            var res = await window.supabaseClient
                .from('user_gamification')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (res.data) {
                var s = getState();
                // Supabase'den gelen veri HER ZAMAN güncellenir (tek doğru kaynak)
                s.nbp = Math.max(res.data.nbp || 0, s.nbp);
                s.total_xp = Math.max(res.data.total_xp || 0, s.total_xp);
                s.current_streak = res.data.current_streak || s.current_streak;
                s.max_streak = Math.max(res.data.max_streak || 0, s.max_streak);
                s.total_analyses = Math.max(res.data.total_analyses || 0, s.total_analyses);
                s.connections = Math.max(res.data.connections_count || 0, s.connections);
                s.reveals = Math.max(res.data.reveals_count || 0, s.reveals);
                s.premium_days_earned = Math.max(res.data.premium_days_earned || 0, s.premium_days_earned);
                s.bonus_reveals = Math.max(res.data.bonus_reveals || 0, s.bonus_reveals);
                if (res.data.unlocked_badges && res.data.unlocked_badges.length > 0) {
                    // Her iki kaynaktaki rozetleri birleştir
                    var allBadges = (s.unlocked_badges || []).concat(res.data.unlocked_badges);
                    s.unlocked_badges = allBadges.filter(function(v, i, a) { return a.indexOf(v) === i; });
                }
                if (res.data.equipped_frame) s.equipped_frame = res.data.equipped_frame;
                try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch(e) {}
                console.log('[Gamification] Supabase\'den yüklendi — NBP:', s.nbp, 'XP:', s.total_xp);
            }
        } catch(e) {
            console.warn('[Gamification] Supabase yükleme hatası (offline?):', e.message);
        }
    }

    function createDefaultState() {
        return {
            version: 1,
            nbp: 0,              // Numeroloji Bilgi Puanı
            total_xp: 0,         // toplam XP
            level: 1,
            // İstatistikler
            total_analyses: 0,
            connections: 0,
            reveals: 0,
            max_streak: 0,
            current_streak: 0,
            all_quests_streak: 0,
            // Günlük
            daily_quests: [],
            daily_quests_date: '',
            daily_xp_earned: 0,
            daily_date: '',
            // Başarımlar
            unlocked_badges: [],
            // Ödüller
            pending_rewards: [],
            premium_days_earned: 0,
            bonus_reveals: 0,
            // Profil
            equipped_frame: null,
            equipped_title: null,
            // Zaman
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════
    // XP & RÜTBE
    // ═══════════════════════════════════════════════════════════
    function addXP(action, bonus) {
        var s = getState();
        var base = XP_ACTIONS[action] || 0;
        var xp = base + (bonus || 0);
        if (xp <= 0) return s;

        // Günlük rate limit (app_open günde 1 kez)
        var today = todayStr();
        if (action === 'app_open') {
            if (s.daily_date === today && s.daily_xp_earned > 0) return s; // zaten açmış
        }

        s.total_xp += xp;
        s.nbp += Math.round(xp * 0.7); // NBP = XP'nin %70'i

        if (s.daily_date !== today) {
            s.daily_date = today;
            s.daily_xp_earned = 0;
        }
        s.daily_xp_earned += xp;

        // Stat güncelle
        if (action === 'compatibility') s.total_analyses++;
        if (action === 'add_connection') s.connections++;
        if (action === 'reveal_match') s.reveals++;

        // Rozet kontrol
        checkBadges(s);

        // Rütbe yükselme ödülü
        var oldRank = getRankByNBP(s.nbp - Math.round(xp * 0.7));
        var newRank = getRankByNBP(s.nbp);
        if (newRank.id !== oldRank.id) {
            s.pending_rewards.push({
                type: 'rank_up',
                rank: newRank.id,
                name: newRank.name,
                premiumDays: newRank.premiumDays,
                timestamp: new Date().toISOString()
            });
            if (newRank.premiumDays > 0) {
                s.premium_days_earned += newRank.premiumDays;
            }
        }

        saveState(s);
        return s;
    }

    function getRankByNBP(nbp) {
        var rank = RANKS[0];
        for (var i = RANKS.length - 1; i >= 0; i--) {
            if (nbp >= RANKS[i].minNBP) { rank = RANKS[i]; break; }
        }
        return rank;
    }

    function getCurrentRank() {
        var s = getState();
        return getRankByNBP(s.nbp);
    }

    function getNextRank() {
        var s = getState();
        var current = getCurrentRank();
        for (var i = 0; i < RANKS.length; i++) {
            if (RANKS[i].id === current.id && i < RANKS.length - 1) {
                return RANKS[i + 1];
            }
        }
        return null; // max rütbe
    }

    function getRankProgress() {
        var s = getState();
        var current = getCurrentRank();
        var next = getNextRank();
        if (!next) return { current: current, next: null, progress: 100, remaining: 0 };
        var range = next.minNBP - current.minNBP;
        var progress = Math.min(100, Math.round(((s.nbp - current.minNBP) / range) * 100));
        return {
            current: current,
            next: next,
            progress: progress,
            remaining: next.minNBP - s.nbp,
            nbp: s.nbp
        };
    }

    // ═══════════════════════════════════════════════════════════
    // KOZMİK GÖRÜNÜRLÜK (Cosmic Match entegrasyonu)
    // ═══════════════════════════════════════════════════════════
    function getVisibilityMultiplier() {
        return getCurrentRank().visibility;
    }

    function getRadarSize() {
        return getCurrentRank().radarSize;
    }

    function getProfileFrame() {
        var s = getState();
        return s.equipped_frame || getCurrentRank().frame;
    }

    // ═══════════════════════════════════════════════════════════
    // GÜNLÜK GÖREVLER
    // ═══════════════════════════════════════════════════════════
    function getDailyQuests() {
        var s = getState();
        var today = todayStr();

        if (s.daily_quests_date === today && s.daily_quests.length > 0) {
            return s.daily_quests;
        }

        // Bugünün seed'i ile 3 rastgele görev seç
        var seed = hashDate(today);
        var shuffled = QUEST_TEMPLATES.slice().sort(function(a, b) {
            return hashStr(a.id + today) - hashStr(b.id + today);
        });
        var selected = shuffled.slice(0, 3).map(function(qt) {
            return { id: qt.id, name: qt.name, icon: qt.icon, xp: qt.xp, action: qt.action, completed: false };
        });

        s.daily_quests = selected;
        s.daily_quests_date = today;
        saveState(s);
        return selected;
    }

    function completeQuest(questId) {
        var s = getState();
        var quest = null;
        for (var i = 0; i < s.daily_quests.length; i++) {
            if (s.daily_quests[i].id === questId && !s.daily_quests[i].completed) {
                s.daily_quests[i].completed = true;
                quest = s.daily_quests[i];
                break;
            }
        }
        if (!quest) return null;

        // XP ver
        s.total_xp += quest.xp;
        s.nbp += Math.round(quest.xp * 0.7);

        // Tüm görevler tamamlandı mı?
        var allDone = s.daily_quests.every(function(q) { return q.completed; });
        if (allDone) {
            // Bonus!
            var bonus = XP_ACTIONS.all_quests;
            s.total_xp += bonus;
            s.nbp += Math.round(bonus * 0.7);
            s.all_quests_streak++;

            // Bonus Sandık ödülü
            var chest = generateChestReward(s);
            s.pending_rewards.push(chest);
        }

        checkBadges(s);
        saveState(s);
        return { quest: quest, allDone: allDone, state: s };
    }

    // Aksiyon bazlı otomatik görev tamamlama
    function trackAction(action) {
        var s = getState();
        if (s.daily_quests_date !== todayStr()) getDailyQuests();
        s = getState();

        var completed = [];
        for (var i = 0; i < s.daily_quests.length; i++) {
            var q = s.daily_quests[i];
            if (!q.completed && q.action === action) {
                completed.push(q.id);
            }
        }
        completed.forEach(function(id) { completeQuest(id); });
        return completed;
    }

    // ═══════════════════════════════════════════════════════════
    // KOZMİK SANDIK (Rastgele Ödül)
    // ═══════════════════════════════════════════════════════════
    function generateChestReward(s) {
        var roll = Math.random();
        if (roll < 0.05) {
            // %5 — Nadir: 1 gün Premium
            return { type: 'chest', rarity: 'legendary', reward: 'premium_day', label: '1 Gün Premium!', icon: 'workspace_premium', color: '#f59e0b' };
        } else if (roll < 0.15) {
            // %10 — Epik: Reveal kredisi
            s.bonus_reveals++;
            return { type: 'chest', rarity: 'epic', reward: 'reveal_credit', label: '+1 Reveal Kredisi', icon: 'visibility', color: '#a855f7' };
        } else if (roll < 0.35) {
            // %20 — Nadir: Streak kalkanı
            return { type: 'chest', rarity: 'rare', reward: 'streak_shield', label: 'Streak Kalkanı', icon: 'shield', color: '#3b82f6' };
        } else if (roll < 0.60) {
            // %25 — Bonus XP
            var bonusXP = 50 + Math.floor(Math.random() * 100);
            s.total_xp += bonusXP;
            s.nbp += Math.round(bonusXP * 0.7);
            return { type: 'chest', rarity: 'common', reward: 'bonus_xp', label: '+' + bonusXP + ' XP', icon: 'bolt', color: '#22c55e' };
        } else {
            // %40 — Koleksiyon kartı
            var cardNum = Math.floor(Math.random() * 12) + 1; // 1-12
            if (cardNum > 9 && cardNum <= 11) cardNum = 11;
            if (cardNum > 11) cardNum = 22;
            return { type: 'chest', rarity: 'common', reward: 'card', label: cardNum + ' Analiz Kartı', icon: 'style', color: '#ec4899', cardNumber: cardNum };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // BAŞARIM / ROZET
    // ═══════════════════════════════════════════════════════════
    function checkBadges(s) {
        BADGES.forEach(function(badge) {
            if (s.unlocked_badges.indexOf(badge.id) === -1) {
                if (badge.condition(s)) {
                    s.unlocked_badges.push(badge.id);
                    s.pending_rewards.push({
                        type: 'badge_unlock',
                        badge: badge,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    function getUnlockedBadges() {
        var s = getState();
        return BADGES.filter(function(b) { return s.unlocked_badges.indexOf(b.id) !== -1; });
    }

    function getLockedBadges() {
        var s = getState();
        return BADGES.filter(function(b) { return s.unlocked_badges.indexOf(b.id) === -1; });
    }

    // ═══════════════════════════════════════════════════════════
    // ÖDÜL POPUP
    // ═══════════════════════════════════════════════════════════
    function showRewardPopup(reward) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:9500;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s';

        var colors = { legendary: '#f59e0b', epic: '#a855f7', rare: '#3b82f6', common: '#22c55e' };
        var bgColor = reward.color || colors[reward.rarity] || '#8b5cf6';

        var card = document.createElement('div');
        card.style.cssText = 'text-align:center;transform:scale(0.5);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';

        var title = '';
        var subtitle = '';
        if (reward.type === 'chest') {
            title = '🎁 Bonus Sandık!';
            subtitle = reward.label;
        } else if (reward.type === 'rank_up') {
            title = '⭐ Rütbe Yükseldi!';
            subtitle = reward.name;
        } else if (reward.type === 'badge_unlock') {
            title = '🏆 Rozet Kazandın!';
            subtitle = reward.badge.name;
        } else {
            title = '🎉 Ödül!';
            subtitle = reward.label || reward.name || '';
        }

        card.innerHTML =
            '<div style="width:100px;height:100px;border-radius:50%;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 40px ' + bgColor + '60">' +
                '<span class="material-symbols-outlined" style="color:white;font-size:48px;font-variation-settings:\'FILL\' 1">' + (reward.icon || 'redeem') + '</span>' +
            '</div>' +
            '<h3 style="color:white;font-size:22px;font-weight:800;font-family:Space Grotesk,sans-serif;margin-bottom:8px">' + title + '</h3>' +
            '<p style="color:rgba(255,255,255,0.6);font-size:16px;font-family:Space Grotesk,sans-serif;font-weight:600">' + subtitle + '</p>' +
            '<button style="margin-top:24px;padding:12px 40px;border-radius:9999px;background:' + bgColor + ';color:white;font-weight:700;font-family:Space Grotesk,sans-serif;border:none;cursor:pointer;font-size:14px" onclick="this.closest(\'div[style*=fixed]\').remove()">Harika!</button>';

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        setTimeout(function() { overlay.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 30);
    }

    // Bekleyen ödülleri göster
    function showPendingRewards() {
        var s = getState();
        if (!s.pending_rewards || s.pending_rewards.length === 0) return;

        var reward = s.pending_rewards.shift();
        saveState(s);
        showRewardPopup(reward);

        // Kalan ödüller 1.5s arayla
        if (s.pending_rewards.length > 0) {
            setTimeout(showPendingRewards, 1500);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // YARDIMCI
    // ═══════════════════════════════════════════════════════════
    function todayStr() { return new Date().toISOString().slice(0, 10); }
    function hashDate(d) { var h = 0; for (var i = 0; i < d.length; i++) { h = ((h << 5) - h) + d.charCodeAt(i); h |= 0; } return Math.abs(h); }
    function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return Math.abs(h); }

    // ═══════════════════════════════════════════════════════════
    // SAYFA YÜKLENME
    // ═══════════════════════════════════════════════════════════
    async function onPageLoad() {
        // Önce Supabase'den güncel state çek (tek doğru kaynak)
        try {
            if (window.auth && window.auth.whenReady) await window.auth.whenReady();
            await loadFromSupabase();
        } catch(e) {}
        // Sonra günlük giriş XP
        addXP('app_open', 0);
        // Görevleri oluştur
        getDailyQuests();
        // Bekleyen ödülleri göster
        setTimeout(showPendingRewards, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onPageLoad);
    } else {
        onPageLoad();
    }

    // ═══════════════════════════════════════════════════════════
    // GLOBAL EXPORT
    // ═══════════════════════════════════════════════════════════
    window.gamification = {
        // XP & Rütbe
        addXP: addXP,
        getState: getState,
        getRank: getCurrentRank,
        getNextRank: getNextRank,
        getRankProgress: getRankProgress,
        RANKS: RANKS,

        // Görünürlük
        getVisibility: getVisibilityMultiplier,
        getRadarSize: getRadarSize,
        getFrame: getProfileFrame,

        // Görevler
        getQuests: getDailyQuests,
        completeQuest: completeQuest,
        trackAction: trackAction,

        // Rozetler
        getUnlockedBadges: getUnlockedBadges,
        getLockedBadges: getLockedBadges,
        BADGES: BADGES,

        // Ödüller
        showPendingRewards: showPendingRewards,
        showReward: showRewardPopup,

        // Supabase
        syncToSupabase: function() { syncToSupabase(getState()); },
        loadFromSupabase: loadFromSupabase,

        // Dev
        resetState: function() { localStorage.removeItem(STATE_KEY); window.location.reload(); },
        addNBP: function(n) { var s = getState(); s.nbp += n; s.total_xp += n; saveState(s); console.log('NBP:', s.nbp, 'Rank:', getRankByNBP(s.nbp).name); },
        XP_ACTIONS: XP_ACTIONS
    };

})();
