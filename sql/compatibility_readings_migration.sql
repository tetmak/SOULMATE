-- ============================================================
-- compatibility_readings — Uyumluluk analiz geçmişi
-- Kullanıcının yaptığı tüm uyumluluk analizlerini saklar.
-- localStorage yerine Supabase'de persist edilir.
-- ============================================================

CREATE TABLE IF NOT EXISTS compatibility_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Partner bilgileri
    partner_name TEXT NOT NULL,
    partner_birth_date TEXT,
    partner_gender TEXT DEFAULT 'unknown',

    -- Numeroloji sayıları (person1 = kullanıcı, person2 = partner)
    p1_life_path INTEGER,
    p1_soul_urge INTEGER,
    p1_personality INTEGER,
    p1_expression INTEGER,
    p2_life_path INTEGER,
    p2_soul_urge INTEGER,
    p2_personality INTEGER,
    p2_expression INTEGER,

    -- Skorlar (ölçeklenmiş 70-98 aralığı)
    overall_score INTEGER,
    lp_score INTEGER,
    soul_score INTEGER,
    pers_score INTEGER,
    exp_score INTEGER,
    bond_label TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: kullanıcı bazlı hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_compat_readings_user
    ON compatibility_readings(user_id, created_at DESC);

-- Unique: aynı kullanıcı + partner combo için tek kayıt (upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_compat_readings_unique
    ON compatibility_readings(user_id, LOWER(partner_name), partner_birth_date);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE compatibility_readings ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi kayıtlarını okuyabilir
CREATE POLICY "Users can read own readings"
    ON compatibility_readings FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcı kendi kaydını oluşturabilir
CREATE POLICY "Users can insert own readings"
    ON compatibility_readings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi kaydını güncelleyebilir
CREATE POLICY "Users can update own readings"
    ON compatibility_readings FOR UPDATE
    USING (auth.uid() = user_id);

-- Kullanıcı kendi kaydını silebilir
CREATE POLICY "Users can delete own readings"
    ON compatibility_readings FOR DELETE
    USING (auth.uid() = user_id);
