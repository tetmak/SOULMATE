-- ═══════════════════════════════════════════════════════════
-- discovery_profiles: Şehir bazlı konum desteği
-- Cosmic Match harita özelliği için şehir bilgisi eklenir
-- ═══════════════════════════════════════════════════════════

ALTER TABLE discovery_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE discovery_profiles ADD COLUMN IF NOT EXISTS city_lat DOUBLE PRECISION;
ALTER TABLE discovery_profiles ADD COLUMN IF NOT EXISTS city_lng DOUBLE PRECISION;
