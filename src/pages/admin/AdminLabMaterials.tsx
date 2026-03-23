import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, X, AlertTriangle, Shield, Package, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── TYPES ─────────────────────────────────────────────────────────
interface Vendor { id: string; name: string; }

interface LabMaterial {
  id: string;
  scientific_name: string;
  common_names: string[] | null;
  specification: string | null;
  category: string;
  warning: string | null;
  safety: string | null;
  handling: string | null;
  storage: string | null;
  vendor_id: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  current_stock: number;
  rating: number;
  is_active: boolean | null;
  created_at: string;
}

// ── CATEGORIES ────────────────────────────────────────────────────
const CATEGORIES = [
  { code: "CHE", label: "Chemical",            color: "bg-blue-100 text-blue-700" },
  { code: "GLS", label: "Glassware",           color: "bg-cyan-100 text-cyan-700" },
  { code: "EQP", label: "General Equipment",   color: "bg-orange-100 text-orange-700" },
  { code: "BIO", label: "Biological",          color: "bg-green-100 text-green-700" },
  { code: "ELC", label: "Electrical",          color: "bg-yellow-100 text-yellow-700" },
  { code: "SAF", label: "Safety Equipment",    color: "bg-red-100 text-red-700" },
  { code: "CON", label: "Consumable",          color: "bg-purple-100 text-purple-700" },
  { code: "PHY", label: "Physics Instrument",  color: "bg-indigo-100 text-indigo-700" },
  { code: "MIC", label: "Microscopy",          color: "bg-teal-100 text-teal-700" },
  { code: "MSR", label: "Measurement Tool",    color: "bg-pink-100 text-pink-700" },
];

const UNITS = ["mL", "L", "g", "kg", "mg", "pieces", "pairs", "boxes", "drops", "M solution", "%"];

const emptyForm = {
  scientific_name: "",
  common_names_input: "",   // comma separated input
  specification: "",
  category: "CHE",
  warning: "",
  safety: "",
  handling: "",
  storage: "",
  vendor_id: "",
  image_url: "",
  price: "",
  original_price: "",
  stock: "",
  current_stock: "",
  rating: "",
  is_active: true,
};

