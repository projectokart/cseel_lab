-- ============================================================
-- CSEEL — Complete Database Schema
-- Kisi bhi nayi Supabase project mein run karo
-- Generated from production DB: ukazkxthavxphibdbspd
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'teacher', 'student');


-- ============================================================
-- 3. TABLES (dependency order — referenced tables first)
-- ============================================================

-- vendors (no dependencies)
CREATE TABLE IF NOT EXISTS public.vendors (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  picture_url TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- profiles (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  institution  TEXT,
  city         TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles (references auth.users)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- experiments
CREATE TABLE IF NOT EXISTS public.experiments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  subject       TEXT NOT NULL,
  class         TEXT,
  description   TEXT,
  thumbnail_url TEXT,
  difficulty    TEXT,
  demo_link     TEXT,
  video_link    TEXT,
  materials     TEXT,
  procedure     TEXT,
  outcome       TEXT,
  precautions   TEXT,
  popularity    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  images        JSONB DEFAULT '[]'::jsonb,
  created_by    UUID REFERENCES auth.users(id) ON DELETE NO ACTION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- experiment_sections
CREATE TABLE IF NOT EXISTS public.experiment_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  section_key   TEXT NOT NULL,
  title         TEXT,
  content       JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, section_key)
);

-- lab_materials (references vendors)
CREATE TABLE IF NOT EXISTS public.lab_materials (
  id              TEXT PRIMARY KEY,
  scientific_name TEXT NOT NULL,
  common_names    JSONB DEFAULT '[]'::jsonb,
  specification   TEXT,
  category        TEXT NOT NULL,
  warning         TEXT,
  safety          TEXT,
  handling        TEXT,
  storage         TEXT,
  vendor_id       TEXT REFERENCES public.vendors(id) ON DELETE NO ACTION,
  image_url       TEXT,
  price           NUMERIC DEFAULT 0,
  original_price  NUMERIC,
  stock           INTEGER DEFAULT 0,
  current_stock   INTEGER DEFAULT 0,
  rating          NUMERIC DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- experiment_materials (references experiments + lab_materials)
CREATE TABLE IF NOT EXISTS public.experiment_materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE,
  material_id   TEXT REFERENCES public.lab_materials(id) ON DELETE NO ACTION,
  quantity      TEXT,
  unit          TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- materials (shop products — separate from lab_materials)
CREATE TABLE IF NOT EXISTS public.materials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  price          NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  rating         NUMERIC DEFAULT 4.5,
  reviews        INTEGER DEFAULT 0,
  stock          INTEGER DEFAULT 0,
  image_url      TEXT,
  tag            TEXT,
  includes       JSONB DEFAULT '[]'::jsonb,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- classes (references auth.users for teacher)
CREATE TABLE IF NOT EXISTS public.classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- class_enrollments
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  class_id      UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
  teacher_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructions  TEXT,
  due_date      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, student_id)
);

-- blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  content         TEXT NOT NULL,
  excerpt         TEXT,
  cover_image_url TEXT,
  author_id       UUID REFERENCES auth.users(id) ON DELETE NO ACTION,
  author_name     TEXT,
  is_published    BOOLEAN DEFAULT false,
  is_featured     BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- logos
CREATE TABLE IF NOT EXISTS public.logos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  image_url  TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  institution TEXT,
  position    TEXT,
  country     TEXT,
  type        TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- demo_requests
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  institution TEXT,
  message     TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE NO ACTION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- homepage_content
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  content     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE NO ACTION,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- page_visits
CREATE TABLE IF NOT EXISTS public.page_visits (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE NO ACTION
);


