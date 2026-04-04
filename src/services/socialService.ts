import { supabase } from "@/integrations/supabase/client";

export type PostType = "feed" | "project" | "event";

export interface Post {
  id: string;
  author_id: string;
  type: PostType;
  title: string | null;
  content: string;
  image_urls: string[];
  tags: string[];
  event_date: string | null;
  event_location: string | null;
  project_url: string | null;
  channel_id: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_published: boolean;
  created_at: string;
  // joined
  author?: { display_name: string | null; institution: string | null };
  channel?: { name: string } | null;
  liked_by_me?: boolean;
}

export interface Channel {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  subscribers_count: number;
  posts_count: number;
  created_at: string;
  owner?: { display_name: string | null };
  subscribed_by_me?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { display_name: string | null };
}

// ── Helper: profiles ko author_ids se fetch karo ─────────────────────────────
// posts.author_id → auth.users, profiles.user_id → auth.users
// Isliye direct join nahi hota — alag se fetch karte hain
const attachAuthors = async (posts: any[]): Promise<any[]> => {
  if (!posts || posts.length === 0) return posts;
  const authorIds = [...new Set(posts.map(p => p.author_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, institution")
    .in("user_id", authorIds);
  const profileMap: Record<string, any> = {};
  (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
  return posts.map(p => ({
    ...p,
    author: profileMap[p.author_id] || { display_name: null, institution: null },
  }));
};

const attachCommentAuthors = async (comments: any[]): Promise<any[]> => {
  if (!comments || comments.length === 0) return comments;
  const authorIds = [...new Set(comments.map(c => c.author_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", authorIds);
  const profileMap: Record<string, any> = {};
  (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
  return comments.map(c => ({
    ...c,
    author: profileMap[c.author_id] || { display_name: null },
  }));
};

// ── Posts ────────────────────────────────────────────────────────────────────
export const postsApi = {
  getFeed: async (type?: PostType, limit = 20, offset = 0) => {
    let q = supabase
      .from("posts")
      .select("*, channel:channels(name)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (type) q = q.eq("type", type);
    const { data, error } = await q;
    if (error) return { data: null, error };
    const withAuthors = await attachAuthors(data || []);
    return { data: withAuthors, error: null };
  },

  getOne: async (id: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, channel:channels(name)")
      .eq("id", id)
      .single();
    if (error) return { data: null, error };
    const [withAuthor] = await attachAuthors([data]);
    return { data: withAuthor, error: null };
  },

 create: async (payload: Partial<Post> & { author_id: string }) => {
  return supabase
    .from("posts")
    .insert({
      ...payload,
      type: payload.type ?? "post",
    } as Post) // ✅ force correct type
    .select()
    .single();
},

  delete: async (id: string) => supabase.from("posts").delete().eq("id", id),

  getLikedPosts: async (userId: string) => {
    const { data } = await supabase.from("post_likes").select("post_id").eq("user_id", userId);
    return new Set((data || []).map(l => l.post_id));
  },

  like: async (postId: string, userId: string) => {
    return supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
  },

  unlike: async (postId: string, userId: string) => {
    return supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
  },

  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) return { data: null, error };
    const withAuthors = await attachCommentAuthors(data || []);
    return { data: withAuthors, error: null };
  },

  addComment: async (postId: string, authorId: string, content: string) => {
    return supabase.from("post_comments").insert({ post_id: postId, author_id: authorId, content }).select().single();
  },

  deleteComment: async (id: string) => supabase.from("post_comments").delete().eq("id", id),
};

// ── Channels ─────────────────────────────────────────────────────────────────
export const channelsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("subscribers_count", { ascending: false });
    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: [], error: null };
    const ownerIds = [...new Set(data.map(c => c.owner_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", ownerIds);
    const profileMap: Record<string, any> = {};
    (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
    return {
      data: data.map(c => ({ ...c, owner: profileMap[c.owner_id] || { display_name: null } })),
      error: null,
    };
  },

  getOne: async (id: string) => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return { data: null, error };
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("user_id", data.owner_id)
      .maybeSingle();
    return { data: { ...data, owner: profile || { display_name: null } }, error: null };
  },

  create: async (payload: { owner_id: string; name: string; description?: string; avatar_url?: string; banner_url?: string }) => {
    return supabase.from("channels").insert(payload).select().single();
  },

  getMyChannel: async (userId: string) => {
    return supabase.from("channels").select("*").eq("owner_id", userId).maybeSingle();
  },

  getSubscribedChannels: async (userId: string) => {
    const { data } = await supabase.from("channel_subscribers").select("channel_id").eq("user_id", userId);
    return new Set((data || []).map(s => s.channel_id));
  },

  subscribe: async (channelId: string, userId: string) => {
    return supabase.from("channel_subscribers").insert({ channel_id: channelId, user_id: userId });
  },

  unsubscribe: async (channelId: string, userId: string) => {
    return supabase.from("channel_subscribers").delete().eq("channel_id", channelId).eq("user_id", userId);
  },

  getChannelPosts: async (channelId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("channel_id", channelId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) return { data: null, error };
    const withAuthors = await attachAuthors(data || []);
    return { data: withAuthors, error: null };
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
};

export const initials = (name: string | null | undefined) =>
  (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();