import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Package, Star, X, Check } from "lucide-react";

type Material = {
  id: string; name: string; description: string; category: string;
  price: number; original_price: number; rating: number; reviews: number;
  stock: number; image_url: string; tag: string; includes: string[]; is_active: boolean;
};

const TAGS = ["", "Bestseller", "New", "Popular", "Pro"];
const CATEGORIES = ["Chemistry", "Physics", "Biology", "Electronics", "Robotics", "Mathematics", "Environment", "Other"];
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const empty = (): Omit<Material,"id"> => ({
  name:"", description:"", category:"Chemistry", price:0, original_price:0,
  rating:4.5, reviews:0, stock:0, image_url:"", tag:"", includes:[], is_active:true,
});

const AdminMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(empty());
  const [includeInput, setIncludeInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    setMaterials(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty()); setIncludeInput(""); setModalOpen(true); };
  const openEdit = (m: Material) => {
    setEditing(m);
    setForm({ name:m.name, description:m.description, category:m.category, price:m.price,
      original_price:m.original_price, rating:m.rating, reviews:m.reviews, stock:m.stock,
      image_url:m.image_url, tag:m.tag, includes:m.includes||[], is_active:m.is_active });
    setIncludeInput(""); setModalOpen(true);
  };

  const addInclude = () => {
    if (!includeInput.trim()) return;
    setForm(f => ({...f, includes:[...f.includes, includeInput.trim()]}));
    setIncludeInput("");
  };
  const removeInclude = (i: number) => setForm(f=>({...f, includes:f.includes.filter((_,idx)=>idx!==i)}));

  const handleSave = async () => {
    if (!form.name||!form.category||form.price<=0) {
      toast({ title:"Error", description:"Name, category and price required", variant:"destructive" }); return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("materials").update(form).eq("id", editing.id);
      if (error) toast({ title:"Error", description:error.message, variant:"destructive" });
      else toast({ title:"Updated!" });
    } else {
      const { error } = await supabase.from("materials").insert(form);
      if (error) toast({ title:"Error", description:error.message, variant:"destructive" });
      else toast({ title:"Material added!" });
    }
    setSaving(false); setModalOpen(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("materials").delete().eq("id", deleteId);
    toast({ title:"Deleted" }); setDeleteId(null); fetch();
  };

  const toggleActive = async (m: Material) => {
    await supabase.from("materials").update({ is_active: !m.is_active }).eq("id", m.id);
    fetch();
  };

  const filtered = materials.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Materials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{materials.length} products · {materials.filter(m=>m.is_active).length} active</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2"><Plus className="h-4 w-4"/> Add Material</Button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search materials..." className="pl-9"/>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rating</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {m.image_url ? <img src={m.image_url} alt={m.name} className="w-full h-full object-cover"/> : <Package className="h-5 w-5 m-auto text-muted-foreground mt-2.5"/>}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{m.name}</p>
                            {m.tag && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{m.tag}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{fmt(m.price)}</div>
                        {m.original_price>m.price && <div className="text-xs text-muted-foreground line-through">{fmt(m.original_price)}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${m.stock<=5?"text-red-500":m.stock<=15?"text-orange-500":"text-green-600"}`}>{m.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"/>
                          <span className="font-medium">{m.rating}</span>
                          <span className="text-xs text-muted-foreground">({m.reviews})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={()=>toggleActive(m)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${m.is_active?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {m.is_active?"Active":"Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>openEdit(m)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground"/></button>
                          <button onClick={()=>setDeleteId(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-400"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No materials found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?"Edit Material":"Add New Material"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Basic Chemistry Kit" className="mt-1"/>
              </div>
              <div>
                <Label>Category *</Label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                  className="w-full mt-1 h-9 border border-input rounded-md px-3 text-sm bg-background outline-none">
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Tag</Label>
                <select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}
                  className="w-full mt-1 h-9 border border-input rounded-md px-3 text-sm bg-background outline-none">
                  {TAGS.map(t=><option key={t} value={t}>{t||"None"}</option>)}
                </select>
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price||""} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))} className="mt-1"/>
              </div>
              <div>
                <Label>Original Price (₹)</Label>
                <Input type="number" value={form.original_price||""} onChange={e=>setForm(f=>({...f,original_price:Number(e.target.value)}))} className="mt-1"/>
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stock||""} onChange={e=>setForm(f=>({...f,stock:Number(e.target.value)}))} className="mt-1"/>
              </div>
              <div>
                <Label>Rating (0-5)</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating||""} onChange={e=>setForm(f=>({...f,rating:Number(e.target.value)}))} className="mt-1"/>
              </div>
              <div>
                <Label>Reviews Count</Label>
                <Input type="number" value={form.reviews||""} onChange={e=>setForm(f=>({...f,reviews:Number(e.target.value)}))} className="mt-1"/>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://..." className="mt-1"/>
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg"/>}
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  rows={3} placeholder="Product description..."
                  className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background outline-none resize-none focus:ring-2 focus:ring-primary/30"/>
              </div>
              <div className="col-span-2">
                <Label>What's Included</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={includeInput} onChange={e=>setIncludeInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addInclude();}}}
                    placeholder="e.g. 20x Test Tubes (press Enter)"/>
                  <Button type="button" onClick={addInclude} size="sm" variant="outline"><Plus className="h-4 w-4"/></Button>
                </div>
                {form.includes.length>0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.includes.map((item,i)=>(
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        <Check className="h-3 w-3"/>{item}
                        <button onClick={()=>removeInclude(i)} className="ml-1 hover:text-red-500"><X className="h-3 w-3"/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} className="h-4 w-4"/>
                <Label htmlFor="is_active">Active (visible on website)</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={()=>setModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving?"Saving...":editing?"Update":"Add Material"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-foreground mb-2">Delete Material?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setDeleteId(null)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;