/**
 * NUMERAEL — Daily Manifest Cron Job
 * Her gün fake kullanıcılardan yeni manifestler + beğeniler oluşturur.
 * Vercel Cron: her gün 09:00 UTC (Türkiye 12:00)
 */

// ─── Fake kullanıcı havuzu ────────────────────────────
const FAKE_USERS = [
    { id: '197028bd-1437-4e1e-9f80-23aa911b3a83', name: 'Elif', lp: 7 },
    { id: 'df133f11-cffa-4a8c-a730-3d2aeb3777c1', name: 'Zeynep', lp: 11 },
    { id: '1904ad8a-8cd4-4581-a31c-5a71e8c3819b', name: 'Ayşe', lp: 9 },
    { id: '9227c768-cd43-4620-affb-2b83b989f21c', name: 'Selin', lp: 4 },
    { id: 'aa686093-14db-4af6-b31c-1fe44b290884', name: 'Merve', lp: 11 },
    { id: '588c5b08-4964-4a19-adc5-a004124cc818', name: 'Büşra', lp: 1 },
    { id: 'c0121793-1a75-4aae-ae9a-275642a4badb', name: 'Cansu', lp: 9 },
    { id: 'b3b873bb-ba5f-4172-bb8e-ecb93a9a8161', name: 'Defne', lp: 22 },
    { id: '887a6780-1f50-4f7d-81b1-ba8e83c7bccb', name: 'İrem', lp: 7 },
    { id: '61b8111e-1300-481c-ae79-445b9c96c9c5', name: 'Naz', lp: 8 },
    { id: '09afa18e-e79a-4a45-a1ba-aa53c688874b', name: 'Pınar', lp: 3 },
    { id: 'e33492ac-7f50-4fbb-8211-8ba1df23cc71', name: 'Gizem', lp: 6 },
    { id: '44b5e069-b34c-44e4-9912-d0606161dbff', name: 'Deniz', lp: 9 },
    { id: '650a8088-0f2b-490e-a5b9-9544949f5981', name: 'Esra', lp: 2 },
    { id: '012d1483-ba04-457f-b546-02cb221c3658', name: 'Hande', lp: 11 },
    { id: '5e8321d4-e52c-4cb5-831e-46674234e85d', name: 'Burak', lp: 3 },
    { id: '92da8501-0946-402c-9e51-dc66850785b4', name: 'Emre', lp: 5 },
    { id: '54f6d2ae-179e-47e6-9c3a-ba3b8e1af4c1', name: 'Mehmet', lp: 33 },
    { id: 'b38acf4e-5b23-4b09-8f46-c276d7c626dc', name: 'Cem', lp: 5 },
    { id: '3d0cc7e7-5aa9-46f6-be0d-cd53ede04961', name: 'Kaan', lp: 1 },
    { id: 'fd0cb355-91a2-48d5-aa07-085007fd4a05', name: 'Onur P.', lp: 5 },
    { id: 'b1cc59ad-697a-49ca-af7f-a1d952b8e274', name: 'Tolga', lp: 4 },
    { id: 'dff3a1ce-279c-4cdc-bf83-6192309d852f', name: 'Barış', lp: 6 },
    { id: 'c730dd3d-c4ae-4ac9-8d07-4070f95e10fd', name: 'Serkan', lp: 6 },
    { id: '6c7b0bc9-b5fb-46c1-b1a7-c560d27c833a', name: 'Hakan', lp: 7 },
    { id: '9a436ee9-7c4c-4dd4-9530-661dea38833c', name: 'Ali', lp: 2 },
    { id: 'a1e20d8d-387f-429c-9fbd-8739a4ebaa40', name: 'Murat', lp: 8 },
    { id: 'de0be15a-a940-4225-9f61-9e4b6b9a2848', name: 'Volkan', lp: 4 },
    { id: '707c0e54-b93f-4338-8f9d-f2996a8f5734', name: 'Yusuf', lp: 33 },
    { id: '6992f7c2-29a9-4e2b-bb00-a0b49febdbbf', name: 'Oğuzhan', lp: 3 }
];

