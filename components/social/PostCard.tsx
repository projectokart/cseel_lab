import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, ExternalLink, Calendar, MapPin } from "lucide-react";
import { postsApi, timeAgo, initials } from "@/services/socialService";
import type { Post } from "@/services/socialService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  feed:    { label: "Post",    color: "bg-blue-100   text-blue-700"   },
  project: { label: "Project", color: "bg-green-100  text-green-700"  },
  event:   { label: "Event",   color: "bg-purple-100 text-purple-700" },
};

interface PostCardProps {
  post: Post;
  likedByMe?: boolean;
  compact?: boolean;
}

const PostCard = ({ post, likedByMe = false, compact = false }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked]             = useState(likedByMe);
  const [likesCount, setLikesCount]   = useState(post.likes_count);
  const [likeLoading, setLikeLoading] = useState(false);

  const badge    = TYPE_BADGE[post.type] || TYPE_BADGE.feed;
  const images   = Array.isArray(post.image_urls) ? post.image_urls as string[] : [];
  const authorName = (post.author as any)?.display_name || "Anonymous";

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      await postsApi.unlike(post.id, user.id);
      setLiked(false); setLikesCount(c => Math.max(0, c - 1));
    } else {
      await postsApi.like(post.id, user.id);
      setLiked(true); setLikesCount(c => c + 1);
    }
    setLikeLoading(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/feed/${post.id}`;
    if (navigator.share) navigator.share({ title: post.title || "CSEEL Post", url });
    else { await navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }
  };

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Author row */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {initials(authorName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{authorName}</span>
            {(post.author as any)?.institution && (
              <span className="text-xs text-muted-foreground">· {(post.author as any).institution}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
            {post.channel && (
              <Link to={`/channels/${post.channel_id}`} onClick={e => e.stopPropagation()}
                className="text-xs text-primary hover:underline font-medium">
                #{(post.channel as any).name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Clickable content area */}
      <Link to={`/feed/${post.id}`} className="block">
        {/* Images */}
        {images.length > 0 && (
          <div className={images.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
            {images.slice(0, compact ? 1 : 4).map((url, i) => (
              <div key={i} className={`relative bg-muted overflow-hidden ${
                images.length === 1 ? "h-72 md:h-96" :
                images.length === 2 ? "h-52" : "h-40"
              }`}>
                <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {images.length > 4 && i === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-3">
          {post.title && (
            <h3 className="font-bold text-foreground text-base mb-1.5 leading-snug group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          )}
          <p className={`text-sm text-muted-foreground leading-relaxed ${compact ? "line-clamp-3" : "line-clamp-5 whitespace-pre-line"}`}>
            {post.content}
          </p>

          {/* Event meta */}
          {post.type === "event" && (post.event_date || post.event_location) && (
            <div className="mt-2.5 flex flex-wrap gap-3">
              {post.event_date && (
                <span className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {post.event_location && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {post.event_location}
                </span>
              )}
            </div>
          )}

          {/* Project link */}
          {post.type === "project" && post.project_url && (
            <a href={post.project_url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline">
              <ExternalLink className="h-3 w-3" /> View Project
            </a>
          )}

          {/* Tags */}
          {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {(post.tags as string[]).slice(0, 5).map((tag: string) => (
                <span key={tag} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-t border-border">
        <button onClick={handleLike} disabled={likeLoading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-muted-foreground hover:bg-muted"}`}>
          <Heart className={`h-4 w-4 transition-all ${liked ? "fill-red-500 scale-110" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <Link to={`/feed/${post.id}#comments`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count}</span>
        </Link>

        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
