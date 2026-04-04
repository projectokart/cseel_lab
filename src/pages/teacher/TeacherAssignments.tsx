import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeacherAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ class_id: "", experiment_id: "", title: "", instructions: "", due_date: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [a, c, e] = await Promise.all([
        supabase.from("assignments").select("*, classes(name), experiments(title)").eq("teacher_id", user.id).order("created_at", { ascending: false }),
        supabase.from("classes").select("id, name").eq("teacher_id", user.id),
        supabase.from("experiments").select("id, title").eq("is_active", true),
      ]);
      if (a.data) setAssignments(a.data);
      if (c.data) setClasses(c.data);
      if (e.data) setExperiments(e.data);
    };
    fetchAll();
  }, [user]);

  const handleCreate = async () => {
    if (!form.class_id || !form.experiment_id || !form.title || !user) return;
    await supabase.from("assignments").insert({
      class_id: form.class_id, experiment_id: form.experiment_id,
      title: form.title, instructions: form.instructions || null,
      due_date: form.due_date || null, teacher_id: user.id,
    });
    toast({ title: "Assignment created" });
    setOpen(false);
    setForm({ class_id: "", experiment_id: "", title: "", instructions: "", due_date: "" });
    // Refetch
    const { data } = await supabase.from("assignments").select("*, classes(name), experiments(title)").eq("teacher_id", user.id).order("created_at", { ascending: false });
    if (data) setAssignments(data);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("assignments").delete().eq("id", id);
    toast({ title: "Deleted" });
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Experiment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{(a.classes as any)?.name || "—"}</TableCell>
                  <TableCell>{(a.experiments as any)?.title || "—"}</TableCell>
                  <TableCell className="text-xs">{a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No assignments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experiment *</Label>
              <Select value={form.experiment_id} onValueChange={(v) => setForm({ ...form, experiment_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select experiment" /></SelectTrigger>
                <SelectContent>
                  {experiments.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
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

export default TeacherAssignments;
