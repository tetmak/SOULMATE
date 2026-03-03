-- ============================================================
-- SOULMATE Production Hardening — Master Migration
-- ============================================================
-- Bu dosya tum workstream'lerin SQL migration'larini icerir.
-- Supabase Dashboard → SQL Editor'da calistirilmali.
-- ============================================================

-- ============================
-- WS1: API Foundation
-- ============================

-- Profiles tablosuna rol ve suspension alanlari ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Role check constraint (eger yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
END$$;

-- Rate limits tablosu (API rate limiting icin)
CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);

-- ============================
-- WS2: AI Safety
-- ============================

-- AI kullanim takip tablosu
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_input INT NOT NULL DEFAULT 0,
    tokens_output INT NOT NULL DEFAULT 0,
    model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    feature TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, created_at);
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- ai_usage: sadece admin okuyabilir, kimse client'tan insert yapamaz
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can read ai_usage' AND tablename = 'ai_usage') THEN
        CREATE POLICY "Admin can read ai_usage" ON ai_usage FOR SELECT USING (
            EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
    END IF;
END$$;

-- ============================
-- WS4: Content System
-- ============================

-- Posts tablosu
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'post',
    visibility TEXT NOT NULL DEFAULT 'public',
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_content_length') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_content_length CHECK (length(content) <= 2000);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_type_check') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('post', 'manifest', 'insight', 'milestone', 'question'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_visibility_check') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_visibility_check CHECK (visibility IN ('public', 'followers', 'connections', 'private'));
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC) WHERE NOT is_hidden;
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(is_hidden, created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read visible posts' AND tablename = 'posts') THEN
        CREATE POLICY "Public can read visible posts" ON posts FOR SELECT USING (NOT is_hidden);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own posts' AND tablename = 'posts') THEN
        CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own posts' AND tablename = 'posts') THEN
        CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own posts' AND tablename = 'posts') THEN
        CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
    END IF;
END$$;

-- Comments tablosu
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_content_length') THEN
        ALTER TABLE comments ADD CONSTRAINT comments_content_length CHECK (length(content) <= 500);
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read comments' AND tablename = 'comments') THEN
        CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own comments' AND tablename = 'comments') THEN
        CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own comments' AND tablename = 'comments') THEN
        CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
    END IF;
END$$;

-- Reactions tablosu
CREATE TABLE IF NOT EXISTS reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, user_id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reactions_type_check') THEN
        ALTER TABLE reactions ADD CONSTRAINT reactions_type_check CHECK (type IN ('like', 'love', 'energy', 'cosmic', 'insight'));
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read reactions' AND tablename = 'reactions') THEN
        CREATE POLICY "Anyone can read reactions" ON reactions FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own reactions' AND tablename = 'reactions') THEN
        CREATE POLICY "Users can insert own reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own reactions' AND tablename = 'reactions') THEN
        CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);
    END IF;
END$$;

-- Follows tablosu
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read follows' AND tablename = 'follows') THEN
        CREATE POLICY "Anyone can read follows" ON follows FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can follow' AND tablename = 'follows') THEN
        CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can unfollow' AND tablename = 'follows') THEN
        CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END$$;

-- Reports tablosu
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_type_check') THEN
        ALTER TABLE reports ADD CONSTRAINT reports_target_type_check CHECK (target_type IN ('post', 'comment', 'user', 'message'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reason_check') THEN
        ALTER TABLE reports ADD CONSTRAINT reports_reason_check CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'hate_speech', 'self_harm', 'other'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_status_check') THEN
        ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'));
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see own reports' AND tablename = 'reports') THEN
        CREATE POLICY "Users can see own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports' AND tablename = 'reports') THEN
        CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
    -- Admin can read all reports — handled via service_role in API
END$$;

-- Blocks tablosu
CREATE TABLE IF NOT EXISTS blocks (
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see own blocks' AND tablename = 'blocks') THEN
        CREATE POLICY "Users can see own blocks" ON blocks FOR SELECT USING (auth.uid() = blocker_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create blocks' AND tablename = 'blocks') THEN
        CREATE POLICY "Users can create blocks" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can remove blocks' AND tablename = 'blocks') THEN
        CREATE POLICY "Users can remove blocks" ON blocks FOR DELETE USING (auth.uid() = blocker_id);
    END IF;
END$$;

-- ============================
-- WS6: Notification & Gamification Fix
-- ============================

-- Tehlikeli INSERT policy'yi kaldir (herkes baskasina bildirim gonderebiliyordu)
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;

-- XP event loglama tablosu
CREATE TABLE IF NOT EXISTS xp_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_amount INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_date ON xp_events(user_id, action, created_at);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- xp_events: kullanicilar kendi XP gecmislerini gorebilir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own xp_events' AND tablename = 'xp_events') THEN
        CREATE POLICY "Users can read own xp_events" ON xp_events FOR SELECT USING (auth.uid() = user_id);
    END IF;
END$$;

-- ============================
-- WS8: Legal, Compliance, Performance
-- ============================

-- Webhook event dedup tablosu (replay attack koruması)
CREATE TABLE IF NOT EXISTS webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed_at);

-- Age verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;

-- Performance indexleri
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_matches_user_date ON daily_matches(user_id, match_date);
CREATE INDEX IF NOT EXISTS idx_user_gamification_weekly ON user_gamification(week_start, weekly_xp DESC);

-- Messages icin pair-based index (mesaj gecmisi hizli sorgulama)
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON messages(receiver_id, sender_id, created_at DESC);

-- Usage counters icin compound index
CREATE INDEX IF NOT EXISTS idx_usage_counters_lookup ON usage_counters(user_id, feature, period);

-- Manifests icin created_at index
CREATE INDEX IF NOT EXISTS idx_manifests_created ON manifests(created_at DESC);

-- Connection requests icin status index
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status, receiver_id);

-- ============================
-- Tamamlandi
-- ============================
