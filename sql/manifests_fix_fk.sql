-- =====================================================
-- FIX: FK constraint kaldır + seed data yeniden yükle
-- Supabase SQL Editor'da çalıştırın
-- =====================================================
-- Problem: manifests.user_id ve manifest_likes.user_id
-- auth.users(id)'ye FK referans ediyor. Fake kullanıcı
-- UUID'leri auth.users'da olmadığı için INSERT yapılamıyor.
-- =====================================================

-- 1) Mevcut verileri temizle (varsa bozuk kalmış)
DELETE FROM manifest_likes;
DELETE FROM manifests;

-- 2) FK constraint'leri bul ve kaldır
DO $$
DECLARE
    r RECORD;
BEGIN
    -- manifests tablosundaki FK constraint'leri kaldır
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'manifests'
        AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE manifests DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped FK constraint: % from manifests', r.constraint_name;
    END LOOP;

    -- manifest_likes tablosundaki FK constraint'leri kaldır
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'manifest_likes'
        AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE manifest_likes DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped FK constraint: % from manifest_likes', r.constraint_name;
    END LOOP;
END $$;

-- 3) SEED: 35 Türkçe manifest
INSERT INTO manifests (user_id, text, category, display_name, life_path, created_at) VALUES
-- AŞK (7 adet)
('197028bd-1437-4e1e-9f80-23aa911b3a83', 'Evrenin bana gönderdiği sevgiyi açık kalplerle karşılıyorum.', 'love', 'Elif', 7, now() - interval '2 days'),
('3d0cc7e7-5aa9-46f6-be0d-cd53ede04961', 'Gerçek aşk beni buluyor, kalbim hazır.', 'love', 'Kaan', 1, now() - interval '4 days'),
('b3b873bb-ba5f-4172-bb8e-ecb93a9a8161', 'Ruh eşimle karşılaşma anı yaklaşıyor, hissediyorum.', 'love', 'Defne', 22, now() - interval '1 day'),
('44b5e069-b34c-44e4-9912-d0606161dbff', 'İlişkilerimde denge ve uyum manifest ediyorum.', 'love', 'Deniz', 9, now() - interval '5 days'),
('61b8111e-1300-481c-ae79-445b9c96c9c5', 'Sevgi frekansında titreşiyorum, etrafımdaki herkes hissediyor.', 'love', 'Naz', 8, now() - interval '3 days'),
('09afa18e-e79a-4a45-a1ba-aa53c688874b', 'Kalbimin sesini dinliyorum, doğru kişi geliyor.', 'love', 'Pınar', 3, now() - interval '6 days'),
('aa686093-14db-4af6-b31c-1fe44b290884', 'Aşk enerjim evrenle rezonansa giriyor.', 'love', 'Merve', 11, now() - interval '2 days'),

-- PARA (7 adet)
('5e8321d4-e52c-4cb5-831e-46674234e85d', 'Bolluk ve bereket hayatımın her alanına akıyor.', 'money', 'Burak', 3, now() - interval '1 day'),
('887a6780-1f50-4f7d-81b1-ba8e83c7bccb', 'Finansal özgürlüğüm her geçen gün büyüyor.', 'money', 'İrem', 7, now() - interval '3 days'),
('707c0e54-b93f-4338-8f9d-f2996a8f5734', 'Maddi engeller kalkıyor, refah kapım açılıyor.', 'money', 'Yusuf', 33, now() - interval '5 days'),
('012d1483-ba04-457f-b546-02cb221c3658', 'Beklenmedik gelir kaynakları hayatıma giriyor.', 'money', 'Hande', 11, now() - interval '2 days'),
('650a8088-0f2b-490e-a5b9-9544949f5981', 'Yatırımlarım meyvesini veriyor, bereket çoğalıyor.', 'money', 'Esra', 2, now() - interval '4 days'),
('b38acf4e-5b23-4b09-8f46-c276d7c626dc', 'Para enerjisiyle barışıyorum, bolluk doğal halim.', 'money', 'Cem', 5, now() - interval '6 days'),
('a1e20d8d-387f-429c-9fbd-8739a4ebaa40', 'Hayatıma bereketle dolu insanlar çekiyorum.', 'money', 'Murat', 8, now() - interval '1 day'),

