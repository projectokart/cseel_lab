import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeacherClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const fetchClasses = async () => {
    if (!user) return;
    const { data } = await supabase.from("classes").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
    if (data) {
      // Get enrollment counts
      const withCounts = await Promise.all(data.map(async (c) => {
        const { count } = await supabase.from("class_enrollments").select("id", { count: "exact", head: true }).eq("class_id", c.id);
        return { ...c, studentCount: count || 0 };
      }));
      setClasses(withCounts);
    }
  };

  useEffect(() => { fetchClasses(); }, [user]);

  const handleCreate = async () => {
    if (!form.name || !user) return;
    await supabase.from("classes").insert({ name: form.name, description: form.description || null, teacher_id: user.id });
    toast({ title: "Class created" });
    setOpen(false); setForm({ name: "", description: "" }); fetchClasses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    toast({ title: "Class deleted" }); fetchClasses();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `Class code: ${code}` });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <Card key={c.id} className="group relative">
            <CardHeader>
              <CardTitle className="text-lg">{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {c.description && <p className="text-sm text-muted-foreground mb-3">{c.description}</p>}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{c.class_code}</span>
                <Button size="icon" variant="ghost" onClick={() => copyCode(c.class_code)}><Copy className="h-3 w-3" /></Button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {c.studentCount} students
              </div>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(c.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No classes yet. Create one to get started!</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Class Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherClasses;
