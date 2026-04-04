import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { channelsApi, initials, timeAgo } from "@/services/socialService";
import type { Channel } from "@/services/socialService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Users, Rss, Loader2 } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";

const ChannelsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [channels, setChannels]       = useState<Channel[]>([]);
  const [subscribedSet, setSubbedSet] = useState<Set<string>>(new Set());
  const [myChannel, setMyChannel]     = useState<Channel | null>(null);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [form, setForm]               = useState({ name: "", description: "", avatar_url: "" });
  const [creating, setCreating]       = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await channelsApi.getAll();
    if (data) setChannels(data as Channel[]);
    if (user) {
      const subbed = await channelsApi.getSubscribedChannels(user.id);
      setSubbedSet(subbed);
      const { data: mine } = await channelsApi.getMyChannel(user.id);
      if (mine) setMyChannel(mine as Channel);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleSubscribe = async (e: React.MouseEvent, ch: Channel) => {
    e.preventDefault();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    const subbed = subscribedSet.has(ch.id);
    if (subbed) {
      await channelsApi.unsubscribe(ch.id, user.id);
      setSubbedSet(s => { const n = new Set(s); n.delete(ch.id); return n; });
      setChannels(cs => cs.map(c => c.id === ch.id ? { ...c, subscribers_count: Math.max(0, c.subscribers_count - 1) } : c));
    } else {
      await channelsApi.subscribe(ch.id, user.id);
      setSubbedSet(s => new Set([...s, ch.id]));
      setChannels(cs => cs.map(c => c.id === ch.id ? { ...c, subscribers_count: c.subscribers_count + 1 } : c));
    }
  };

  const handleCreate = async () => {
    if (!user || !form.name.trim()) { toast({ title: "Channel name required", variant: "destructive" }); return; }
    setCreating(true);
    const { data, error } = await channelsApi.create({
      owner_id: user.id, name: form.name.trim(),
      description: form.description || undefined,
      avatar_url: form.avatar_url || undefined,
    });
    setCreating(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Channel created!" });
    setCreateOpen(false);
    navigate(`/channels/${(data as any).id}`);
  };

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Channels</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Subscribe to creators & organisations</p>
            </div>
            {user && !myChannel && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full">
                <Plus className="h-4 w-4" /> Create Channel
              </Button>
            )}
            {myChannel && (
              <Link to={`/channels/${myChannel.id}`}>
                <Button variant="outline" className="gap-2 rounded-full">
                  <Rss className="h-4 w-4" /> My Channel
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 rounded-full" placeholder="Search channels..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Channels grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
                  <div className="flex gap-3"><div className="h-12 w-12 rounded-full bg-muted" /><div className="space-y-2 flex-1"><div className="h-4 bg-muted rounded w-2/3" /><div className="h-3 bg-muted rounded w-1/2" /></div></div>
                  <div className="h-3 bg-muted rounded" /><div className="h-8 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📡</div>
              <p className="font-semibold text-foreground mb-1">No channels yet</p>
              <p className="text-muted-foreground text-sm mb-4">Create the first channel!</p>
              {user && !myChannel && <Button onClick={() => setCreateOpen(true)}>Create Channel</Button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(ch => {
                const isOwner  = user?.id === ch.owner_id;
                const subbed   = subscribedSet.has(ch.id);
                const ownerName = (ch.owner as any)?.display_name || "Anonymous";
                return (
                  <Link key={ch.id} to={`/channels/${ch.id}`} className="block group">
                    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all h-full flex flex-col">
                      {/* Banner placeholder */}
                      {ch.banner_url && (
                        <div className="h-20 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl bg-muted">
                          <img src={ch.banner_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                          {ch.avatar_url ? <img src={ch.avatar_url} alt="" className="w-full h-full object-cover" /> : initials(ch.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{ch.name}</p>
                          <p className="text-xs text-muted-foreground">by {ownerName}</p>
                        </div>
                      </div>

                      {ch.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{ch.description}</p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" /> {ch.subscribers_count.toLocaleString()} subscribers
                        </span>
                        {!isOwner && (
                          <button
                            onClick={e => handleSubscribe(e, ch)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                              subbed
                                ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {subbed ? "Subscribed ✓" : "+ Subscribe"}
                          </button>
                        )}
                        {isOwner && <span className="text-xs text-primary font-semibold">Your channel</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Create channel modal */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Your Channel</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Channel Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Science with Rahul" /></div>
              <div className="space-y-2"><Label>Description</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is your channel about?" /></div>
              <div className="space-y-2"><Label>Avatar URL (optional)</Label><Input value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreate} disabled={creating}>
                  {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Creating…</> : "Create Channel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Layout>
  );
};

export default ChannelsPage;
