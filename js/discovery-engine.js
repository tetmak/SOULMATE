/**
 * NUMERAEL — Cosmic Match / Discovery Engine
 * Kullanıcıları numerolojik uyuma göre eşleştirir.
 * Streak sistemi, günlük match, reveal kredileri.
 */
(function() {
    'use strict';

    // ─── PISAGOR ─────────────────────────────────────────────
    var TABLE = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,'Ş':1,'Ç':3,'Ü':3,'Ö':6,'Ğ':7,'İ':9};
    var VOWELS = 'AEIOUİIÖÜ';

    function reduce(n) {
        if (n===11||n===22||n===33) return n;
        while(n>9){ n=String(n).split('').reduce(function(a,d){return a+parseInt(d);},0); if(n===11||n===22||n===33) break; }
        return n;
    }
    function calcLP(d) { if(!d) return null; return reduce(d.replace(/\D/g,'').split('').reduce(function(a,x){return a+parseInt(x);},0)); }
    function calcExp(name) { var s=0,c=(name||'').toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g,''); for(var i=0;i<c.length;i++) s+=(TABLE[c[i]]||0); return reduce(s); }
    function calcSoul(name) { var s=0,c=(name||'').toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g,''); for(var i=0;i<c.length;i++){ if(VOWELS.includes(c[i])) s+=(TABLE[c[i]]||0); } return reduce(s); }
    function calcPers(name) { var s=0,c=(name||'').toUpperCase().replace(/[^A-ZÇĞİIÖŞÜ]/g,''); for(var i=0;i<c.length;i++){ if(!VOWELS.includes(c[i])) s+=(TABLE[c[i]]||0); } return reduce(s); }

    // ─── UYUM MATRİSİ (compatibility-engine.js ile aynı) ────
    var CM = {
        '1-1':52,'1-2':60,'1-3':68,'1-4':38,'1-5':75,'1-6':45,'1-7':55,'1-8':70,'1-9':62,
        '2-2':58,'2-3':65,'2-4':72,'2-5':35,'2-6':80,'2-7':50,'2-8':35,'2-9':68,
        '3-3':55,'3-4':32,'3-5':78,'3-6':62,'3-7':45,'3-8':48,'3-9':72,
        '4-4':62,'4-5':28,'4-6':75,'4-7':55,'4-8':80,'4-9':40,
        '5-5':52,'5-6':38,'5-7':62,'5-8':42,'5-9':68,
        '6-6':65,'6-7':48,'6-8':55,'6-9':82,
        '7-7':55,'7-8':42,'7-9':68,
        '8-8':50,'8-9':45,
        '9-9':72,
        '11-11':82,'11-22':75,'11-33':78,'22-22':78,'22-33':82,'33-33':88,
        '1-11':68,'2-11':75,'3-11':70,'4-22':78,'6-33':85,'9-11':72,'9-33':80
    };

    // Ham skoru [28,88] → [70,98] aralığına ölçekle (alt limit %70)
    function scaleScore(raw) {
        var scaled = 70 + (raw - 28) * 28 / 60;
        return Math.max(70, Math.min(98, Math.round(scaled)));
    }

    function getScore(a, b) { var k=a<=b?a+'-'+b:b+'-'+a; return CM[k]||50; }

    function calcFullMatch(user, other) {
        var dims = [];
        var uLP = user.life_path || calcLP(user.birth_date);
        var oLP = other.life_path || calcLP(other.birth_date);
        var uSoul = user.soul_urge || calcSoul(user.full_name);
        var oSoul = other.soul_urge || calcSoul(other.full_name);
        var uPers = user.personality_num || calcPers(user.full_name);
        var oPers = other.personality_num || calcPers(other.full_name);
        var uExp = user.expression_num || calcExp(user.full_name);
        var oExp = other.expression_num || calcExp(other.full_name);

        if (uLP && oLP) dims.push({ score: getScore(uLP, oLP), w: 0.35 });
        if (uSoul && oSoul) dims.push({ score: getScore(uSoul, oSoul), w: 0.30 });
        if (uPers && oPers) dims.push({ score: getScore(uPers, oPers), w: 0.20 });
        if (uExp && oExp) dims.push({ score: getScore(uExp, oExp), w: 0.15 });

        if (!dims.length) return 70; // fallback
        var totalW = dims.reduce(function(a,d){return a+d.w;},0);
        var raw = Math.round(dims.reduce(function(a,d){return a + d.score*(d.w/totalW);},0));
        return scaleScore(raw);
    }

    // ─── ARKETIP ETİKETLERİ ──────────────────────────────────
    var ARCHETYPES = {1:'Lider',2:'Diplomat',3:'Yaratıcı',4:'Kurucu',5:'Kaşif',6:'Şifacı',7:'Mistik',8:'Güç',9:'Bilge',11:'İlhamcı',22:'Usta Mimar',33:'Öğretmen'};
    var BOND_LABELS = {94:'Kozmik Ruh İkizi',89:'Kaderin Birleştirdiği',84:'Yıldız Bağı',79:'Güçlü Rezonans',74:'Uyumlu Titreşim',70:'Potansiyel Bağ',0:'Keşfedilecek Enerji'};

    function bondLabel(score) {
        var keys = Object.keys(BOND_LABELS).map(Number).sort(function(a,b){return b-a;});
        for (var i=0;i<keys.length;i++) { if(score>=keys[i]) return BOND_LABELS[keys[i]]; }
        return 'Keşfedilecek Enerji';
    }

    // ─── STREAK SİSTEMİ ─────────────────────────────────────
    function todayStr() { return new Date().toISOString().slice(0,10); }
    function yesterdayStr() { var d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); }

    async function updateStreak(userId) {
        var today = todayStr();
        var sb = window.supabaseClient;

        // Mevcut streak'i al
        var streak = null;
        try {
            var res = await sb.from('user_streaks').select('*').eq('user_id', userId).single();
            streak = res.data;
        } catch(e) {}

        if (!streak) {
            // İlk ziyaret
            try {
                await sb.from('user_streaks').insert({
                    user_id: userId,
                    current_streak: 1,
                    longest_streak: 1,
                    last_visit_date: today,
                    reveal_credits: 0,
                    total_reveals: 0
                });
            } catch(e) { console.warn('[Streak] Insert error:', e); }
            return { current_streak: 1, longest_streak: 1, reveal_credits: 0, last_visit_date: today, total_reveals: 0 };
        }

        // Zaten bugün güncellenmişse
        if (streak.last_visit_date === today) return streak;

        var newStreak = 1;
        var credits = streak.reveal_credits || 0;

        if (streak.last_visit_date === yesterdayStr()) {
            // Ardışık gün
            newStreak = (streak.current_streak || 0) + 1;
            // Her 3 günde 1 reveal hakkı
            if (newStreak % 3 === 0) credits += 1;
        }
        // else: streak kırıldı, 1'den başla

        var longest = Math.max(newStreak, streak.longest_streak || 0);

        try {
            await sb.from('user_streaks').update({
                current_streak: newStreak,
                longest_streak: longest,
                last_visit_date: today,
                reveal_credits: credits,
                updated_at: new Date().toISOString()
            }).eq('user_id', userId);
        } catch(e) { console.warn('[Streak] Update error:', e); }

        return { current_streak: newStreak, longest_streak: longest, reveal_credits: credits, last_visit_date: today, total_reveals: streak.total_reveals || 0 };
    }

    // ─── OPT-IN: Profili Supabase'e kaydet ──────────────────
    async function optIn(userId) {
        var ud = null;
        try { ud = JSON.parse(localStorage.getItem('numerael_user_data')||'null'); } catch(e){}
        if (!ud || !ud.name) return false;

        // Supabase profiles tablosundan güncel cinsiyet bilgisini al
        var freshGender = ud.gender || 'unknown';
        try {
            var profRes = await window.supabaseClient.from('profiles')
                .select('gender').eq('id', userId).maybeSingle();
            if (profRes.data && profRes.data.gender) {
                freshGender = profRes.data.gender;
                console.log('[Discovery] Opt-in: profiles tablosundan gender alındı:', freshGender);
            }
        } catch(e) { console.warn('[Discovery] Opt-in: profiles gender fetch hatası:', e); }

        console.log('[Discovery] Opt-in: userId=' + userId + ', name=' + ud.name + ', gender=' + freshGender);

        // Gender'ı normalize et (Supabase case-sensitive .in() filtresi için)
        freshGender = (freshGender || 'unknown').toLowerCase().trim();

        var data = {
            user_id: userId,
            full_name: ud.name,
            birth_date: ud.birthDate || null,
            gender: freshGender,
            life_path: calcLP(ud.birthDate),
            expression_num: calcExp(ud.name),
            soul_urge: calcSoul(ud.name),
            personality_num: calcPers(ud.name),
            discoverable: true,
            updated_at: new Date().toISOString()
        };

        try {
            await window.supabaseClient.from('discovery_profiles').upsert(data);
            localStorage.setItem('numerael_discovery_opted_in', 'true');
            console.log('[Discovery] Opt-in başarılı — gender:', freshGender);
            return true;
        } catch(e) {
            console.error('[Discovery] Opt-in error:', e);
            return false;
        }
    }

    async function optOut(userId) {
        try {
            await window.supabaseClient.from('discovery_profiles').update({ discoverable: false }).eq('user_id', userId);
            localStorage.setItem('numerael_discovery_opted_in', 'false');
            return true;
        } catch(e) { return false; }
    }

    // ─── KEŞFEDİLEBİLİR PROFİLLERİ ÇEK ─────────────────────
    // Karşı cinsiyet filtreleme: erkek → kadın, kadın → erkek
    function getOppositeGender(gender) {
        if (!gender) return null;
        var g = gender.toLowerCase().trim();
        if (g === 'male' || g === 'erkek') return 'male';
        if (g === 'female' || g === 'kadın' || g === 'kadin') return 'female';
        return null;
    }

    async function fetchDiscoverableProfiles(excludeUserId, userGender) {
        try {
            var query = window.supabaseClient
                .from('discovery_profiles')
                .select('*')
                .eq('discoverable', true)
                .neq('user_id', excludeUserId);

            // Cinsiyet filtresi: karşı cinsiyeti göster (case-insensitive)
            var myGender = getOppositeGender(userGender);
            if (myGender === 'male') {
                // Ben erkeğim → karşı cinsiyet: female/kadın (case-insensitive)
                query = query.or('gender.ilike.female,gender.ilike.kadın,gender.ilike.kadin');
                console.log('[Discovery] Cinsiyet filtresi: erkek → sadece kadın gösterilecek');
            } else if (myGender === 'female') {
                // Ben kadınım → karşı cinsiyet: male/erkek (case-insensitive)
                query = query.or('gender.ilike.male,gender.ilike.erkek');
                console.log('[Discovery] Cinsiyet filtresi: kadın → sadece erkek gösterilecek');
            } else {
                console.warn('[Discovery] Cinsiyet bilinmiyor (' + userGender + '), eşleşme yapılamıyor');
                return [];
            }

            var res = await query;
            console.log('[Discovery] Filtrelenmiş profil sayısı:', (res.data || []).length);
            return res.data || [];
        } catch(e) {
            console.error('[Discovery] Fetch error:', e);
            return [];
        }
    }

    // ─── GÜNLÜK EŞLEŞMELER BUL (çoklu) ──────────────────────
    var MAX_DAILY_MATCHES = 5;

    // Profil listesini zenginleştir (numeroloji sayıları + avatar)
    function enrichProfiles(profiles) {
        profiles.forEach(function(p) {
            if (p.birth_date) p.life_path = calcLP(p.birth_date);
            if (p.full_name) {
                if (!p.expression_num) p.expression_num = calcExp(p.full_name);
                if (!p.soul_urge) p.soul_urge = calcSoul(p.full_name);
                if (!p.personality_num) p.personality_num = calcPers(p.full_name);
            }
        });
    }

    // Eşleşme listesine profil bilgilerini ekle (DB'den dönen match'ler için)
    async function attachProfilesToMatches(matches) {
        var sb = window.supabaseClient;
        var matchedIds = matches.map(function(m) { return m.matched_user_id; }).filter(Boolean);
        if (!matchedIds.length) return matches;

        // discovery_profiles'dan profil bilgileri
        var profilesRes = await sb.from('discovery_profiles').select('*').in('user_id', matchedIds);

        // Avatar fallback: profiles tablosu
        var profAvatarMap = {};
        try {
            var profAvRes = await sb.from('profiles').select('id, avatar_url').in('id', matchedIds);
            (profAvRes.data || []).forEach(function(pa) {
                if (pa.avatar_url) profAvatarMap[pa.id] = pa.avatar_url;
            });
        } catch(e) {}

        var profileMap = {};
        (profilesRes.data || []).forEach(function(p) {
            enrichProfiles([p]);
            if (!p.avatar_url && profAvatarMap[p.user_id]) p.avatar_url = profAvatarMap[p.user_id];
            profileMap[p.user_id] = p;
        });

        matches.forEach(function(m) { m.matched = profileMap[m.matched_user_id] || null; });
        return matches.filter(function(m) { return m.matched; });
    }

    async function findDailyMatches(userId, userProfile) {
        var today = todayStr();
        var sb = window.supabaseClient;

        // ─── Bugünkü eşleşmeler zaten var mı? ───
        var userGender = userProfile ? (userProfile.gender || 'unknown') : 'unknown';
        var myNormGender = getOppositeGender(userGender); // normalizes: 'male' or 'female'
        try {
            var existing = await sb.from('daily_matches')
                .select('*')
                .eq('user_id', userId)
                .eq('match_date', today);

            if (existing.data && existing.data.length > 0) {
                // Gender doğrulama: aynı cinsiyetten eşleşme varsa sil ve yeniden oluştur
                var needsRegen = false;
                if (myNormGender) {
                    var matchedIds = existing.data.map(function(m) { return m.matched_user_id; });
                    try {
                        var matchedProfiles = await sb.from('discovery_profiles')
                            .select('user_id, gender').in('user_id', matchedIds);
                        if (matchedProfiles.data) {
                            for (var gi = 0; gi < matchedProfiles.data.length; gi++) {
                                var mg = (matchedProfiles.data[gi].gender || '').toLowerCase().trim();
                                var isSameGender = (myNormGender === 'male' && (mg === 'male' || mg === 'erkek')) ||
                                                   (myNormGender === 'female' && (mg === 'female' || mg === 'kadın' || mg === 'kadin'));
                                if (isSameGender) { needsRegen = true; break; }
                            }
                        }
                    } catch(gv) {}
                }

                if (!needsRegen) {
                    console.log('[Match] Bugün ' + existing.data.length + ' mevcut eşleşme bulundu (gender OK)');
                    return await attachProfilesToMatches(existing.data);
                }

                // Aynı cinsiyetten eşleşme tespit edildi — bugünkü eşleşmeleri sil ve yeniden oluştur
                console.warn('[Match] Aynı cinsiyet eşleşme tespit edildi, yeniden oluşturuluyor...');
                try {
                    await sb.from('daily_matches').delete()
                        .eq('user_id', userId).eq('match_date', today);
                } catch(de) { console.warn('[Match] Delete error:', de); }
            }
        } catch(e) { console.warn('[Match] Existing check error:', e); }

        // ─── Yoksa yeni eşleşmeler hesapla ───
        var profiles = await fetchDiscoverableProfiles(userId, userGender);
        if (!profiles.length) {
            console.log('[Match] Karşı cinsiyet profil yok, eşleşme oluşturulamadı');
            return [];
        }

        enrichProfiles(profiles);

        // TÜM geçmiş eşleşmeleri al (bir kere gösterilen tekrar gösterilmez)
        var pastIds = [];
        try {
            var pastRes = await sb.from('daily_matches')
                .select('matched_user_id')
                .eq('user_id', userId);
            pastIds = (pastRes.data || []).map(function(r) { return r.matched_user_id; });
        } catch(e) {}

        // Daha önce gösterilmemiş profilleri filtrele
        var newProfiles = profiles.filter(function(p) {
            return pastIds.indexOf(p.user_id) === -1;
        });

        // Eğer hiç yeni profil kalmadıysa tüm havuzdan göster
        if (!newProfiles.length) {
            console.log('[Match] Tüm profiller daha önce gösterilmiş, havuz yenileniyor');
            newProfiles = profiles;
        }

        // Skor hesapla ve sırala
        var scored = newProfiles.map(function(p) {
            var baseScore = calcFullMatch(userProfile, p);
            var visBoost = 0;
            try {
                if (p.current_streak && p.current_streak > 3) visBoost += 2;
                if (p.current_streak && p.current_streak > 7) visBoost += 3;
            } catch(e) {}
            return { profile: p, score: Math.min(99, baseScore + visBoost) };
        });
        scored.sort(function(a,b) { return b.score - a.score; });

        // En fazla MAX_DAILY_MATCHES kadar eşleşme seç
        var dailyPicks = scored.slice(0, MAX_DAILY_MATCHES);
        console.log('[Match] ' + dailyPicks.length + ' yeni günlük eşleşme oluşturuluyor');

        // Hepsini DB'ye kaydet
        var results = [];
        for (var i = 0; i < dailyPicks.length; i++) {
            var pick = dailyPicks[i];
            try {
                await sb.from('daily_matches').insert({
                    user_id: userId,
                    matched_user_id: pick.profile.user_id,
                    match_score: pick.score,
                    match_date: today,
                    revealed: false
                });
            } catch(e) { console.warn('[Match] Insert error for ' + pick.profile.full_name + ':', e); }

            results.push({
                matched_user_id: pick.profile.user_id,
                match_score: pick.score,
                match_date: today,
                revealed: false,
                matched: pick.profile
            });
        }

        return results;
    }

    // Eski API uyumluluğu — tek eşleşme döndürür
    async function findDailyMatch(userId, userProfile) {
        var matches = await findDailyMatches(userId, userProfile);
        return matches.length > 0 ? matches[0] : null;
    }

    // ─── REVEAL (Tek eşleşme açma) ────────────────────────────
    var PREMIUM_DAILY_REVEALS = 5;

    async function getDailyRevealCount(userId) {
        var today = todayStr();
        try {
            var res = await window.supabaseClient
                .from('daily_matches')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('match_date', today)
                .eq('revealed', true);
            return (res.count || 0);
        } catch(e) { return 0; }
    }

    // matchedUserId parametresi ile TEK bir eşleşmeyi reveal eder
    async function revealMatch(userId, matchDate, matchedUserId, isPremium) {
        var sb = window.supabaseClient;

        // Non-premium kullanıcılar hiç reveal yapamaz
        if (!isPremium) {
            return { success: false, reason: 'not_premium', remaining: 0 };
        }

        // Premium: günde 5 reveal limiti
        var todayReveals = await getDailyRevealCount(userId);
        if (todayReveals >= PREMIUM_DAILY_REVEALS) {
            return { success: false, reason: 'daily_limit', remaining: 0 };
        }

        // Reveal yap — sadece belirtilen eşleşme
        try {
            var updateQuery = sb.from('daily_matches').update({ revealed: true })
                .eq('user_id', userId)
                .eq('match_date', matchDate || todayStr());

            // matchedUserId varsa sadece o eşleşmeyi aç
            if (matchedUserId) {
                updateQuery = updateQuery.eq('matched_user_id', matchedUserId);
            }

            await updateQuery;

            // total_reveals güncelle
            try {
                var streakRes = await sb.from('user_streaks').select('*').eq('user_id', userId).single();
                if (streakRes.data) {
                    await sb.from('user_streaks').update({
                        total_reveals: (streakRes.data.total_reveals || 0) + 1,
                        updated_at: new Date().toISOString()
                    }).eq('user_id', userId);
                }
            } catch(e) {}

            var remaining = PREMIUM_DAILY_REVEALS - (await getDailyRevealCount(userId));
            return { success: true, remaining: Math.max(0, remaining) };
        } catch(e) {
            return { success: false, reason: 'error' };
        }
    }

    // ─── GEÇMIŞ EŞLEŞMELER ──────────────────────────────────
    async function getMatchHistory(userId, limit) {
        try {
            var res = await window.supabaseClient
                .from('daily_matches')
                .select('*')
                .eq('user_id', userId)
                .order('match_date', { ascending: false })
                .limit(limit || 20);

            var matches = res.data || [];

            // Eşleşen profilleri toplu çek
            var matchedIds = matches.map(function(m) { return m.matched_user_id; }).filter(Boolean);
            if (matchedIds.length > 0) {
                var profilesRes = await window.supabaseClient
                    .from('discovery_profiles')
                    .select('*')
                    .in('user_id', matchedIds);

                // Avatar fallback: profiles tablosundan avatar_url çek
                var profAvatarMap = {};
                try {
                    var profAvRes = await window.supabaseClient.from('profiles')
                        .select('id, avatar_url')
                        .in('id', matchedIds);
                    (profAvRes.data || []).forEach(function(pa) {
                        if (pa.avatar_url) profAvatarMap[pa.id] = pa.avatar_url;
                    });
                } catch(e3) {}

                var profileMap = {};
                (profilesRes.data || []).forEach(function(p) {
                    // Recalculate life_path from birth_date
                    if (p.birth_date) p.life_path = calcLP(p.birth_date);
                    if (p.full_name) {
                        if (!p.expression_num) p.expression_num = calcExp(p.full_name);
                        if (!p.soul_urge) p.soul_urge = calcSoul(p.full_name);
                        if (!p.personality_num) p.personality_num = calcPers(p.full_name);
                    }
                    // discovery_profiles'da avatar yoksa profiles'dan al
                    if (!p.avatar_url && profAvatarMap[p.user_id]) {
                        p.avatar_url = profAvatarMap[p.user_id];
                    }
                    profileMap[p.user_id] = p;
                });
                matches.forEach(function(m) { m.matched = profileMap[m.matched_user_id] || null; });
            }

            return matches;
        } catch(e) { return []; }
    }

    // ─── PROFIL YENİLE (mevcut kullanıcının verilerini düzelt) ─
    async function refreshOwnProfile(userId) {
        var ud = null;
        try { ud = JSON.parse(localStorage.getItem('numerael_user_data')||'null'); } catch(e){}
        if (!ud || !ud.name || !ud.birthDate) {
            console.warn('[Discovery] refreshOwnProfile: localStorage verisi eksik, name=' + (ud && ud.name) + ', birthDate=' + (ud && ud.birthDate));
            return null;
        }

        // Supabase profiles tablosundan güncel gender'ı al
        var freshGender = ud.gender || 'unknown';
        try {
            var profRes = await window.supabaseClient.from('profiles')
                .select('gender').eq('id', userId).maybeSingle();
            if (profRes.data && profRes.data.gender) {
                freshGender = profRes.data.gender;
            }
        } catch(e) {}

        // Gender'ı normalize et (Supabase case-sensitive .in() filtresi için)
        freshGender = (freshGender || 'unknown').toLowerCase().trim();
        console.log('[Discovery] refreshOwnProfile: userId=' + userId + ', gender=' + freshGender);

        var lp = calcLP(ud.birthDate);
        if (!lp) return null;

        try {
            await window.supabaseClient.from('discovery_profiles').update({
                full_name: ud.name,
                gender: freshGender,
                birth_date: ud.birthDate,
                life_path: lp,
                expression_num: calcExp(ud.name),
                soul_urge: calcSoul(ud.name),
                personality_num: calcPers(ud.name),
                updated_at: new Date().toISOString()
            }).eq('user_id', userId);
        } catch(e) {
            console.warn('[Discovery] refreshOwnProfile update hatası:', e);
        }

        return { gender: freshGender };
    }

    // ─── GLOBAL EXPORT ───────────────────────────────────────
    window.discovery = {
        // Hesaplama
        calcLP: calcLP,
        calcExp: calcExp,
        calcSoul: calcSoul,
        calcPers: calcPers,
        calcFullMatch: calcFullMatch,
        getScore: getScore,
        bondLabel: bondLabel,
        ARCHETYPES: ARCHETYPES,

        // Streak
        updateStreak: updateStreak,
        todayStr: todayStr,

        // Opt-in/out
        optIn: optIn,
        optOut: optOut,
        refreshOwnProfile: refreshOwnProfile,

        // Eşleşme (çoklu günlük)
        findDailyMatches: findDailyMatches,
        findDailyMatch: findDailyMatch, // eski API uyumluluğu
        revealMatch: revealMatch,
        getDailyRevealCount: getDailyRevealCount,
        PREMIUM_DAILY_REVEALS: PREMIUM_DAILY_REVEALS,
        MAX_DAILY_MATCHES: MAX_DAILY_MATCHES,
        getMatchHistory: getMatchHistory,
        fetchDiscoverableProfiles: fetchDiscoverableProfiles
    };

})();
