// ── AUTH ──────────────────────────────────────────────────────────────────────
export type AppRole = "admin" | "moderator" | "teacher" | "student";

// ── EXPERIMENTS ───────────────────────────────────────────────────────────────
export interface Experiment {
  id: string;
  title: string;
  subject: string;
  class: string | null;
  difficulty: string | null;
  description: string | null;
  thumbnail_url: string | null;
  images?: string[] | null;
  video_link: string | null;
  demo_link: string | null;
  materials: string | null;
  procedure: string | null;
  outcome: string | null;
  popularity: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ExperimentBasic
  extends Pick<
    Experiment,
    "id" | "title" | "subject" | "class" | "thumbnail_url" | "popularity" | "created_at"
  > {}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  class: string | null;
  difficulty: string | null;
  thumbnail_url: string | null;
  images?: string[] | null;
  video_link: string | null;
  materials: string | null;
  procedure: string | null;
  outcome: string | null;
  tags?: string[] | null;
  popularity: number | null;
  is_active: boolean;
  created_at: string;
}

// ── LAB MATERIALS ─────────────────────────────────────────────────────────────
export interface LabMaterial {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
}

// ── BLOG ──────────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  author: string | null;
  tags?: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  image_url: string | null;
  is_upcoming: boolean;
  created_at: string;
}

// ── PROMOTIONS ────────────────────────────────────────────────────────────────
export interface Promotion {
  id: string;
  title: string;
  content: string;
  type: "announcement" | "offer" | "banner";
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string;
  accent_color: string;
  is_active: boolean;
  sort_order: number;
}

// ── CART ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

// ── USER PROFILE ──────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: AppRole;
  created_at: string;
}
