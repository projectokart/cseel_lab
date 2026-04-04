import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi } from "@/services/socialService";
import type { PostType } from "@/services/socialService";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultType?: PostType;
  channelId?: string;
  onCreated?: () => void;
}

const CreatePostModal = ({ open, onClose, defaultType = "feed", channelId, onCreated }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType]         = useState<PostType>(defaultType);
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages]     = useState<string[]>([]);
  const [tags, setTags]         = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc]   = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [saving, setSaving]     = useState(false);

  const addImage = () => {
    if (imageUrl.trim()) { setImages(i => [...i, imageUrl.trim()]); setImageUrl(""); }
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) {
      toast({ title: "Content required", variant: "destructive" }); return;
    }
    setSaving(true);
    const tagArr = tags.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean);
    const { error } = await postsApi.create({
      author_id:      user.id,
      type,
      title:          title.trim() || null,
      content:        content.trim(),
      image_urls:     images as any,
      tags:           tagArr as any,
      event_date:     eventDate || null,
      event_location: eventLoc  || null,
      project_url:    projectUrl || null,
      channel_id:     channelId || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed to post", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Posted successfully!" });
    setTitle(""); setContent(""); setImages([]); setTags(""); setEventDate(""); setEventLoc(""); setProjectUrl("");
    onClose(); onCreated?.();
  };

  const types: { value: PostType; label: string; emoji: string }[] = [
    { value: "feed",    label: "Post",    emoji: "💬" },
    { value: "project", label: "Project", emoji: "🔬" },
    { value: "event",   label: "Event",   emoji: "📅" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create {type === "feed" ? "Post" : type === "project" ? "Project" : "Event"}</DialogTitle></DialogHeader>

        {/* Type selector */}
        {!channelId && (
          <div className="flex gap-2">
            {types.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${type === t.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {/* Title (optional for feed, required for project/event) */}
          <div className="space-y-1.5">
            <Label>{type === "feed" ? "Title (optional)" : "Title *"}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={
              type === "event" ? "Event name..." : type === "project" ? "Project title..." : "Give your post a title..."
            } />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label>Content *</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                type === "event" ? "Describe the event..." :
                type === "project" ? "What did you build? How does it work?" :
                "What's on your mind?"
              }
            />
          </div>

          {/* Event specific */}
          {type === "event" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={eventLoc} onChange={e => setEventLoc(e.target.value)} placeholder="City, venue..." />
              </div>
            </div>
          )}

          {/* Project URL */}
          {type === "project" && (
            <div className="space-y-1.5">
              <Label>Project URL (optional)</Label>
              <Input value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}

          {/* Images */}
          <div className="space-y-1.5">
            <Label>Images (optional)</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL..." onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImage())} />
              <Button type="button" variant="outline" size="icon" onClick={addImage}><ImagePlus className="h-4 w-4" /></Button>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags (comma separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="science, physics, experiment..." />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving || !content.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Posting…</> : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