-- SAĞLIK (7 adet)
('1904ad8a-8cd4-4581-a31c-5a71e8c3819b', 'Bedenim sağlıkla dolu, her hücrem ışıkla titreşiyor.', 'health', 'Ayşe', 9, now() - interval '2 days'),
('92da8501-0946-402c-9e51-dc66850785b4', 'Enerjim yükseliyor, zihinim berrak ve güçlü.', 'health', 'Emre', 5, now() - interval '4 days'),
('6992f7c2-29a9-4e2b-bb00-a0b49febdbbf', 'Bedenime sevgiyle yaklaşıyorum, kendimi iyileştiriyorum.', 'health', 'Oğuzhan', 3, now() - interval '1 day'),
('b1cc59ad-697a-49ca-af7f-a1d952b8e274', 'Uykularım derin, sabahlarım enerjik başlıyor.', 'health', 'Tolga', 4, now() - interval '5 days'),
('c730dd3d-c4ae-4ac9-8d07-4070f95e10fd', 'Stres vücudumdan akıp gidiyor, huzurla doluyorum.', 'health', 'Serkan', 6, now() - interval '3 days'),
('de0be15a-a940-4225-9f61-9e4b6b9a2848', 'Sağlığım mükemmel, vücudum kendini yeniliyor.', 'health', 'Volkan', 4, now() - interval '6 days'),
('c0121793-1a75-4aae-ae9a-275642a4badb', 'Vücudum bir tapınak, ona saygıyla davranıyorum.', 'health', 'Cansu', 9, now() - interval '2 days'),

-- KARİYER (7 adet)
('9227c768-cd43-4620-affb-2b83b989f21c', 'Hayalimdeki işe kavuşuyorum, evren kapıları açıyor.', 'career', 'Selin', 4, now() - interval '1 day'),
('e33492ac-7f50-4fbb-8211-8ba1df23cc71', 'Yaratıcılığım sınırsız, projelerim başarıya ulaşıyor.', 'career', 'Gizem', 6, now() - interval '3 days'),
('588c5b08-4964-4a19-adc5-a004124cc818', 'Liderlik enerjim yükseliyor, takımım bana güveniyor.', 'career', 'Büşra', 1, now() - interval '5 days'),
('54f6d2ae-179e-47e6-9c3a-ba3b8e1af4c1', 'Tutkulu olduğum alanda büyük başarılar elde ediyorum.', 'career', 'Mehmet', 33, now() - interval '2 days'),
('6c7b0bc9-b5fb-46c1-b1a7-c560d27c833a', 'Yeni fırsatlar kapımı çalıyor, cesaretle açıyorum.', 'career', 'Hakan', 7, now() - interval '4 days'),
('fd0cb355-91a2-48d5-aa07-085007fd4a05', 'Kariyerimde zirveye yürüyorum, adımlarım emin.', 'career', 'Onur P.', 5, now() - interval '6 days'),
('9a436ee9-7c4c-4dd4-9530-661dea38833c', 'Kariyer yolculuğumda evrenin rehberliğine güveniyorum.', 'career', 'Ali', 2, now() - interval '1 day'),

