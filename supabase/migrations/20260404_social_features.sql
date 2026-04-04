-- ============================================================
-- Migration: Social Features — CORRECTED VERSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CHANNELS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  subscribers_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feed','project','event')),
  title TEXT,
  content TEXT NOT NULL,
  image_urls JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- event
  event_date TIMESTAMPTZ,
  event_location TEXT,

  -- project
  project_url TEXT,

  -- channel
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,

  -- stats
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  score FLOAT DEFAULT 0,

  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT check_event_fields CHECK ((type != 'event') OR (event_date IS NOT NULL)),
  CONSTRAINT check_project_fields CHECK ((type != 'project') OR (project_url IS NOT NULL))
);

-- ============================================================
-- 3. INTERACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.channel_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- ============================================================
-- 5. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('like','comment','share')),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. USER INTEREST (AI FEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT,
  weight FLOAT DEFAULT 1,
  PRIMARY KEY (user_id, tag)
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ================= POSTS =================
DROP POLICY IF EXISTS posts_read ON public.posts;
DROP POLICY IF EXISTS posts_insert ON public.posts;
DROP POLICY IF EXISTS posts_update ON public.posts;
DROP POLICY IF EXISTS posts_delete ON public.posts;

CREATE POLICY posts_read ON public.posts
  FOR SELECT USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY posts_insert ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY posts_update ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY posts_delete ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ================= LIKES =================
DROP POLICY IF EXISTS likes_all ON public.post_likes;

CREATE POLICY likes_all ON public.post_likes
  FOR ALL USING (auth.uid() = user_id);

-- ================= COMMENTS =================
-- FIX: Allow everyone to read comments, only author can write/delete
DROP POLICY IF EXISTS comments_read ON public.post_comments;
DROP POLICY IF EXISTS comments_write ON public.post_comments;

CREATE POLICY comments_read ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY comments_write ON public.post_comments
  FOR ALL USING (auth.uid() = author_id);

-- ================= SHARES =================
DROP POLICY IF EXISTS shares_all ON public.post_shares;

CREATE POLICY shares_all ON public.post_shares
  FOR ALL USING (auth.uid() = user_id);

-- ================= CHANNELS =================
DROP POLICY IF EXISTS channels_read ON public.channels;
DROP POLICY IF EXISTS channels_write ON public.channels;

-- FIX: Channels should be publicly readable
CREATE POLICY channels_read ON public.channels
  FOR SELECT USING (true);

CREATE POLICY channels_write ON public.channels
  FOR ALL USING (auth.uid() = owner_id);

-- ================= SUBSCRIBERS =================
DROP POLICY IF EXISTS subs_all ON public.channel_subscribers;

CREATE POLICY subs_all ON public.channel_subscribers
  FOR ALL USING (auth.uid() = user_id);

-- ================= NOTIFICATIONS =================
DROP POLICY IF EXISTS notif_read ON public.notifications;

CREATE POLICY notif_read ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_author   ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type     ON public.posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_channel  ON public.posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_created  ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_feed     ON public.posts(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_post     ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post  ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_subs_channel   ON public.channel_subscribers(channel_id);
CREATE INDEX IF NOT EXISTS idx_subs_user      ON public.channel_subscribers(user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_likes_count ON public.post_likes;
CREATE TRIGGER trg_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_comments_count ON public.post_comments;
CREATE TRIGGER trg_post_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- FIX: shares count — handle DELETE too
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_shares_count ON public.post_shares;
CREATE TRIGGER trg_post_shares_count
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

-- subscribers count
CREATE OR REPLACE FUNCTION update_channel_subs_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels SET subscribers_count = subscribers_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels SET subscribers_count = GREATEST(subscribers_count - 1, 0) WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_channel_subs_count ON public.channel_subscribers;
CREATE TRIGGER trg_channel_subs_count
  AFTER INSERT OR DELETE ON public.channel_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_channel_subs_count();

-- FIX: posts_count on channels
CREATE OR REPLACE FUNCTION update_channel_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.channel_id IS NOT NULL THEN
    UPDATE channels SET posts_count = posts_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' AND OLD.channel_id IS NOT NULL THEN
    UPDATE channels SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_channel_posts_count ON public.posts;
CREATE TRIGGER trg_channel_posts_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_channel_posts_count();

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE OR REPLACE FUNCTION notify_like()
RETURNS TRIGGER AS $$
DECLARE owner UUID;
BEGIN
  SELECT author_id INTO owner FROM posts WHERE id = NEW.post_id;
  IF owner IS NOT NULL AND owner != NEW.user_id THEN
    INSERT INTO notifications(user_id, actor_id, type, reference_id)
    VALUES (owner, NEW.user_id, 'like', NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_like ON public.post_likes;
CREATE TRIGGER trg_notify_like
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_like();

CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE owner UUID;
BEGIN
  SELECT author_id INTO owner FROM posts WHERE id = NEW.post_id;
  IF owner IS NOT NULL AND owner != NEW.author_id THEN
    INSERT INTO notifications(user_id, actor_id, type, reference_id)
    VALUES (owner, NEW.author_id, 'comment', NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_comment ON public.post_comments;
CREATE TRIGGER trg_notify_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION notify_comment();

-- FIX: share notification (was missing entirely)
CREATE OR REPLACE FUNCTION notify_share()
RETURNS TRIGGER AS $$
DECLARE owner UUID;
BEGIN
  SELECT author_id INTO owner FROM posts WHERE id = NEW.post_id;
  IF owner IS NOT NULL AND owner != NEW.user_id THEN
    INSERT INTO notifications(user_id, actor_id, type, reference_id)
    VALUES (owner, NEW.user_id, 'share', NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_share ON public.post_shares;
CREATE TRIGGER trg_notify_share
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION notify_share();

-- ============================================================
-- FEED FUNCTION (PERSONALIZED)
-- FIX: now uses user_interests for personalized scoring
-- ============================================================
CREATE OR REPLACE FUNCTION get_feed(p_user_id UUID DEFAULT NULL)
RETURNS SETOF posts AS $$
SELECT p.*
FROM posts p
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(ui.weight), 0) AS interest_score
  FROM jsonb_array_elements_text(p.tags) AS t(tag)
  JOIN user_interests ui ON ui.tag = t.tag AND ui.user_id = p_user_id
) interest ON true
WHERE p.is_published = true
ORDER BY (
  p.likes_count * 2
  + p.comments_count * 3
  + p.shares_count * 5
  + interest.interest_score * 4
  - EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600
) DESC
LIMIT 20;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- USER INTEREST UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_interest(p_post_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_interests(user_id, tag, weight)
  SELECT auth.uid(), tag, 1
  FROM jsonb_array_elements_text(
    (SELECT tags FROM posts WHERE id = p_post_id)
  ) AS t(tag)
  ON CONFLICT (user_id, tag)
  DO UPDATE SET weight = user_interests.weight + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE
-- ============================================================