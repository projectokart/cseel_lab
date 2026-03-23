import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Megaphone, Gift, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
type PromoType = "announcement" | "offer" | "popup";

interface Promo {
  id: string;
  type: PromoType;
  title: string;
  content: string;        // HTML allowed
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string;
  accent_color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const EMPTY: Omit<Promo, "id" | "created_at"> = {
  type: "announcement",
  title: "",
  content: "",
  cta_text: "",
  cta_link: "",
  bg_color: "#0a5c8a",
  accent_color: "#ffffff",
  is_active: false,
  sort_order: 0,
};

const TYPE_META: Record<PromoType, { label: string; icon: any; desc: string; color: string }> = {
  announcement: { label: "Announcement Bar", icon: Megaphone, desc: "Top bar — slim, dismissible", color: "#0a5c8a" },
  offer:        { label: "Offers Section",   icon: Gift,      desc: "Card on homepage",         color: "#059669" },
  popup:        { label: "Popup Modal",      icon: Megaphone, desc: "Page load modal",           color: "#7C3AED" },
};

// ─── Main Component ──────────────────────────────────────────
const AdminPromotions = () => {
  const [items, setItems] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState<Omit<Promo, "id" | "created_at">>(EMPTY);
  const [activeTab, setActiveTab] = useState<PromoType>("announcement");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("promotions").select("*").order("type").order("sort_order");
    setItems((data as Promo[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, type: activeTab });
    setShowForm(true);
  };

  const openEdit = (item: Promo) => {
    setShowForm(true);
    setEditing(item);
    setForm({ type: item.type, title: item.title, content: item.content, cta_text: item.cta_text || "", cta_link: item.cta_link || "", bg_color: item.bg_color, accent_color: item.accent_color, is_active: item.is_active, sort_order: item.sort_order });
  };

  const save = async () => {
    if (!form.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    if (editing) {
      await supabase.from("promotions").update(form as any).eq("id", editing.id);
      toast({ title: "Updated!" });
    } else {
      await supabase.from("promotions").insert(form as any);
      toast({ title: "Created!" });
    }
    setSaving(false);
    setEditing(null);
    setForm(EMPTY);
    setShowForm(false);
    fetch();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetch();
  };

  const toggle = async (item: Promo) => {
    await supabase.from("promotions").update({ is_active: !item.is_active } as any).eq("id", item.id);
    fetch();
  };

  const filtered = items.filter(i => i.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage announcements, offers & popups</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {(Object.keys(TYPE_META) as PromoType[]).map(t => {
          const meta = TYPE_META[t];
          const count = items.filter(i => i.type === t).length;
          const activeCount = items.filter(i => i.type === t && i.is_active).length;
          return (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <meta.icon size={15} />
              {meta.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeCount > 0 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {activeCount > 0 ? `${activeCount} live` : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <strong>{TYPE_META[activeTab].label}</strong> — {TYPE_META[activeTab].desc}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm mb-3">No {TYPE_META[activeTab].label} yet</p>
          <button onClick={openNew} className="text-primary text-sm font-medium hover:underline">+ Create one</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${item.is_active ? "border-green-200 bg-green-50/30" : "border-border bg-background"}`}>
              {/* Color swatch */}
              <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: item.bg_color }} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.is_active ? "LIVE" : "INACTIVE"}
                  </span>
                </div>
                {/* HTML preview */}
                <p className="text-xs text-muted-foreground line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>/g, " ").slice(0, 120) + "..." }}
                />
                {item.cta_text && (
                  <p className="text-xs text-primary mt-1">CTA: {item.cta_text} → {item.cta_link}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggle(item)} title={item.is_active ? "Deactivate" : "Activate"}
                  className={`p-2 rounded-lg transition-colors ${item.is_active ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}>
                  {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => del(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setEditing(null); setForm(EMPTY); setShowForm(false); } }}>
          <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">{editing ? "Edit" : "New"} {TYPE_META[form.type].label}</h2>
              <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(false); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type selector (new only) */}
              {!editing && (
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(TYPE_META) as PromoType[]).map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${form.type === t ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}`}>
                        <div className="font-bold mb-0.5">{TYPE_META[t].label}</div>
                        <div className="text-muted-foreground">{TYPE_META[t].desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Title <span className="text-destructive">*</span></label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer Sale 50% Off"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              {/* Content — HTML */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Content <span className="text-xs text-muted-foreground font-normal">(HTML accepted)</span>
                </label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={5}
                  placeholder='e.g. 🎉 <strong>50% OFF</strong> on Annual Plans! Valid till March 31. <a href="/plans">See Plans</a>'
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono resize-y" />
                {/* Live HTML preview */}
                {form.content && (
                  <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">Preview</p>
                    <div dangerouslySetInnerHTML={{ __html: form.content }} className="prose prose-sm max-w-none" />
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">CTA Button Text</label>
                  <input value={form.cta_text || ""} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
                    placeholder="Register Now"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">CTA Link</label>
                  <input value={form.cta_link || ""} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))}
                    placeholder="/events/upcoming"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5" />
                    <input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Accent / Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5" />
                    <input value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                <div>
                  <p className="font-medium text-sm">Active / Live</p>
                  <p className="text-xs text-muted-foreground">Turn on to show on website</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(false); }}
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPromotions;