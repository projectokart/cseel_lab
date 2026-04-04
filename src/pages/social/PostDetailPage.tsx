import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { postsApi, timeAgo, initials } from "@/services/socialService";
import type { Post, Comment } from "@/services/socialService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Share2, ArrowLeft, Send, Trash2, Calendar, MapPin, ExternalLink, MessageCircle, Loader2 } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const commentsRef = useRef<HTMLDivElement>(null);

  const [post, setPost]           = useState<Post | null>(null);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postsApi.getOne(id),
        postsApi.getComments(id),
      ]);
      if (postRes.data) { setPost(postRes.data as Post); setLikesCount(postRes.data.likes_count); }
      if (commentsRes.data) setComments(commentsRes.data as Comment[]);
      if (user && postRes.data) {
        const liked = await postsApi.getLikedPosts(user.id);
        setLiked(liked.has(id));
      }
      setLoading(false);
    })();
  }, [id, user]);

  // Scroll to comments if #comments in URL
  useEffect(() => {
    if (!loading && window.location.hash === "#comments") {
      setTimeout(() => commentsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  }, [loading]);

  const handleLike = async () => {
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (liked) {
      await postsApi.unlike(id!, user.id);
      setLiked(false); setLikesCount(c => Math.max(0, c - 1));
    } else {
      await postsApi.like(id!, user.id);
      setLiked(true); setLikesCount(c => c + 1);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: post?.title || "CSEEL Post", url });
    else { await navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    setCommenting(true);
    const { data } = await postsApi.addComment(id!, user.id, newComment.trim());
    if (data) setComments(c => [...c, data as Comment]);
    setNewComment(""); setCommenting(false);
  };

  const handleDeleteComment = async (cId: string) => {
    await postsApi.deleteComment(cId);
    setComments(c => c.filter(x => x.id !== cId));
  };

  const images = Array.isArray(post?.image_urls) ? post!.image_urls as string[] : [];

  if (loading) return (
    <Layout><div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="flex gap-3"><div className="h-12 w-12 rounded-full bg-muted" /><div className="space-y-2 flex-1"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-3 bg-muted rounded w-1/4" /></div></div>
        <div className="h-64 bg-muted rounded-xl" />
        <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-3 bg-muted rounded" />)}</div>
      </div>
    </div></Layout>
  );

  if (!post) return (
    <Layout><div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-xl font-bold mb-2">Post not found</p>
      <Button onClick={() => navigate("/feed")}>← Back to Feed</Button>
    </div></Layout>
  );

  const authorName = (post.author as any)?.display_name || "Anonymous";

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>

          {/* Post card */}
          <article className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            {/* Author */}
            <div className="flex items-center gap-3 p-5 pb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold">
                {initials(authorName)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{authorName}</p>
                {(post.author as any)?.institution && (
                  <p className="text-xs text-muted-foreground">{(post.author as any).institution}</p>
                )}
                <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)} · {new Date(post.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className={images.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
                {images.map((url, i) => (
                  <div key={i} className={`overflow-hidden bg-muted ${images.length === 1 ? "max-h-[520px]" : "h-52"}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="p-5">
              {post.title && <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>}
              <p className="text-foreground leading-relaxed whitespace-pre-line">{post.content}</p>

              {/* Event meta */}
              {post.type === "event" && (post.event_date || post.event_location) && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  {post.event_date && (
                    <div className="flex items-center gap-2 text-purple-700 font-medium">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.event_date).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
                      {" · "}
                      {new Date(post.event_date).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                    </div>
                  )}
                  {post.event_location && (
                    <div className="flex items-center gap-2 text-purple-600">
                      <MapPin className="h-4 w-4" /> {post.event_location}
                    </div>
                  )}
                </div>
              )}

              {/* Project link */}
              {post.project_url && (
                <a href={post.project_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline">
                  <ExternalLink className="h-4 w-4" /> View Project
                </a>
              )}

              {/* Tags */}
              {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(post.tags as string[]).map((tag: string) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${liked ? "bg-red-50 text-red-500" : "hover:bg-muted text-muted-foreground"}`}>
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:bg-muted font-medium text-sm">
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:bg-muted font-medium text-sm ml-auto">
                <Share2 className="h-5 w-5" /> Share
              </button>
            </div>
          </article>

          {/* Comments */}
          <div ref={commentsRef} id="comments" className="space-y-4">
            <h2 className="font-bold text-foreground text-lg">Comments ({comments.length})</h2>

            {/* Add comment */}
            {user ? (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {initials(user.email)}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      className="flex-1 min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleComment(); }}
                    />
                    <Button onClick={handleComment} disabled={commenting || !newComment.trim()} size="icon" className="self-end rounded-xl h-9 w-9">
                      {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 pl-12">Ctrl+Enter to submit</p>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Login</Link> to comment
              </div>
            )}

            {/* Comment list */}
            {comments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => {
                  const cAuthor = (c.author as any)?.display_name || "Anonymous";
                  return (
                    <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
                        {initials(cAuthor)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-foreground">{cAuthor}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">{c.content}</p>
                      </div>
                      {user?.id === c.author_id && (
                        <button onClick={() => handleDeleteComment(c.id)} className="text-muted-foreground hover:text-destructive transition-colors self-start shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default PostDetailPage;
