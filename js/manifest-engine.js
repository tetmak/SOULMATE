/**
 * NUMERAEL — Manifest Engine
 * Supabase-backed community manifest CRUD + likes
 * Kullanim: <script src="js/manifest-engine.js"></script>
 */
(function() {
    'use strict';

    // ─── Helpers ───────────────────────────────────────
    function sb() { return window.supabaseClient; }

    function getSession() {
        try {
            var s = JSON.parse(localStorage.getItem('numerael-auth-token') || 'null');
            return (s && s.user) ? s : null;
        } catch(e) { return null; }
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
        var session = getSession();
        if (!session || !session.user) {
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
                user_id: session.user.id,
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
                var session = getSession();
                var userLikes = {};
                if (session && session.user) {
                    var myLikesRes = await sb()
                        .from('manifest_likes')
                        .select('manifest_id')
                        .eq('user_id', session.user.id)
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
                    m.isOwn = session && session.user && m.user_id === session.user.id;
                });
            }

            // Top rated veya weekly ise like'a gore sirala
            if (sort === 'top_rated' || sort === 'weekly') {
                manifests.sort(function(a, b) { return b.likes - a.likes; });
            }

            console.log('[Manifest] Loaded', manifests.length, 'manifests (' + sort + '/' + category + ')');
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
        var session = getSession();
        if (!session || !session.user) {
            return { success: false, action: 'none', newCount: 0 };
        }

        try {
            // Mevcut like var mi kontrol et
            var existing = await sb()
                .from('manifest_likes')
                .select('id')
                .eq('manifest_id', manifestId)
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (existing.data) {
                // Unlike — sil
                await sb().from('manifest_likes').delete().eq('id', existing.data.id);
                var countRes = await sb().from('manifest_likes').select('id', { count: 'exact', head: true }).eq('manifest_id', manifestId);
                var newCount = countRes.count || 0;
                console.log('[Manifest] Unliked', manifestId, '→', newCount);
                return { success: true, action: 'unliked', newCount: newCount };
            } else {
                // Like — ekle
                await sb().from('manifest_likes').insert({
                    manifest_id: manifestId,
                    user_id: session.user.id
                });
                var countRes2 = await sb().from('manifest_likes').select('id', { count: 'exact', head: true }).eq('manifest_id', manifestId);
                var newCount2 = countRes2.count || 0;
                console.log('[Manifest] Liked', manifestId, '→', newCount2);
                return { success: true, action: 'liked', newCount: newCount2 };
            }
        } catch(e) {
            console.warn('[Manifest] Like error:', e);
            return { success: false, action: 'error', newCount: 0 };
        }
    }

    // ─── DELETE ─────────────────────────────────────────
    /**
     * Kendi manifestimi sil
     * @param {string} manifestId - Manifest UUID
     * @returns {Promise<boolean>}
     */
    async function deleteMy(manifestId) {
        var session = getSession();
        if (!session || !session.user) return false;

        try {
            var res = await sb().from('manifests').delete()
                .eq('id', manifestId)
                .eq('user_id', session.user.id);

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
        deleteMy: deleteMy
    };

})();