-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  select exists (
    select 1 from user_roles
    where user_id = _user_id and role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_material_id(cat_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_id TEXT;
  num INT;
BEGIN
  SELECT id INTO last_id
  FROM lab_materials
  WHERE id LIKE 'Item-' || cat_code || '-%'
  ORDER BY id DESC LIMIT 1;
  IF last_id IS NULL THEN
    RETURN 'Item-' || cat_code || '-0001';
  END IF;
  num := CAST(SPLIT_PART(last_id, '-', 3) AS INT) + 1;
  RETURN 'Item-' || cat_code || '-' || LPAD(num::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.next_vendor_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_id TEXT;
  num INT;
BEGIN
  SELECT id INTO last_id FROM vendors ORDER BY id DESC LIMIT 1;
  IF last_id IS NULL THEN RETURN 'VND-0001'; END IF;
  num := CAST(SPLIT_PART(last_id, '-', 2) AS INT) + 1;
  RETURN 'VND-' || LPAD(num::TEXT, 4, '0');
END;
$$;


-- ============================================================
-- 5. TRIGGERS
-- ============================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_experiment_sections_updated_at
  BEFORE UPDATE ON public.experiment_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 6. ENABLE RLS
-- ============================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_materials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "profiles: read own"      ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles: admin read all" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles: insert own"    ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles: update own"    ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- user_roles
CREATE POLICY "user_roles: read own"    ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles: admin all"   ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- experiments
CREATE POLICY "experiments: public read"         ON public.experiments FOR SELECT USING (is_active = true);
CREATE POLICY "experiments: admin/teacher insert" ON public.experiments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));
CREATE POLICY "experiments: admin/creator update" ON public.experiments FOR UPDATE USING (has_role(auth.uid(), 'admin') OR created_by = auth.uid());
CREATE POLICY "experiments: admin delete"         ON public.experiments FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- experiment_sections
CREATE POLICY "experiment_sections: public read"        ON public.experiment_sections FOR SELECT USING (is_active = true);
CREATE POLICY "experiment_sections: admin/teacher write" ON public.experiment_sections FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

-- experiment_materials
CREATE POLICY "experiment_materials: public read" ON public.experiment_materials FOR SELECT USING (true);
CREATE POLICY "experiment_materials: admin write" ON public.experiment_materials FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- lab_materials
CREATE POLICY "Lab materials viewable by everyone" ON public.lab_materials FOR SELECT USING (true);
CREATE POLICY "Admins can manage lab materials"    ON public.lab_materials FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- vendors
CREATE POLICY "Vendors viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Admins can manage vendors"    ON public.vendors FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- materials
CREATE POLICY "materials: public read" ON public.materials FOR SELECT USING (is_active = true);
CREATE POLICY "materials: admin all"   ON public.materials FOR ALL USING (has_role(auth.uid(), 'admin'));

-- classes
CREATE POLICY "classes: teacher read own"     ON public.classes FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "classes: admin read all"       ON public.classes FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "classes: student read enrolled" ON public.classes FOR SELECT USING (id IN (SELECT class_id FROM class_enrollments WHERE student_id = auth.uid()));
CREATE POLICY "classes: teacher insert"       ON public.classes FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());
CREATE POLICY "classes: teacher update own"   ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "classes: admin delete"         ON public.classes FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- class_enrollments
CREATE POLICY "enrollments: student read own"       ON public.class_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enrollments: admin read all"         ON public.class_enrollments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "enrollments: teacher read own class" ON public.class_enrollments FOR SELECT USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));
CREATE POLICY "enrollments: student insert"         ON public.class_enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments: student/admin delete"   ON public.class_enrollments FOR DELETE USING (student_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- assignments
CREATE POLICY "assignments: teacher read own"      ON public.assignments FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "assignments: admin read all"        ON public.assignments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "assignments: student read enrolled" ON public.assignments FOR SELECT USING (class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = auth.uid()));
CREATE POLICY "assignments: teacher insert"        ON public.assignments FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());
CREATE POLICY "assignments: teacher update own"    ON public.assignments FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "assignments: teacher/admin delete"  ON public.assignments FOR DELETE USING (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- submissions
CREATE POLICY "submissions: student read own"     ON public.submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "submissions: admin read all"       ON public.submissions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "submissions: teacher read class"   ON public.submissions FOR SELECT USING (assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid()));
CREATE POLICY "submissions: student insert"       ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions: student update own"   ON public.submissions FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "submissions: teacher update score" ON public.submissions FOR UPDATE USING (assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid()));

-- blog_posts
CREATE POLICY "blog_posts: public read published" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "blog_posts: admin read all"        ON public.blog_posts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "blog_posts: admin write"           ON public.blog_posts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- logos
CREATE POLICY "logos: public read active" ON public.logos FOR SELECT USING (is_active = true);
CREATE POLICY "logos: admin all"          ON public.logos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- testimonials
CREATE POLICY "testimonials: public read active" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "testimonials: admin all"          ON public.testimonials FOR ALL USING (has_role(auth.uid(), 'admin'));

-- contact_messages
CREATE POLICY "contact_messages: public insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages: admin read"    ON public.contact_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages: admin write"   ON public.contact_messages FOR ALL USING (has_role(auth.uid(), 'admin'));

