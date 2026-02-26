-- ═══════════════════════════════════════════════════════════
-- NUMERAEL — Fake Discovery Profile Temizleme
-- Supabase Dashboard → SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────
-- ADIM 1: Tüm discovery profilleri listele (inceleme amaçlı)
-- ──────────────────────────────────────────────────────────
SELECT
    dp.user_id,
    dp.full_name,
    dp.gender,
    dp.life_path,
    dp.birth_date,
    dp.discoverable,
    dp.created_at,
    CASE
        WHEN au.id IS NULL THEN '❌ AUTH YOK (FAKE)'
        WHEN p.id IS NULL THEN '⚠️ PROFIL YOK (ŞÜPHELİ)'
        ELSE '✅ GERÇEK'
    END AS durum
FROM discovery_profiles dp
LEFT JOIN auth.users au ON au.id = dp.user_id
LEFT JOIN profiles p ON p.id = dp.user_id
ORDER BY
    CASE
        WHEN au.id IS NULL THEN 0
        WHEN p.id IS NULL THEN 1
        ELSE 2
    END,
    dp.created_at;

-- ──────────────────────────────────────────────────────────
-- ADIM 2: Auth.users tablosunda karşılığı OLMAYAN profilleri sil
-- (Bunlar kesinlikle fake — service_role ile eklenmiş)
-- ──────────────────────────────────────────────────────────
-- Önce ilgili daily_matches kayıtlarını temizle
DELETE FROM daily_matches
WHERE matched_user_id IN (
    SELECT dp.user_id FROM discovery_profiles dp
    LEFT JOIN auth.users au ON au.id = dp.user_id
    WHERE au.id IS NULL
)
OR user_id IN (
    SELECT dp.user_id FROM discovery_profiles dp
    LEFT JOIN auth.users au ON au.id = dp.user_id
    WHERE au.id IS NULL
);

-- Sonra fake discovery profilleri sil
DELETE FROM discovery_profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ──────────────────────────────────────────────────────────
-- ADIM 3: Profiles tablosunda karşılığı olmayan discovery profilleri sil
-- (Auth var ama normal kayıt akışından geçmemiş — muhtemelen test)
-- ──────────────────────────────────────────────────────────
-- Bu adımı çalıştırmadan önce ADIM 1 sonucunu kontrol edin!
-- Emin olduğunuz profilleri silebilirsiniz:

-- DELETE FROM daily_matches
-- WHERE matched_user_id IN (
--     SELECT dp.user_id FROM discovery_profiles dp
--     LEFT JOIN profiles p ON p.id = dp.user_id
--     WHERE p.id IS NULL
-- )
-- OR user_id IN (
--     SELECT dp.user_id FROM discovery_profiles dp
--     LEFT JOIN profiles p ON p.id = dp.user_id
--     WHERE p.id IS NULL
-- );
--
-- DELETE FROM discovery_profiles
-- WHERE user_id NOT IN (SELECT id FROM profiles);

-- ──────────────────────────────────────────────────────────
-- ADIM 4: Doğrulama — kalan profillerin hepsi gerçek mi?
-- ──────────────────────────────────────────────────────────
SELECT
    dp.user_id,
    dp.full_name,
    dp.gender,
    dp.life_path,
    dp.discoverable,
    p.full_name AS profiles_name,
    au.email
FROM discovery_profiles dp
JOIN auth.users au ON au.id = dp.user_id
JOIN profiles p ON p.id = dp.user_id
ORDER BY dp.created_at;