// ─── Manifest metin havuzu (kategori bazlı) ───────────
const TEXTS = {
    love: [
        'Bugün kalbimi sevgiye açıyorum, evren karşılık veriyor.',
        'Aşk enerjim her geçen gün daha güçlü titreşiyor.',
        'Ruh eşim bana yaklaşıyor, bunu tüm kalbimle hissediyorum.',
        'Sevgiyle dolu bir ilişki manifest ediyorum, hak ediyorum.',
        'Kalbimin kapıları sonuna kadar açık, sevgi akıyor.',
        'Bugün birine gülümsedim ve evren bana sevgiyle karşılık verdi.',
        'İlişkilerimde samimiyet ve güven çiçek açıyor.',
        'Sevgi dilimi keşfettim, artık daha derin bağlanıyorum.',
        'Koşulsuz sevgiyi önce kendime veriyorum, sonra dünyaya.',
        'Aşk hayatım her gün daha güzel bir hikaye yazıyor.',
        'Romantik enerjim yükseliyor, doğru kişiyi çekiyorum.',
        'Kalbim şifa buluyor, yeni bir aşka hazırlanıyorum.',
        'Evrenin bana layık gördüğü sevgi muhteşem olacak.',
        'Bugün sevgi frekansını yükseltiyorum, etrafım aydınlanıyor.',
        'İkiz ruhum bu evrende ve ben ona doğru yürüyorum.'
    ],
    money: [
        'Bugün beklenmedik bir bereket kapısı açıldı.',
        'Para enerjisi özgürce hayatıma akıyor.',
        'Finansal bolluk benim doğal halim, bunu kabul ediyorum.',
        'Yeni gelir kaynakları hayatıma girmek için sıraya girdi.',
        'Bugün attığım her adım beni refaha yaklaştırıyor.',
        'Bereket tohumu ektim, hasat zamanı yaklaşıyor.',
        'Maddi endişelerimi bırakıyorum, evren beni destekliyor.',
        'Cüzdanım dolup taşıyor, şükranla karşılıyorum.',
        'Yatırımlarım büyüyor, finansal özgürlüğüm yakın.',
        'Bugün bolluğa layık olduğumu hatırladım.',
        'Para bir enerji ve ben onunla uyum içindeyim.',
        'Hayatıma giren her kuruş katlanarak geri dönüyor.',
        'Evren benim için sonsuz bolluk kaynağı açıyor.',
        'Kariyer başarım maddi refaha dönüşüyor.',
        'Bugün şükranla yaşıyorum ve bereket çoğalıyor.'
    ],
    health: [
        'Bugün bedenime teşekkür ediyorum, o benim tapınağım.',
        'Her hücrem yenilenmeyle titreşiyor, sağlığım mükemmel.',
        'Sabah enerjim dorukta, gün boyu canlı hissediyorum.',
        'Zihinim berrak, bedenim güçlü, ruhum huzurlu.',
        'Bugün kendime şifalı bir gün hediye ediyorum.',
        'Nefes alıyorum ve her nefeste sağlık doluyorum.',
        'Stres vücudumdan çıkıyor, yerini huzur alıyor.',
        'Uyku düzenim harika, sabahları güneşle uyanıyorum.',
        'Bedenimi hareket ettirdikçe enerji katlanıyor.',
        'Sağlıklı seçimler yapıyorum, vücudum teşekkür ediyor.',
        'Bugün su içtim, yürüdüm ve kendimi harika hissediyorum.',
        'Bağışıklık sistemim güçleniyor, hastalık bana yaklaşamıyor.',
        'Her gün biraz daha güçlü, biraz daha sağlıklıyım.',
        'Vücudum kendini iyileştirme gücüne sahip, güveniyorum.',
        'Enerjim yükseldi, bugün dağları devirmek istiyorum.'
    ],
    career: [
        'Bugün hayalimdeki projeye bir adım daha yaklaştım.',
        'Kariyer hedeflerim netleşiyor, yolum aydınlık.',
        'Yaratıcılığım sınır tanımıyor, fikirlerim akıyor.',
        'Bugün aldığım karar geleceğimi şekillendirecek.',
        'Profesyonel hayatımda büyük bir dönüşüm başlıyor.',
        'Yeteneklerim fark ediliyor, yükselişim kaçınılmaz.',
        'Liderlik enerjim güçleniyor, ekibime ilham veriyorum.',
        'Bugün cesur bir adım attım ve kendimle gurur duyuyorum.',
        'Tutkulu olduğum işte başarıya ulaşıyorum.',
        'Yeni fırsatlar kapımı çalıyor, hepsine açığım.',
        'İş hayatımda denge buldum, hem üretken hem mutluyum.',
        'Bugün bir şeyi başardım ve bu sadece başlangıç.',
        'Kariyerimde yeni bir sayfa açıyorum, heyecanlıyım.',
        'Evren beni doğru pozisyona yönlendiriyor.',
        'Başarı benim için kaçınılmaz, çünkü vazgeçmiyorum.'
    ],
    spiritual: [
        'Bugün meditasyonumda derin bir huzur buldum.',
        'Sezgilerim güçleniyor, evrenin mesajlarını duyuyorum.',
        'Ruhsal yolculuğum en güzel aşamasında.',
        'Bugün evrene güvendim ve her şey akışına girdi.',
        'Üçüncü gözüm açılıyor, gerçekleri daha net görüyorum.',
        'Kozmik enerji bedenimi sarmalıyor, arınıyorum.',
        'Bugün doğayla bağlantı kurdum, ruhum beslendi.',
        'Farkındalığım derinleşiyor, anı yaşamayı öğreniyorum.',
        'Evrenle olan bağım her gün daha güçlü.',
        'Bugün bir işaret aldım, doğru yolda olduğumu biliyorum.',
        'Şükran pratiğim hayatımı dönüştürüyor.',
        'Ruhum hafifliyor, eski yüklerimi bırakıyorum.',
        'Bugün kendimle barıştım, iç huzurum muhteşem.',
        'Meditasyon sonrası tüm evren gülümsüyor gibi hissediyorum.',
        'Spiritüel uyanışım her gün yeni kapılar açıyor.'
    ]
};

