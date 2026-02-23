-- ═══════════════════════════════════════════════════════════
-- NUMERAEL — Avatar Storage Migration
-- Profil fotoğrafı yükleme altyapısı
-- ═══════════════════════════════════════════════════════════

-- 1. profiles tablosuna avatar_url kolonu ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. discovery_profiles tablosuna avatar_url kolonu ekle
ALTER TABLE discovery_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 3. avatars Storage bucket oluştur (public read, 2MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 4. RLS policy'leri

-- Herkes avatarları okuyabilir
CREATE POLICY "Public avatar read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Kullanıcı kendi klasörüne yükleyebilir (avatars/{userId}/*)
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Kullanıcı kendi avatarını güncelleyebilir
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Kullanıcı kendi avatarını silebilir
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