-- RUH (7 adet)
('df133f11-cffa-4a8c-a730-3d2aeb3777c1', 'Ruhum her gün daha derin bir farkındalıkla uyanıyor.', 'spiritual', 'Zeynep', 11, now() - interval '1 day'),
('dff3a1ce-279c-4cdc-bf83-6192309d852f', 'İç huzurum dış dünyama yansıyor, her şey akışında.', 'spiritual', 'Barış', 6, now() - interval '3 days'),
('887a6780-1f50-4f7d-81b1-ba8e83c7bccb', 'Meditasyonlarım derinleşiyor, evrenle bağlantım güçleniyor.', 'spiritual', 'İrem', 7, now() - interval '5 days'),
('3d0cc7e7-5aa9-46f6-be0d-cd53ede04961', 'Üçüncü gözüm açılıyor, sezgilerim güçleniyor.', 'spiritual', 'Kaan', 1, now() - interval '2 days'),
('61b8111e-1300-481c-ae79-445b9c96c9c5', 'Kozmik enerji bedenimi ve ruhumu arındırıyor.', 'spiritual', 'Naz', 8, now() - interval '4 days'),
('09afa18e-e79a-4a45-a1ba-aa53c688874b', 'Her nefeste evrenle daha derin bağlanıyorum.', 'spiritual', 'Pınar', 3, now() - interval '6 days'),
('44b5e069-b34c-44e4-9912-d0606161dbff', 'Ruhsal yolculuğum en güzel meyvelerini veriyor.', 'spiritual', 'Deniz', 22, now() - interval '1 day');

-- 4) SEED LIKES — Her manifest'e rastgele 3-18 like ekle
DO $$
DECLARE
    m_rec RECORD;
    liker_id UUID;
    liker_ids UUID[] := ARRAY[
        '197028bd-1437-4e1e-9f80-23aa911b3a83',
        'df133f11-cffa-4a8c-a730-3d2aeb3777c1',
        '1904ad8a-8cd4-4581-a31c-5a71e8c3819b',
        '9227c768-cd43-4620-affb-2b83b989f21c',
        'aa686093-14db-4af6-b31c-1fe44b290884',
        '588c5b08-4964-4a19-adc5-a004124cc818',
        'c0121793-1a75-4aae-ae9a-275642a4badb',
        'b3b873bb-ba5f-4172-bb8e-ecb93a9a8161',
        '887a6780-1f50-4f7d-81b1-ba8e83c7bccb',
        '61b8111e-1300-481c-ae79-445b9c96c9c5',
        '09afa18e-e79a-4a45-a1ba-aa53c688874b',
        'e33492ac-7f50-4fbb-8211-8ba1df23cc71',
        '44b5e069-b34c-44e4-9912-d0606161dbff',
        '650a8088-0f2b-490e-a5b9-9544949f5981',
        '012d1483-ba04-457f-b546-02cb221c3658',
        '5e8321d4-e52c-4cb5-831e-46674234e85d',
        '92da8501-0946-402c-9e51-dc66850785b4',
        '54f6d2ae-179e-47e6-9c3a-ba3b8e1af4c1',
        'b38acf4e-5b23-4b09-8f46-c276d7c626dc',
        '3d0cc7e7-5aa9-46f6-be0d-cd53ede04961',
        'fd0cb355-91a2-48d5-aa07-085007fd4a05',
        'b1cc59ad-697a-49ca-af7f-a1d952b8e274',
        'dff3a1ce-279c-4cdc-bf83-6192309d852f',
        'c730dd3d-c4ae-4ac9-8d07-4070f95e10fd',
        '6c7b0bc9-b5fb-46c1-b1a7-c560d27c833a',
        '9a436ee9-7c4c-4dd4-9530-661dea38833c',
        'a1e20d8d-387f-429c-9fbd-8739a4ebaa40',
        'de0be15a-a940-4225-9f61-9e4b6b9a2848',
        '707c0e54-b93f-4338-8f9d-f2996a8f5734',
        '6992f7c2-29a9-4e2b-bb00-a0b49febdbbf'
    ];
    like_count INT;
    j INT;
BEGIN
    FOR m_rec IN SELECT id, user_id FROM manifests ORDER BY created_at ASC LOOP
        like_count := 3 + floor(random() * 16)::int;
        FOR j IN 1..like_count LOOP
            liker_id := liker_ids[1 + floor(random() * 30)::int];
            IF liker_id != m_rec.user_id THEN
                INSERT INTO manifest_likes (manifest_id, user_id)
                VALUES (m_rec.id, liker_id)
                ON CONFLICT (manifest_id, user_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- 5) Kontrol: kaç manifest ve like var?
SELECT 'manifests' as tablo, COUNT(*) as adet FROM manifests
UNION ALL
SELECT 'manifest_likes', COUNT(*) FROM manifest_likes;