const CATEGORIES = ['love', 'money', 'health', 'career', 'spiritual'];

// ─── Yardımcı fonksiyonlar ────────────────────────────
function pickRandom(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Handler ──────────────────────────────────────────
export default async function handler(req, res) {
    // Cron secret kontrolü (opsiyonel güvenlik)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Missing Supabase config' });
    }

    try {
        // Bugün kaç manifest oluşturulacak (3-6 arası)
        const manifestCount = 3 + Math.floor(Math.random() * 4);

        // Rastgele kullanıcılar seç
        const selectedUsers = pickRandom(FAKE_USERS, manifestCount);

        const newManifests = [];

        for (const user of selectedUsers) {
            const category = randomFrom(CATEGORIES);
            const text = randomFrom(TEXTS[category]);

            newManifests.push({
                user_id: user.id,
                text: text,
                category: category,
                display_name: user.name,
                life_path: user.lp
            });
        }

        // Manifestleri Supabase'e ekle
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/manifests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newManifests)
        });

        if (!insertRes.ok) {
            const err = await insertRes.text();
            console.error('[ManifestCron] Insert failed:', err);
            return res.status(500).json({ error: 'Insert failed', details: err });
        }

        const inserted = await insertRes.json();
        const insertedIds = inserted.map(m => m.id);

        // Her yeni manifeste rastgele like'lar ekle (2-8 arası)
        const allLikes = [];
        for (const manifest of inserted) {
            const likeCount = 2 + Math.floor(Math.random() * 7);
            const likers = pickRandom(
                FAKE_USERS.filter(u => u.id !== manifest.user_id),
                likeCount
            );

            for (const liker of likers) {
                allLikes.push({
                    manifest_id: manifest.id,
                    user_id: liker.id
                });
            }
        }

        if (allLikes.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/manifest_likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'resolution=ignore-duplicates'
                },
                body: JSON.stringify(allLikes)
            });
        }

        // Eski manifestlere de birkaç yeni like ekle (canlılık)
        const oldManifestsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/manifests?select=id,user_id&order=created_at.desc&limit=20&id=not.in.(${insertedIds.join(',')})`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (oldManifestsRes.ok) {
            const oldManifests = await oldManifestsRes.json();
            const oldLikes = [];
            // Eski manifestlerden rastgele 3-5 tanesine yeni like ekle
            const toGetLikes = pickRandom(oldManifests, Math.min(5, oldManifests.length));

            for (const old of toGetLikes) {
                const likerCount = 1 + Math.floor(Math.random() * 3);
                const likers = pickRandom(
                    FAKE_USERS.filter(u => u.id !== old.user_id),
                    likerCount
                );
                for (const liker of likers) {
                    oldLikes.push({
                        manifest_id: old.id,
                        user_id: liker.id
                    });
                }
            }

            if (oldLikes.length > 0) {
                await fetch(`${SUPABASE_URL}/rest/v1/manifest_likes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'resolution=ignore-duplicates'
                    },
                    body: JSON.stringify(oldLikes)
                });
            }
        }

        console.log(`[ManifestCron] Created ${inserted.length} manifests, ${allLikes.length} likes`);

        return res.status(200).json({
            success: true,
            manifests_created: inserted.length,
            likes_added: allLikes.length,
            users: selectedUsers.map(u => u.name)
        });

    } catch (e) {
        console.error('[ManifestCron] Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
