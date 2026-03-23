import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  name: string;
  institution: string | null;
  city: string | null;
  photo_url: string | null;
  quote: string;
}

const emptyForm = { name: "", institution: "", city: "", photo_url: "", quote: "" };

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetch = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    if (data) setItems(data);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.quote) { toast({ title: "Error", description: "Name and quote required", variant: "destructive" }); return; }
    if (editing) {
      await supabase.from("testimonials").update(form as any).eq("id", editing);
    } else {
      await supabase.from("testimonials").insert(form as any);
    }
    toast({ title: editing ? "Updated" : "Created" });
    setOpen(false); setEditing(null); setForm(emptyForm); fetch();
  };

  const handleEdit = (t: Testimonial) => {
    setEditing(t.id);
    setForm({ name: t.name, institution: t.institution || "", city: t.city || "", photo_url: t.photo_url || "", quote: t.quote });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Deleted" }); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <Card key={t.id} className="group relative">
            <CardContent className="p-6">
              <Quote className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-foreground italic mb-3 line-clamp-3">"{t.quote}"</p>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{[t.institution, t.city].filter(Boolean).join(", ")}</p>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No testimonials yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Institution</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="space-y-2"><Label>Photo URL</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} /></div>
            <div className="space-y-2"><Label>Quote *</Label><Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestimonials;