-- demo_requests
CREATE POLICY "demo_requests: public insert" ON public.demo_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_requests: admin read"    ON public.demo_requests FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "demo_requests: admin write"   ON public.demo_requests FOR ALL USING (has_role(auth.uid(), 'admin'));

-- support_tickets
CREATE POLICY "support_tickets: auth insert"  ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "support_tickets: user read own" ON public.support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "support_tickets: admin all"    ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'));

-- promotions
CREATE POLICY "promotions_select" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "promotions_insert" ON public.promotions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "promotions_update" ON public.promotions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "promotions_delete" ON public.promotions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- homepage_content
CREATE POLICY "homepage_content: public read"  ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "homepage_content: admin write"  ON public.homepage_content FOR ALL USING (has_role(auth.uid(), 'admin'));

-- page_visits
CREATE POLICY "page_visits: auth insert" ON public.page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "page_visits: admin read"  ON public.page_visits FOR SELECT USING (has_role(auth.uid(), 'admin'));


-- ============================================================
-- 8. NEW TABLES — Cart, Orders, Projects
-- ============================================================

-- cart_items (persistent user cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_material_id TEXT NOT NULL REFERENCES public.lab_materials(id) ON DELETE CASCADE,
  quantity        INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_material_id)
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending',
  total_price NUMERIC DEFAULT 0,
  notes       TEXT,
  admin_notes TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  lab_material_id TEXT NOT NULL REFERENCES public.lab_materials(id) ON DELETE NO ACTION,
  quantity        INTEGER NOT NULL DEFAULT 1,
  price_at_order  NUMERIC NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_projects
CREATE TABLE IF NOT EXISTS public.user_projects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description            TEXT,
  selected_experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
  status                 TEXT DEFAULT 'active',
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- project_materials
CREATE TABLE IF NOT EXISTS public.project_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.user_projects(id) ON DELETE CASCADE,
  lab_material_id TEXT NOT NULL REFERENCES public.lab_materials(id) ON DELETE CASCADE,
  quantity        INTEGER DEFAULT 1,
  notes           TEXT,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, lab_material_id)
);

-- user_experiment_selections
CREATE TABLE IF NOT EXISTS public.user_experiment_selections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  selected_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 9. RLS — New Tables
-- ============================================================

ALTER TABLE public.cart_items                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experiment_selections  ENABLE ROW LEVEL SECURITY;

-- cart_items
CREATE POLICY "cart: user read own"   ON public.cart_items FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "cart: user insert own" ON public.cart_items FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart: user update own" ON public.cart_items FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "cart: user delete own" ON public.cart_items FOR DELETE  USING (auth.uid() = user_id);
CREATE POLICY "cart: admin read all"  ON public.cart_items FOR SELECT  USING (has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "orders: user read own"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders: user insert own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders: admin all"       ON public.orders FOR ALL    USING (has_role(auth.uid(), 'admin'));

-- order_items
CREATE POLICY "order_items: user read own" ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items: user insert"   ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items: admin all"     ON public.order_items FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- user_projects
CREATE POLICY "projects: user read own"   ON public.user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects: user insert own" ON public.user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects: user update own" ON public.user_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects: user delete own" ON public.user_projects FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "projects: admin read all"  ON public.user_projects FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- project_materials
CREATE POLICY "project_materials: user read own" ON public.project_materials FOR SELECT
  USING (project_id IN (SELECT id FROM public.user_projects WHERE user_id = auth.uid()));
CREATE POLICY "project_materials: user insert"   ON public.project_materials FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.user_projects WHERE user_id = auth.uid()));
CREATE POLICY "project_materials: user update"   ON public.project_materials FOR UPDATE
  USING (project_id IN (SELECT id FROM public.user_projects WHERE user_id = auth.uid()));
CREATE POLICY "project_materials: user delete"   ON public.project_materials FOR DELETE
  USING (project_id IN (SELECT id FROM public.user_projects WHERE user_id = auth.uid()));
CREATE POLICY "project_materials: admin read"    ON public.project_materials FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- user_experiment_selections
CREATE POLICY "selections: user read own"   ON public.user_experiment_selections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "selections: user insert own" ON public.user_experiment_selections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "selections: user update own" ON public.user_experiment_selections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "selections: admin read all"  ON public.user_experiment_selections FOR SELECT USING (has_role(auth.uid(), 'admin'));


-- ============================================================
-- 10. TRIGGERS — New Tables
-- ============================================================
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 11. GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================
-- DONE ✓
-- Total tables: 27
-- Nayi Supabase project mein run karo — exact same DB ban jayega
-- ============================================================