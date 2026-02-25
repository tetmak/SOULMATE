/**
 * NUMERAEL — Manifest Engine
 * Supabase-backed community manifest CRUD + likes
 * Kullanim: <script src="js/manifest-engine.js"></script>
 */
(function() {
    'use strict';

    // ─── Fake (bot) kullanıcı ID'leri ──────────────────
    // Cron job tarafindan manifest olusturan fake kullanicilar.
    // Gercek kullanicilar her zaman feed'de üstte gösterilir.
    var FAKE_USER_IDS = {
        '197028bd-1437-4e1e-9f80-23aa911b3a83': true,
        'df133f11-cffa-4a8c-a730-3d2aeb3777c1': true,
        '1904ad8a-8cd4-4581-a31c-5a71e8c3819b': true,
        '9227c768-cd43-4620-affb-2b83b989f21c': true,
        'aa686093-14db-4af6-b31c-1fe44b290884': true,
        '588c5b08-4964-4a19-adc5-a004124cc818': true,
        'c0121793-1a75-4aae-ae9a-275642a4badb': true,
        'b3b873bb-ba5f-4172-bb8e-ecb93a9a8161': true,
        '887a6780-1f50-4f7d-81b1-ba8e83c7bccb': true,
        '61b8111e-1300-481c-ae79-445b9c96c9c5': true,
        '09afa18e-e79a-4a45-a1ba-aa53c688874b': true,
        'e33492ac-7f50-4fbb-8211-8ba1df23cc71': true,
        '44b5e069-b34c-44e4-9912-d0606161dbff': true,
        '650a8088-0f2b-490e-a5b9-9544949f5981': true,
        '012d1483-ba04-457f-b546-02cb221c3658': true,
        '5e8321d4-e52c-4cb5-831e-46674234e85d': true,
        '92da8501-0946-402c-9e51-dc66850785b4': true,
        '54f6d2ae-179e-47e6-9c3a-ba3b8e1af4c1': true,
        'b38acf4e-5b23-4b09-8f46-c276d7c626dc': true,
        '3d0cc7e7-5aa9-46f6-be0d-cd53ede04961': true,
        'fd0cb355-91a2-48d5-aa07-085007fd4a05': true,
        'b1cc59ad-697a-49ca-af7f-a1d952b8e274': true,
        'dff3a1ce-279c-4cdc-bf83-6192309d852f': true,
        'c730dd3d-c4ae-4ac9-8d07-4070f95e10fd': true,
        '6c7b0bc9-b5fb-46c1-b1a7-c560d27c833a': true,
        '9a436ee9-7c4c-4dd4-9530-661dea38833c': true,
        'a1e20d8d-387f-429c-9fbd-8739a4ebaa40': true,
        'de0be15a-a940-4225-9f61-9e4b6b9a2848': true,
        '707c0e54-b93f-4338-8f9d-f2996a8f5734': true,
        '6992f7c2-29a9-4e2b-bb00-a0b49febdbbf': true
    };

    function isFakeUser(userId) {
        return !!FAKE_USER_IDS[userId];
    }

    // ─── Helpers ───────────────────────────────────────
    function sb() { return window.supabaseClient; }

    /**
     * Supabase client uzerinden authenticated user ID al.
     * localStorage okumak yerine client'in kendi auth API'sini kullanir —
     * boylece RLS auth.uid() ile her zaman eslesen dogru user_id doner.
     * @returns {Promise<string|null>}
     */
    async function getCurrentUserId() {
        try {
            if (!sb()) return null;
            var res = await sb().auth.getSession();
            if (res.data && res.data.session && res.data.session.user) {
                return res.data.session.user.id;
            }
            return null;
        } catch(e) {
            console.warn('[Manifest] getCurrentUserId error:', e);
            return null;
        }
    }

    function getUserData() {
        try {
            return JSON.parse(localStorage.getItem('numerael_user_data') || 'null') || {};
        } catch(e) { return {}; }
    }

    // ─── SAVE ──────────────────────────────────────────
    /**
     * Manifest kaydet (Supabase + localStorage fallback)
     * @param {string} text - Manifest metni
     * @param {string} category - love|money|health|career|spiritual|general
     * @returns {Promise<{success:boolean, data:object|null}>}
     */
    async function save(text, category) {
        var userId = await getCurrentUserId();
        if (!userId) {
            console.warn('[Manifest] No session, saving to localStorage only');
            return { success: false, data: null };
        }

        var ud = getUserData();
        var displayName = (ud.name || 'User').split(' ')[0];
        var lifePath = null;

        // Life Path sayisini localStorage'dan al
        try {
            var gam = JSON.parse(localStorage.getItem('numerael_gamification') || 'null');
            if (gam && gam.lifePath) lifePath = parseInt(gam.lifePath);
        } catch(e) {}

        // Supabase'e kaydet
        try {
            var res = await sb().from('manifests').insert({
                user_id: userId,
                text: text,
                category: category || 'general',
                display_name: displayName,
                life_path: lifePath
            }).select();

            if (res.error) {
                console.warn('[Manifest] Supabase save error:', res.error);
                return { success: false, data: null };
            }

            console.log('[Manifest] Saved to Supabase:', res.data ? res.data[0] : null);
            return { success: true, data: res.data ? res.data[0] : null };
        } catch(e) {
            console.warn('[Manifest] Supabase save exception:', e);
            return { success: false, data: null };
        }
    }

    // ─── LOAD FEED ─────────────────────────────────────
    /**
     * Topluluk manifestlerini yukle
     * @param {string} sort - 'newest'|'top_rated'|'weekly'
     * @param {string} category - 'all'|'love'|'money'|...
     * @param {number} limit - Maks kayit (default 100)
     * @returns {Promise<Array>}
     */
    async function loadFeed(sort, category, limit) {
        sort = sort || 'newest';
        category = category || 'all';
        limit = limit || 100;

        try {
            var query = sb().from('manifests').select('*');

            // Kategori filtresi
            if (category !== 'all') {
                query = query.eq('category', category);
            }

            // Weekly: son 7 gun
            if (sort === 'weekly') {
                var weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                query = query.gte('created_at', weekAgo.toISOString());
            }

            // Siralama
            query = query.order('created_at', { ascending: false }).limit(limit);

            var res = await query;

            if (res.error) {
                console.warn('[Manifest] Load error:', res.error);
                return [];
            }

            var manifests = res.data || [];

            // Her manifest icin like sayisini al
            if (manifests.length > 0) {
                var ids = manifests.map(function(m) { return m.id; });
                var likesRes = await sb()
                    .from('manifest_likes')
                    .select('manifest_id')
                    .in('manifest_id', ids);

                var likeCounts = {};
                if (likesRes.data) {
                    likesRes.data.forEach(function(l) {
                        likeCounts[l.manifest_id] = (likeCounts[l.manifest_id] || 0) + 1;
                    });
                }

                // Kullanicinin begendiklerini bul
                var userId = await getCurrentUserId();
                var userLikes = {};
                if (userId) {
                    var myLikesRes = await sb()
                        .from('manifest_likes')
                        .select('manifest_id')
                        .eq('user_id', userId)
                        .in('manifest_id', ids);

                    if (myLikesRes.data) {
                        myLikesRes.data.forEach(function(l) {
                            userLikes[l.manifest_id] = true;
                        });
                    }
                }

                // Manifest'lere like bilgisi ekle
                manifests.forEach(function(m) {
                    m.likes = likeCounts[m.id] || 0;
                    m.liked = !!userLikes[m.id];
                    m.isOwn = userId && m.user_id === userId;
                });
            }

            // Top rated veya weekly ise like'a gore sirala
            if (sort === 'top_rated' || sort === 'weekly') {
                manifests.sort(function(a, b) { return b.likes - a.likes; });
            }

            // Her manifeste isBot flag'i ekle
            manifests.forEach(function(m) {
                m.isBot = isFakeUser(m.user_id);
            });

            // Gercek kullanicilarin manifestlerini en üste çıkar
            // Her grup kendi içinde mevcut sıralamayı korur
            var realManifests = [];
            var botManifests = [];
            for (var r = 0; r < manifests.length; r++) {
                if (manifests[r].isBot) {
                    botManifests.push(manifests[r]);
                } else {
                    realManifests.push(manifests[r]);
                }
            }
            manifests = realManifests.concat(botManifests);

            console.log('[Manifest] Loaded', manifests.length, 'manifests (' + sort + '/' + category + ') — ' + realManifests.length + ' real, ' + botManifests.length + ' bot');
            return manifests;

        } catch(e) {
            console.warn('[Manifest] Load exception:', e);
            return [];
        }
    }

    // ─── TOGGLE LIKE ───────────────────────────────────
    /**
     * Manifest'i begen/begenmekten vazgec
     * @param {string} manifestId - Manifest UUID
     * @returns {Promise<{success:boolean, action:string, newCount:number}>}
     */
    async function toggleLike(manifestId) {
        var userId = await getCurrentUserId();
        if (!userId) {
            console.warn('[Manifest] toggleLike: No authenticated user');
            return { success: false, action: 'none', newCount: 0 };
        }

        try {
            // Mevcut like var mi kontrol et
            var existing = await sb()
                .from('manifest_likes')
                .select('id')
                .eq('manifest_id', manifestId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existing.error) {
                console.warn('[Manifest] Like check error:', existing.error);
            }

            if (existing.data) {
                // Unlike — sil
                var delRes = await sb().from('manifest_likes')
                    .delete()
                    .eq('manifest_id', manifestId)
                    .eq('user_id', userId);

                if (delRes.error) {
                    console.warn('[Manifest] Unlike delete error:', delRes.error);
                    return { success: false, action: 'error', newCount: 0 };
                }

                // Yeni like sayisini al
                var countRes = await sb().from('manifest_likes')
                    .select('id', { count: 'exact', head: true })
                    .eq('manifest_id', manifestId);
                var newCount = countRes.count || 0;
                console.log('[Manifest] Unliked', manifestId, '→', newCount);
                return { success: true, action: 'unliked', newCount: newCount };
            } else {
                // Like — ekle
                var insRes = await sb().from('manifest_likes').insert({
                    manifest_id: manifestId,
                    user_id: userId
                });

                if (insRes.error) {
                    console.warn('[Manifest] Like insert error:', insRes.error);
                    return { success: false, action: 'error', newCount: 0 };
                }

                // Yeni like sayisini al
                var countRes2 = await sb().from('manifest_likes')
                    .select('id', { count: 'exact', head: true })
                    .eq('manifest_id', manifestId);
                var newCount2 = countRes2.count || 0;
                console.log('[Manifest] Liked', manifestId, '→', newCount2);
                return { success: true, action: 'liked', newCount: newCount2 };
            }
        } catch(e) {
            console.warn('[Manifest] Like error:', e);
            return { success: false, action: 'error', newCount: 0 };
        }
    }

    // ─── GET MY MANIFESTS ──────────────────────────────
    /**
     * Kullanicinin kendi manifestlerini yukle (en yeni en ustte)
     * @returns {Promise<Array>}
     */
    async function getMyManifests() {
        var userId = await getCurrentUserId();
        if (!userId) {
            console.warn('[Manifest] No session for getMyManifests');
            return [];
        }

        try {
            var res = await sb().from('manifests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (res.error) {
                console.warn('[Manifest] getMyManifests error:', res.error);
                return [];
            }

            var manifests = res.data || [];

            // Like sayilarini al
            if (manifests.length > 0) {
                var ids = manifests.map(function(m) { return m.id; });
                var likesRes = await sb()
                    .from('manifest_likes')
                    .select('manifest_id')
                    .in('manifest_id', ids);

                var likeCounts = {};
                if (likesRes.data) {
                    likesRes.data.forEach(function(l) {
                        likeCounts[l.manifest_id] = (likeCounts[l.manifest_id] || 0) + 1;
                    });
                }

                manifests.forEach(function(m) {
                    m.likes = likeCounts[m.id] || 0;
                    m.isOwn = true;
                    m.isBot = false;
                });
            }

            console.log('[Manifest] My manifests:', manifests.length);
            return manifests;
        } catch(e) {
            console.warn('[Manifest] getMyManifests exception:', e);
            return [];
        }
    }

    // ─── DELETE ─────────────────────────────────────────
    /**
     * Kendi manifestimi sil
     * @param {string} manifestId - Manifest UUID
     * @returns {Promise<boolean>}
     */
    async function deleteMy(manifestId) {
        var userId = await getCurrentUserId();
        if (!userId) return false;

        try {
            var res = await sb().from('manifests').delete()
                .eq('id', manifestId)
                .eq('user_id', userId);

            if (res.error) {
                console.warn('[Manifest] Delete error:', res.error);
                return false;
            }
            console.log('[Manifest] Deleted', manifestId);
            return true;
        } catch(e) {
            console.warn('[Manifest] Delete exception:', e);
            return false;
        }
    }

    // ─── GLOBAL EXPORT ─────────────────────────────────
    window.manifestEngine = {
        save: save,
        loadFeed: loadFeed,
        toggleLike: toggleLike,
        getMyManifests: getMyManifests,
        deleteMy: deleteMy,
        isFakeUser: isFakeUser
    };

})();
