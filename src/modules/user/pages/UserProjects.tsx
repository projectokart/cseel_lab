import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Plus, Loader2, FlaskConical, Trash2, Clock, CheckCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProject {
  id: string; title: string; description: string | null; status: string;
  created_at: string; selected_experiment_id: string | null;
  experiments?: { title: string; thumbnail_url: string | null; subject: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:    { label: "Active",    color: "bg-green-100 text-green-700", icon: Clock },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700",   icon: CheckCircle },
  paused:    { label: "Paused",    color: "bg-gray-100 text-gray-500",   icon: PauseCircle },
};

const UserProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchProjects();
    else navigate("/login");
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("user_projects")
        .select("id, title, description, status, created_at, selected_experiment_id, experiments(title, thumbnail_url, subject)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      toast({ title: "Load failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const createProject = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const { data, error } = await (supabase as any)
        .from("user_projects")
        .insert({ user_id: user.id, title: "New Project", status: "active" })
        .select("id").single();
      if (error) throw error;
      navigate(`/my-project/${data.id}`);
    } catch (err: any) {
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
      setCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await (supabase as any).from("user_projects").delete().eq("id", id);
      if (error) throw error;
      setProjects(p => p.filter(x => x.id !== id));
      toast({ title: "Project deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={createProject} disabled={creating} className="gap-1">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No projects yet. Create your first one!</p>
          <Button onClick={createProject} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />} Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.active;
            const StatusIcon = sc.icon;
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group flex flex-col">
                <Link to={`/my-project/${p.id}`} className="block">
                  <div className="h-36 bg-muted overflow-hidden relative">
                    {p.experiments?.thumbnail_url ? (
                      <img src={p.experiments.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <FolderOpen className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>
                      <StatusIcon className="h-3 w-3" />{sc.label}
                    </span>
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/my-project/${p.id}`}>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">{p.title}</h3>
                  </Link>
                  {p.experiments ? (
                    <div className="flex items-center gap-1.5 mb-2">
                      <FlaskConical className="h-3 w-3 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{p.experiments.title}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-2">No experiment linked</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</span>
                    <div className="flex items-center gap-1">
                      <Link to={`/my-project/${p.id}`} className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">Open</Link>
                      <button onClick={() => deleteProject(p.id)} disabled={deletingId === p.id} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserProjects;
