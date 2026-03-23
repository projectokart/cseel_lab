import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Logo {
  id: string;
  name: string | null;
  image_url: string;
  sort_order: number | null;
}

const AdminLogos = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", image_url: "", sort_order: 0 });
  const { toast } = useToast();

  const fetchLogos = async () => {
    const { data } = await supabase.from("logos").select("*").order("sort_order");
    if (data) setLogos(data);
  };

  useEffect(() => { fetchLogos(); }, []);

  const handleAdd = async () => {
    if (!form.image_url) { toast({ title: "Error", description: "Image URL required", variant: "destructive" }); return; }
    await supabase.from("logos").insert({ name: form.name || null, image_url: form.image_url, sort_order: form.sort_order });
    toast({ title: "Added", description: "Logo added" });
    setOpen(false);
    setForm({ name: "", image_url: "", sort_order: 0 });
    fetchLogos();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("logos").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchLogos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Logo Slider</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Logo</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {logos.map((logo) => (
          <Card key={logo.id} className="group relative">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <img src={logo.image_url} alt={logo.name || "Logo"} className="h-16 w-auto object-contain" />
              <p className="text-xs text-muted-foreground truncate w-full text-center">{logo.name || "Unnamed"}</p>
              <Button size="icon" variant="ghost" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(logo.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {logos.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No logos yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Logo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogos;
