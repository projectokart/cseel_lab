import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/social/PostCard";
import CreatePostModal from "@/components/social/CreatePostModal";
import { channelsApi, postsApi, initials } from "@/services/socialService";
import type { Channel, Post } from "@/services/socialService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, PenLine, Rss, Bell, BellOff } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [channel, setChannel]       = useState<Channel | null>(null);
  const [posts, setPosts]           = useState<Post[]>([]);
  const [likedSet, setLikedSet]     = useState<Set<string>>(new Set());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [chRes, postsRes] = await Promise.all([
        channelsApi.getOne(id),
        channelsApi.getChannelPosts(id),
      ]);
      if (chRes.data) setChannel(chRes.data as Channel);
      if (postsRes.data) setPosts(postsRes.data as Post[]);
      if (user) {
        const subbed = await channelsApi.getSubscribedChannels(user.id);
        setSubscribed(subbed.has(id));
        const liked = await postsApi.getLikedPosts(user.id);
        setLikedSet(liked);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleSubscribe = async () => {
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (subscribed) {
      await channelsApi.unsubscribe(id!, user.id);
      setSubscribed(false);
      setChannel(c => c ? { ...c, subscribers_count: Math.max(0, c.subscribers_count - 1) } : c);
    } else {
      await channelsApi.subscribe(id!, user.id);
      setSubscribed(true);
      setChannel(c => c ? { ...c, subscribers_count: c.subscribers_count + 1 } : c);
    }
  };

  const isOwner = user?.id === channel?.owner_id;
  const ownerName = channel ? ((channel.owner as any)?.display_name || "Anonymous") : "";

  if (loading) return (
    <Layout><div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-40 bg-muted rounded-2xl" />
      <div className="h-6 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div></Layout>
  );

  if (!channel) return (
    <Layout><div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-xl font-bold mb-2">Channel not found</p>
      <Link to="/channels"><Button>← All Channels</Button></Link>
    </div></Layout>
  );

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/channels" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Channels
          </Link>

          {/* Channel header */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            {/* Banner */}
            {channel.banner_url ? (
              <div className="h-36 bg-muted overflow-hidden">
                <img src={channel.banner_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
            )}

            <div className="p-5">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <div className="h-16 w-16 rounded-full border-4 border-card bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                  {channel.avatar_url ? <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" /> : initials(channel.name)}
                </div>
                <div className="flex-1 min-w-0 pt-8">
                  <h1 className="text-xl font-bold text-foreground">{channel.name}</h1>
                  <p className="text-sm text-muted-foreground">by {ownerName}</p>
                </div>
              </div>

              {channel.description && <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {channel.subscribers_count.toLocaleString()} subscribers</span>
                  <span>{posts.length} posts</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <Button onClick={() => setCreateOpen(true)} className="gap-1.5 rounded-full" size="sm">
                      <PenLine className="h-3.5 w-3.5" /> Post to Channel
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubscribe}
                      variant={subscribed ? "outline" : "default"}
                      className="gap-1.5 rounded-full"
                      size="sm"
                    >
                      {subscribed ? <><BellOff className="h-3.5 w-3.5" /> Unsubscribe</> : <><Bell className="h-3.5 w-3.5" /> Subscribe</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            <h2 className="font-bold text-foreground">{posts.length > 0 ? `${posts.length} Posts` : "No posts yet"}</h2>
            {posts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <Rss className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {isOwner ? "Post something to start your channel!" : "No posts yet. Subscribe to get notified!"}
                </p>
                {isOwner && <Button className="mt-3" onClick={() => setCreateOpen(true)}>Create first post</Button>}
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} likedByMe={likedSet.has(post.id)} />
              ))
            )}
          </div>
        </div>

        {isOwner && (
          <CreatePostModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            channelId={channel.id}
            onCreated={async () => {
              const { data } = await channelsApi.getChannelPosts(id!);
              if (data) setPosts(data as Post[]);
            }}
          />
        )}
      </PageTransition>
    </Layout>
  );
};

export default ChannelDetailPage;
