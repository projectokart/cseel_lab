import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Building2, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  picture_url: string | null;
  is_active: boolean | null;
  created_at: string;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  picture_url: "",
  is_active: true,
};

const AdminVendors = () => {
  const [vendors, setVendors]   = useState<Vendor[]>([]);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState<string | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setVendors((data || []) as Vendor[]);
    } catch (err: any) {
      toast({ title: "Load failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getNextId = async (): Promise<string> => {
    const { data, error } = await (supabase as any).rpc("next_vendor_id");
    if (error) throw new Error(error.message);
    return data as string;
  };

  const f = (k: keyof typeof emptyForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Vendor name required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await (supabase as any).from("vendors").update({
          name: form.name.trim(),
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          picture_url: form.picture_url || null,
          is_active: form.is_active,
        }).eq("id", editing);
        if (error) throw error;
        toast({ title: "Vendor updated ✓" });
      } else {
        const id = await getNextId();
        const { error } = await (supabase as any).from("vendors").insert({
          id,
          name: form.name.trim(),
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          picture_url: form.picture_url || null,
          is_active: form.is_active,
        });
        if (error) throw error;
        toast({ title: `Vendor created — ${id} ✓` });
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v: Vendor) => {
    setEditing(v.id);
    setForm({
      name: v.name,
      phone: v.phone || "",
      email: v.email || "",
      address: v.address || "",
      picture_url: v.picture_url || "",
      is_active: v.is_active ?? true,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    const { error } = await (supabase as any).from("vendors").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vendor deleted" });
      fetchAll();
    }
  };

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage lab material suppliers</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:w-56"
          />
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Add Vendor
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
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Address</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(v => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded font-semibold text-primary">
                        {v.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {v.picture_url ? (
                          <img src={v.picture_url} alt={v.name} className="w-8 h-8 rounded-full object-contain bg-gray-50 border" onError={e => (e.target as HTMLImageElement).style.display = "none"} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{v.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{v.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{v.email || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{v.address || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {v.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(v)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No vendors found
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
        <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit Vendor — ${editing}` : "Add New Vendor"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="space-y-1.5">
              <Label>Vendor Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="e.g. Sigma Aldrich India" value={form.name} onChange={e => f("name", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => f("phone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="info@vendor.com" value={form.email} onChange={e => f("email", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea className="pl-9" placeholder="Full address..." rows={2} value={form.address} onChange={e => f("address", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Logo / Picture URL</Label>
              <Input placeholder="https://..." value={form.picture_url} onChange={e => f("picture_url", e.target.value)} />
              {form.picture_url && (
                <img src={form.picture_url} alt="preview" className="h-10 object-contain mt-1 rounded border" onError={e => (e.target as HTMLImageElement).style.display = "none"} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="vendorActive" checked={form.is_active} onChange={e => f("is_active", e.target.checked)} className="w-4 h-4 accent-primary" />
              <Label htmlFor="vendorActive">Active</Label>
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

export default AdminVendors;