const AdminLabMaterials = () => {
  const [materials, setMaterials] = useState<LabMaterial[]>([]);
  const [vendors, setVendors]     = useState<Vendor[]>([]);
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState<string | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: mats }, { data: vends }] = await Promise.all([
      (supabase as any).from("lab_materials").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("vendors").select("id,name").eq("is_active", true).order("name"),
    ]);
    setMaterials((mats || []) as LabMaterial[]);
    setVendors((vends || []) as Vendor[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const f = (k: keyof typeof emptyForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const getNextId = async (cat: string) => {
    const { data } = await (supabase as any).rpc("next_material_id", { cat_code: cat });
    return data as string;
  };

  const handleSave = async () => {
    if (!form.scientific_name.trim()) {
      toast({ title: "Scientific name required", variant: "destructive" }); return;
    }
    setSaving(true);

    const commonNames = form.common_names_input
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      scientific_name: form.scientific_name.trim(),
      common_names: commonNames,
      specification: form.specification || null,
      category: form.category,
      warning: form.warning || null,
      safety: form.safety || null,
      handling: form.handling || null,
      storage: form.storage || null,
      vendor_id: form.vendor_id || null,
      image_url: form.image_url || null,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0,
      current_stock: parseInt(form.current_stock) || 0,
      rating: parseFloat(form.rating) || 0,
      is_active: form.is_active,
    };

    if (editing) {
      await (supabase as any).from("lab_materials").update(payload).eq("id", editing);
      toast({ title: "Material updated" });
    } else {
      const id = await getNextId(form.category);
      await (supabase as any).from("lab_materials").insert({ id, ...payload });
      toast({ title: `Material created — ${id}` });
    }

    setSaving(false);
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchAll();
  };

  const handleEdit = (m: LabMaterial) => {
    setEditing(m.id);
    setForm({
      scientific_name: m.scientific_name,
      common_names_input: (m.common_names || []).join(", "),
      specification: m.specification || "",
      category: m.category,
      warning: m.warning || "",
      safety: m.safety || "",
      handling: m.handling || "",
      storage: m.storage || "",
      vendor_id: m.vendor_id || "",
      image_url: m.image_url || "",
      price: m.price?.toString() || "",
      original_price: m.original_price?.toString() || "",
      stock: m.stock?.toString() || "",
      current_stock: m.current_stock?.toString() || "",
      rating: m.rating?.toString() || "",
      is_active: m.is_active ?? true,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await (supabase as any).from("lab_materials").delete().eq("id", id);
    toast({ title: "Material deleted" });
    fetchAll();
  };

  const filtered = materials.filter(m => {
    const matchSearch =
      m.scientific_name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      (m.common_names || []).some(n => n.toLowerCase().includes(search.toLowerCase()));
    const matchCat = catFilter === "ALL" || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const getCatInfo = (code: string) => CATEGORIES.find(c => c.code === code) || { label: code, color: "bg-gray-100 text-gray-600" };
  const getVendorName = (id: string | null) => vendors.find(v => v.id === id)?.name || "—";

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Lab Materials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{materials.length} materials in inventory</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, ID, alias..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-40 shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Add Material
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">ID</TableHead>
                  <TableHead>Scientific Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Common Names</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Vendor</TableHead>
                  <TableHead className="hidden md:table-cell w-24">Stock</TableHead>
                  <TableHead className="hidden md:table-cell w-24">Price</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => {
                  const cat = getCatInfo(m.category);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded font-semibold text-primary whitespace-nowrap">
                          {m.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-sm max-w-[160px] truncate">{m.scientific_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(m.common_names || []).slice(0, 2).map((n, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{n}</span>
                          ))}
                          {(m.common_names || []).length > 2 && (
                            <span className="text-xs text-muted-foreground">+{(m.common_names || []).length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cat.color}`}>
                          {cat.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{getVendorName(m.vendor_id)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs">
                          <span className={`font-semibold ${m.current_stock < 10 ? "text-red-600" : "text-green-600"}`}>
                            {m.current_stock}
                          </span>
                          <span className="text-muted-foreground"> / {m.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-medium">₹{m.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(m)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      No materials found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit — ${editing}` : "Add New Lab Material"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">

            {/* Category — first because ID depends on it */}
            <div className="space-y-1.5">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={form.category} onValueChange={v => f("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{c.code}</span>{c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editing && (
                <p className="text-xs text-muted-foreground">ID will be: Item-{form.category}-XXXX</p>
              )}
            </div>

            {/* Scientific name */}
            <div className="space-y-1.5">
              <Label>Scientific Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Hydrochloric Acid" value={form.scientific_name} onChange={e => f("scientific_name", e.target.value)} />
            </div>

            {/* Common names */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Common Names / Aliases</Label>
              <Input
                placeholder="HCl, Muriatic Acid, Hydrogen Chloride (comma separated)"
                value={form.common_names_input}
                onChange={e => f("common_names_input", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma se alag karo — search mein yeh sab kaam karenge</p>
            </div>

            {/* Specification */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Specification</Label>
              <Input placeholder="e.g. 37% w/w, AR Grade, Density: 1.19 g/mL" value={form.specification} onChange={e => f("specification", e.target.value)} />
            </div>

            {/* Vendor */}
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select value={form.vendor_id || "none"} onValueChange={v => f("vendor_id", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{v.id}</span>{v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input placeholder="https://..." value={form.image_url} onChange={e => f("image_url", e.target.value)} />
            </div>

            {/* Pricing */}
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" placeholder="0.00" value={form.price} onChange={e => f("price", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Original Price (₹)</Label>
              <Input type="number" placeholder="Optional MRP" value={form.original_price} onChange={e => f("original_price", e.target.value)} />
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <Label>Total Stock</Label>
              <Input type="number" placeholder="0" value={form.stock} onChange={e => f("stock", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Current Stock</Label>
              <Input type="number" placeholder="0" value={form.current_stock} onChange={e => f("current_stock", e.target.value)} />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label>Rating (0–5)</Label>
              <Input type="number" min="0" max="5" step="0.1" placeholder="4.5" value={form.rating} onChange={e => f("rating", e.target.value)} />
            </div>

            {/* Warning */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> Warning
              </Label>
              <Textarea rows={2} placeholder="Hazard information..." value={form.warning} onChange={e => f("warning", e.target.value)} />
            </div>

            {/* Safety */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-blue-500" /> Safety Instructions
              </Label>
              <Textarea rows={2} placeholder="PPE requirements, safety measures..." value={form.safety} onChange={e => f("safety", e.target.value)} />
            </div>

            {/* Handling */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Handling Instructions</Label>
              <Textarea rows={2} placeholder="How to handle safely..." value={form.handling} onChange={e => f("handling", e.target.value)} />
            </div>

            {/* Storage */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Storage Instructions</Label>
              <Textarea rows={2} placeholder="Storage conditions, temperature, compatibility..." value={form.storage} onChange={e => f("storage", e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="matActive" checked={form.is_active} onChange={e => f("is_active", e.target.checked)} className="w-4 h-4 accent-primary" />
              <Label htmlFor="matActive">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5 min-w-20">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLabMaterials;