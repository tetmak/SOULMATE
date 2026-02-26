-- =====================================================
-- Manifest Weekly Champions — Haftalık kazanan arşivi
-- Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1) Champions tablosu
CREATE TABLE IF NOT EXISTS manifest_weekly_champions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start DATE NOT NULL,
    original_manifest_id UUID,
    user_id UUID NOT NULL,
    text TEXT NOT NULL,
    category TEXT,
    display_name TEXT,
    life_path INT,
    like_count INT DEFAULT 0,
    is_real_user BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) RLS
ALTER TABLE manifest_weekly_champions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read champions"
    ON manifest_weekly_champions FOR SELECT
    USING (true);

-- INSERT/UPDATE/DELETE sadece service role ile yapilir (cron job)
-- Anon/authenticated kullanicilar yazamaz

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_champions_week ON manifest_weekly_champions(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_champions_likes ON manifest_weekly_champions(like_count DESC);
