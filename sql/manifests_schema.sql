-- =====================================================
-- Manifest Community System — Tables, RLS, Indexes
-- Supabase SQL Editor'da calistirin
-- =====================================================

-- 1) Manifests tablosu
-- NOT: user_id FK yok — fake/bot kullanıcılar auth.users'da olmayabilir
CREATE TABLE IF NOT EXISTS manifests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    text TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('love','money','health','career','spiritual','general')),
    display_name TEXT,
    life_path INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Manifest Likes tablosu
-- NOT: user_id FK yok — fake/bot kullanıcılar auth.users'da olmayabilir
CREATE TABLE IF NOT EXISTS manifest_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manifest_id UUID NOT NULL REFERENCES manifests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(manifest_id, user_id)
);

-- 3) RLS — Manifests
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read manifests"
    ON manifests FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own manifests"
    ON manifests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manifests"
    ON manifests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manifests"
    ON manifests FOR DELETE
    USING (auth.uid() = user_id);

-- 4) RLS — Manifest Likes
ALTER TABLE manifest_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read manifest likes"
    ON manifest_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own likes"
    ON manifest_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON manifest_likes FOR DELETE
    USING (auth.uid() = user_id);

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_manifests_user_id ON manifests(user_id);
CREATE INDEX IF NOT EXISTS idx_manifests_category ON manifests(category);
CREATE INDEX IF NOT EXISTS idx_manifests_created_at ON manifests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manifest_likes_manifest ON manifest_likes(manifest_id);
CREATE INDEX IF NOT EXISTS idx_manifest_likes_user ON manifest_likes(user_id);

-- 6) Like count view (performans icin)
CREATE OR REPLACE VIEW manifest_with_likes AS
SELECT
    m.*,
    COALESCE(lc.like_count, 0) AS like_count
FROM manifests m
LEFT JOIN (
    SELECT manifest_id, COUNT(*) AS like_count
    FROM manifest_likes
    GROUP BY manifest_id
) lc ON lc.manifest_id = m.id;

-- =====================================================
-- SEED DATA — 35 Turce manifest
-- Fake kullanicilarin user_id'lerini buraya girin
-- Asagida placeholder UUID'ler var, gercek ID'lerle degistirin
-- =====================================================

-- Fake kullanici ID'leri icin:
-- Supabase Dashboard > Authentication > Users tablosundan alin
-- Ornek: INSERT INTO manifests (user_id, text, category, display_name, life_path) VALUES ('GERCEK-UUID', ...);

-- Seed komutunu calistirmadan once:
-- SELECT id, email FROM auth.users ORDER BY created_at;
-- ile kullanici ID'lerini alin.
