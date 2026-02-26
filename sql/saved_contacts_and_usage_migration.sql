-- ═══════════════════════════════════════════════════════════
-- SAVED CONTACTS (Kayıtlı Kişiler) — Uyumluluk analizi için
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saved_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    birth_date TEXT,
    gender TEXT DEFAULT 'unknown',
    life_path INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_saved_contacts_user ON saved_contacts(user_id);

-- RLS
ALTER TABLE saved_contacts ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi kayıtlarını okuyabilir
CREATE POLICY "Users can read own contacts" ON saved_contacts
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcı kendi kayıtlarını ekleyebilir
CREATE POLICY "Users can insert own contacts" ON saved_contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi kayıtlarını silebilir
CREATE POLICY "Users can delete own contacts" ON saved_contacts
    FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- USAGE COUNTERS (Kullanım Sayaçları) — Free tier limit takibi
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature TEXT NOT NULL,              -- 'compatibility', 'manifest', vb.
    period TEXT NOT NULL,               -- '2026-02' (aylık) veya '2026-02-26' (günlük)
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: bir kullanıcı + feature + period için tek kayıt
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_unique ON usage_counters(user_id, feature, period);

-- RLS
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi sayaçlarını okuyabilir
CREATE POLICY "Users can read own usage" ON usage_counters
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcı kendi sayaçlarını ekleyebilir
CREATE POLICY "Users can insert own usage" ON usage_counters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi sayaçlarını güncelleyebilir
CREATE POLICY "Users can update own usage" ON usage_counters
    FOR UPDATE USING (auth.uid() = user_id);
