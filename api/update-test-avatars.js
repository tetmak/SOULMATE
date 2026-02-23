/**
 * Geçici endpoint: Test hesaplarına cinsiyet bazlı gerçek fotoğraflar ata.
 * Bir kez çalıştırılıp silinecek.
 *
 * GET /api/update-test-avatars
 */
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Sadece GET kabul et
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Missing env vars' });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Kadın ve erkek fotoğraf havuzu (randomuser.me - kalıcı URL'ler)
    const femalePhotos = [];
    const malePhotos = [];
    for (let i = 0; i < 50; i++) {
        femalePhotos.push('https://randomuser.me/api/portraits/women/' + i + '.jpg');
        malePhotos.push('https://randomuser.me/api/portraits/men/' + i + '.jpg');
    }

    // Türkçe kadın isim listesi (cinsiyet tespiti için)
    const FEMALE_NAMES = ['şevval','ayşe','leyla','fatma','zeynep','elif','meryem','selin','buse','esra','merve','büşra','naz','nur','ece','derya','gül','pınar','havva','hatice','emine','hülya','sultan','yasemin','melek','cemre','defne','ilayda','irem','cansu','dilara','gamze','gizem','tuğba','ebru','aslı','özge','damla','beyza','aysun','sevgi','sibel','mine','deniz','ceren','duygu','didem','burcu','seda','başak','simge','gülay','sevim','yıldız','nihal','eda'];

    function detectGender(name, dbGender) {
        if (dbGender === 'female' || dbGender === 'kadın') return 'female';
        if (dbGender === 'male' || dbGender === 'erkek') return 'male';
        const low = (name || '').toLowerCase().replace(/\s+/g, '');
        const isFem = FEMALE_NAMES.some(fn => low.startsWith(fn));
        return isFem ? 'female' : 'male';
    }

    try {
        // 1. Tüm discovery_profiles'ı çek
        const { data: dpProfiles, error: dpErr } = await supabase
            .from('discovery_profiles')
            .select('user_id, full_name, gender, avatar_url');

        if (dpErr) throw dpErr;

        // 2. Tüm profiles'ı çek
        const { data: profiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, full_name, gender, avatar_url');

        if (profErr) throw profErr;

        // Merge - tüm benzersiz user_id'leri bul
        const allUsers = {};
        (dpProfiles || []).forEach(dp => {
            allUsers[dp.user_id] = {
                user_id: dp.user_id,
                name: dp.full_name,
                gender: dp.gender,
                dp_avatar: dp.avatar_url,
                prof_avatar: null
            };
        });
        (profiles || []).forEach(p => {
            if (allUsers[p.id]) {
                allUsers[p.id].prof_avatar = p.avatar_url;
                if (!allUsers[p.id].name) allUsers[p.id].name = p.full_name;
                if (!allUsers[p.id].gender) allUsers[p.id].gender = p.gender;
            } else {
                allUsers[p.id] = {
                    user_id: p.id,
                    name: p.full_name,
                    gender: p.gender,
                    dp_avatar: null,
                    prof_avatar: p.avatar_url
                };
            }
        });

        let femIdx = 0;
        let maleIdx = 0;
        const updates = [];
        const results = [];

        for (const uid of Object.keys(allUsers)) {
            const u = allUsers[uid];
            // Zaten custom avatar varsa atla (Supabase Storage URL ise)
            const existingAvatar = u.dp_avatar || u.prof_avatar;
            if (existingAvatar && existingAvatar.includes('supabase.co/storage')) {
                results.push({ name: u.name, skipped: true, reason: 'has_custom_avatar' });
                continue;
            }

            const gender = detectGender(u.name, u.gender);
            let photoUrl;

            if (gender === 'female') {
                photoUrl = femalePhotos[femIdx % femalePhotos.length];
                femIdx++;
            } else {
                photoUrl = malePhotos[maleIdx % malePhotos.length];
                maleIdx++;
            }

            // profiles tablosu güncelle
            const p1 = supabase.from('profiles').update({
                avatar_url: photoUrl,
                updated_at: new Date().toISOString()
            }).eq('id', uid);

            // discovery_profiles tablosu güncelle
            const p2 = supabase.from('discovery_profiles').update({
                avatar_url: photoUrl,
                updated_at: new Date().toISOString()
            }).eq('user_id', uid);

            updates.push(Promise.all([p1, p2]));
            results.push({ name: u.name, gender, photoUrl, updated: true });
        }

        await Promise.all(updates);

        return res.status(200).json({
            success: true,
            total: Object.keys(allUsers).length,
            updated: results.filter(r => r.updated).length,
            skipped: results.filter(r => r.skipped).length,
            details: results
        });

    } catch (err) {
        return res.status(500).json({ error: err.message || String(err) });
    }
};
