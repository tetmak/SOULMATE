-- ═══════════════════════════════════════════════════════════
-- NUMERAEL — Cosmic Match: Çoklu Günlük Eşleşme Migration
--
-- Eski: UNIQUE(user_id, match_date) → günde 1 eşleşme
-- Yeni: UNIQUE(user_id, match_date, matched_user_id) → günde birden fazla
--
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın.
-- ═══════════════════════════════════════════════════════════

-- 1. Eski unique constraint'leri kaldır
ALTER TABLE daily_matches DROP CONSTRAINT IF EXISTS daily_matches_user_date_unique;
ALTER TABLE daily_matches DROP CONSTRAINT IF EXISTS daily_matches_user_id_match_date_key;

-- 2. Yeni unique constraint ekle (aynı gün + aynı kişi tekrar eşleşmesin)
ALTER TABLE daily_matches ADD CONSTRAINT daily_matches_user_date_matched_unique
    UNIQUE (user_id, match_date, matched_user_id);

-- 3. Index güncelle (performans için)
DROP INDEX IF EXISTS idx_matches_user_date;
CREATE INDEX IF NOT EXISTS idx_matches_user_date ON daily_matches(user_id, match_date);
CREATE INDEX IF NOT EXISTS idx_matches_user_matched ON daily_matches(user_id, matched_user_id);
