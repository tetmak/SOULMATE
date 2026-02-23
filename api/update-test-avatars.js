/**
 * Geçici endpoint: Test hesaplarına cinsiyet bazlı gerçek fotoğraflar ata.
 * Bir kez çalıştırılıp silinecek.
 * Supabase REST API kullanır (SDK gerektirmez).
 *
 * GET /api/update-test-avatars
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const FEMALE_NAMES = ['şevval','ayşe','leyla','fatma','zeynep','elif','meryem','selin','buse','esra','merve','büşra','naz','nur','ece','derya','gül','pınar','havva','hatice','emine','hülya','sultan','yasemin','melek','cemre','defne','ilayda','irem','cansu','dilara','gamze','gizem','tuğba','ebru','aslı','özge','damla','beyza','aysun','sevgi','sibel','mine','deniz','ceren','duygu','didem','burcu','seda','başak','simge','gülay','sevim','yıldız','nihal','eda'];

function detectGender(name, dbGender) {
    if (dbGender === 'female' || dbGender === 'kadın') return 'female';
    if (dbGender === 'male' || dbGender === 'erkek') return 'male';
    const low = (name || '').toLowerCase().replace(/\s+/g, '');
    const isFem = FEMALE_NAMES.some(fn => low.startsWith(fn));
    return isFem ? 'female' : 'male';
}

async function supabaseGet(table, selectFields) {
    const url = SUPABASE_URL + '/rest/v1/' + table + '?select=' + encodeURIComponent(selectFields);
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
        }
    });
    if (!res.ok) throw new Error('GET ' + table + ' failed: ' + res.status);
    return res.json();
}

async function supabaseUpdate(table, filterCol, filterVal, data) {
    const url = SUPABASE_URL + '/rest/v1/' + table + '?' + filterCol + '=eq.' + filterVal;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    return res.ok;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!SUPABASE_SERVICE_KEY) {
        // Debug: hangi env var'lar var?
        const envKeys = Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ');
        return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY', available_supabase_keys: envKeys || 'none' });
    }

    // Fotoğraf havuzu
    const femalePhotos = [];
    const malePhotos = [];
    for (let i = 0; i < 50; i++) {
        femalePhotos.push('https://randomuser.me/api/portraits/women/' + i + '.jpg');
        malePhotos.push('https://randomuser.me/api/portraits/men/' + i + '.jpg');
    }

    try {
        const dpProfiles = await supabaseGet('discovery_profiles', 'user_id,full_name,gender,avatar_url');
        const profiles = await supabaseGet('profiles', 'id,full_name,gender,avatar_url');

        // Merge
        const allUsers = {};
        dpProfiles.forEach(dp => {
            allUsers[dp.user_id] = {
                user_id: dp.user_id,
                name: dp.full_name,
                gender: dp.gender,
                dp_avatar: dp.avatar_url,
                prof_avatar: null
            };
        });
        profiles.forEach(p => {
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
        const now = new Date().toISOString();

        for (const uid of Object.keys(allUsers)) {
            const u = allUsers[uid];
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

            updates.push(
                supabaseUpdate('profiles', 'id', uid, { avatar_url: photoUrl, updated_at: now }),
                supabaseUpdate('discovery_profiles', 'user_id', uid, { avatar_url: photoUrl, updated_at: now })
            );
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
}
