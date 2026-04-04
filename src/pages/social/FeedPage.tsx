import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/social/PostCard";
import CreatePostModal from "@/components/social/CreatePostModal";
import { postsApi } from "@/services/socialService";
import type { Post, PostType } from "@/services/socialService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PenLine, Flame, FlaskConical, Calendar, Loader2 } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";

const FILTERS: { label: string; value: PostType | "all"; icon: any }[] = [
  { label: "All",      value: "all",     icon: Flame      },
  { label: "Posts",    value: "feed",    icon: PenLine    },
  { label: "Projects", value: "project", icon: FlaskConical },
  { label: "Events",   value: "event",   icon: Calendar   },
];

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts]         = useState<Post[]>([]);
  const [filter, setFilter]       = useState<PostType | "all">("all");
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]     = useState(true);
  const [likedSet, setLikedSet]   = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [offset, setOffset]       = useState(0);

  const LIMIT = 10;

  const fetchPosts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) setLoading(true); else setLoadingMore(true);
    const { data } = await postsApi.getFeed(filter === "all" ? undefined : filter, LIMIT, currentOffset);
    if (reset) {
      setPosts(data || []);
      setOffset(LIMIT);
    } else {
      setPosts(p => [...p, ...(data || [])]);
      setOffset(o => o + LIMIT);
    }
    setHasMore((data || []).length === LIMIT);
    if (reset) setLoading(false); else setLoadingMore(false);
  }, [filter, offset]);

  useEffect(() => { fetchPosts(true); }, [filter]);

  useEffect(() => {
    if (user) postsApi.getLikedPosts(user.id).then(setLikedSet);
  }, [user]);

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Posts, projects & events from the CSEEL community</p>
              </div>
              {user && (
                <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full shadow-sm">
                  <PenLine className="h-4 w-4" /> Post
                </Button>
              )}
            </div>

            {/* Compose box (if logged in) */}
            {user && (
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 mb-6 text-left hover:border-primary/40 transition-colors group"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <PenLine className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Share a post, project or event…
                </span>
              </button>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    filter === f.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex gap-3"><div className="h-10 w-10 rounded-full bg-muted" /><div className="space-y-2 flex-1"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-2 bg-muted rounded w-1/4" /></div></div>
                    <div className="h-48 bg-muted rounded-xl" />
                    <div className="space-y-2"><div className="h-3 bg-muted rounded" /><div className="h-3 bg-muted rounded w-4/5" /></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🌱</div>
                <p className="font-semibold text-foreground mb-1">No posts yet</p>
                <p className="text-muted-foreground text-sm mb-4">Be the first to share something!</p>
                {user && <Button onClick={() => setCreateOpen(true)}>Create first post</Button>}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} likedByMe={likedSet.has(post.id)} />
                ))}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={() => fetchPosts(false)} disabled={loadingMore} className="rounded-full">
                      {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Loading…</> : "Load more"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => fetchPosts(true)} />
      </PageTransition>
    </Layout>
  );
};

export default FeedPage;
