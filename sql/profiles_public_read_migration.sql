-- ═══════════════════════════════════════════════════════════
-- PROFILES: Authenticated kullanıcılar diğer profilleri okuyabilsin
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın.
-- ═══════════════════════════════════════════════════════════

-- Mevcut kısıtlayıcı policy'yi kaldır (sadece kendi profilini okuyabilir)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Yeni permissive policy: giriş yapmış herkes tüm profilleri okuyabilir
-- (Bağlantı istekleri, mesajlaşma, ve connections sayfası için gerekli)
CREATE POLICY "Authenticated users can read profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- INSERT ve UPDATE policy'leri aynı kalır — kullanıcı sadece kendi profilini yazabilir
