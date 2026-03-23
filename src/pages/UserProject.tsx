import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, FlaskConical, Package, Plus, Trash2,
  ShoppingCart, CheckCircle, Loader2, Edit2, Save, X,
} from "lucide-react";
import LabMaterialDetail, { LabMaterialData } from "@/components/LabMaterialDetail";

interface Project {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  status: string;
  selected_experiment_id: string | null;
  experiments?: {
    id: string;
    title: string;
    subject: string;
    thumbnail_url: string | null;
  } | null;
}

interface ProjectMaterial {
  id: string;
  lab_material_id: string;
  quantity: number;
  notes: string | null;
  lab_materials: LabMaterialData | null;
}

const UserProject = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [project, setProject]         = useState<Project | null>(null);
  const [materials, setMaterials]     = useState<ProjectMaterial[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editMode, setEditMode]       = useState(false);
  const [editTitle, setEditTitle]     = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editNotes, setEditNotes]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [selectedMat, setSelectedMat] = useState<LabMaterialData | null>(null);
  const [labMats, setLabMats]         = useState<LabMaterialData[]>([]);
  const [showAddMat, setShowAddMat]   = useState(false);
  const [matSearch, setMatSearch]     = useState("");

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data: proj, error } = await (supabase as any)
        .from("user_projects")
        .select(`id, title, description, notes, status, selected_experiment_id,
          experiments ( id, title, subject, thumbnail_url )`)
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      setProject(proj);
      setEditTitle(proj.title);
      setEditDesc(proj.description || "");
      setEditNotes(proj.notes || "");

      const { data: mats } = await (supabase as any)
        .from("project_materials")
        .select(`id, lab_material_id, quantity, notes,
          lab_materials ( id, scientific_name, common_names, category, image_url, price, original_price, stock, current_stock, rating, warning, safety, handling, storage, specification, vendor_id )`)
        .eq("project_id", id)
        .order("added_at", { ascending: true });
      setMaterials(mats || []);
    } catch {
      toast({ title: "Project nahi mila", variant: "destructive" });
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const searchLabMaterials = async (query: string) => {
    if (!query.trim()) { setLabMats([]); return; }
    try {
      // Fuzzy + exact search: common_names text search + scientific_name ilike + similarity
      const q = query.trim();
      const { data } = await (supabase as any).rpc("search_lab_materials", { query: q });
      setLabMats((data || []).map((m: any) => ({
        ...m,
        common_names: Array.isArray(m.common_names) ? m.common_names : [],
      })));
    } catch {
      // Fallback to simple ilike if RPC not available
      try {
        const { data } = await (supabase as any)
          .from("lab_materials")
          .select("id, scientific_name, common_names, category, image_url, price, original_price, stock, current_stock, rating, warning, safety, handling, storage, specification, vendor_id")
          .eq("is_active", true)
          .ilike("scientific_name", `%${query}%`)
          .order("scientific_name")
          .limit(20);
        setLabMats((data || []).map((m: any) => ({
          ...m,
          common_names: Array.isArray(m.common_names) ? m.common_names : [],
        })));
      } catch { }
    }
  };

  const saveProject = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("user_projects")
        .update({ title: editTitle.trim(), description: editDesc || null, notes: editNotes || null })
        .eq("id", id);
      if (error) throw error;
      setProject(p => p ? { ...p, title: editTitle, description: editDesc, notes: editNotes } : p);
      setEditMode(false);
      toast({ title: "Project saved ✓" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addMaterial = async (matId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("project_materials")
        .upsert({ project_id: id, lab_material_id: matId, quantity: 1 }, { onConflict: "project_id,lab_material_id" });
      if (error) throw error;
      toast({ title: "Material added ✓" });
      fetchProject();
      setShowAddMat(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const removeMaterial = async (pmId: string) => {
    await (supabase as any).from("project_materials").delete().eq("id", pmId);
    setMaterials(prev => prev.filter(m => m.id !== pmId));
    toast({ title: "Removed" });
  };

  const filteredLabMats = labMats;

  const alreadyAdded = new Set(materials.map(m => m.lab_material_id));

  if (loading) return (
    <PageTransition><Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </Layout></PageTransition>
  );

  if (!project) return null;

  return (
    <PageTransition>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Back */}
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> My Projects
          </Link>

          {/* Project Header */}
          <div className="border border-border rounded-2xl p-5 mb-6 bg-background">
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full mt-1 border border-input rounded-lg p-2 text-sm bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30"
                    rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)}
                    placeholder="Project description..."
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="w-full mt-1 border border-input rounded-lg p-2 text-sm bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30"
                    rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                    placeholder="Apne project ke notes yahan likhein..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveProject} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)} className="gap-1.5">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
                  <button onClick={() => setEditMode(true)} className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
                {project.notes && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs font-semibold text-foreground mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Linked Experiment */}
          {project.experiments && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Linked Experiment</h2>
              <Link
                to={`/experiment/${project.experiments.id}`}
                className="flex items-center gap-3 p-4 border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  {project.experiments.thumbnail_url
                    ? <img src={project.experiments.thumbnail_url} className="w-full h-full object-cover" alt="" />
                    : <FlaskConical className="h-6 w-6 m-auto mt-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{project.experiments.title}</p>
                  <p className="text-xs text-muted-foreground">{project.experiments.subject}</p>
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          )}

          {/* Project Materials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Materials ({materials.length})</h2>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setShowAddMat(true); setMatSearch(""); setLabMats([]); }}>
                <Plus className="h-3.5 w-3.5" /> Add Material
              </Button>
            </div>

            {materials.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Koi material nahi add kiya abhi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map(pm => {
                  const m = pm.lab_materials;
                  if (!m) return null;
                  const inCart = isInCart(m.id);
                  return (
                    <div key={pm.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-background">
                      <button onClick={() => setSelectedMat(m)} className="w-12 h-12 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                        {m.image_url
                          ? <img src={m.image_url} className="w-full h-full object-contain" alt="" />
                          : <Package className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <button onClick={() => setSelectedMat(m)} className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left truncate w-full">
                          {m.scientific_name}
                        </button>
                        <p className="text-xs text-muted-foreground">₹{m.price?.toFixed(2)} · Qty: {pm.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => addItem(m.id, pm.quantity)}
                          className={`p-1.5 rounded-lg transition-colors ${inCart ? "text-green-600 bg-green-50" : "hover:bg-muted text-muted-foreground"}`}
                          title={inCart ? "Already in cart" : "Add to cart"}
                        >
                          {inCart ? <CheckCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        </button>
                        <button onClick={() => removeMaterial(pm.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </Layout>

      {/* Add Material Modal */}
      {showAddMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowAddMat(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Add Material</h3>
              <button onClick={() => setShowAddMat(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-3 border-b border-border">
              <Input
                placeholder="Type to search materials..."
                value={matSearch}
                autoFocus
                onChange={e => {
                  setMatSearch(e.target.value);
                  searchLabMaterials(e.target.value);
                }}
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {!matSearch.trim() ? (
                <div className="py-10 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Type karo material dhundhne ke liye</p>
                </div>
              ) : filteredLabMats.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">Koi result nahi mila</p>
                </div>
              ) : null}
              {filteredLabMats.map(m => {
                const added = alreadyAdded.has(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => !added && addMaterial(m.id)}
                    disabled={added}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors mb-1 ${added ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-muted"}`}
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                      {m.image_url ? <img src={m.image_url} className="w-full h-full object-contain" alt="" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.scientific_name}</p>
                      <p className="text-xs text-muted-foreground">₹{m.price?.toFixed(2)}</p>
                    </div>
                    {added && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {selectedMat && <LabMaterialDetail material={selectedMat} onClose={() => setSelectedMat(null)} />}

    </PageTransition>
  );
};

export default UserProject;