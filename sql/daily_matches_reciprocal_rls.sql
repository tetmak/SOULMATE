-- ═══════════════════════════════════════════════════════════
-- daily_matches: Karşılıklı eşleşme SELECT RLS policy
-- Kullanıcılar başkalarının onları eşleştirdiği kayıtları görebilsin
-- (matched_user_id = auth.uid() olan satırları okuyabilsin)
-- ═══════════════════════════════════════════════════════════

-- Yeni policy: eşleştirildiğim kayıtları da okuyabileyim
CREATE POLICY "Users can read matches where they are matched"
    ON daily_matches FOR SELECT
    USING (auth.uid() = matched_user_id);
