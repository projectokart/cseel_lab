import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FlaskConical, ClipboardList, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ experiments: 0, assignments: 0, submitted: 0 });
  const [joinOpen, setJoinOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: enrollments } = await supabase.from("class_enrollments").select("class_id").eq("student_id", user.id);
      const classIds = enrollments?.map((e) => e.class_id) || [];
      
      let assignments = 0;
      if (classIds.length > 0) {
        const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).in("class_id", classIds);
        assignments = count || 0;
      }
      
      const { count: submitted } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("student_id", user.id);
      
      setStats({ experiments: classIds.length, assignments, submitted: submitted || 0 });
    };
    fetchStats();
  }, [user]);

  const handleJoinClass = async () => {
    if (!classCode || !user) return;
    // Find class by code
    const { data: classData } = await supabase.from("classes").select("id").eq("class_code", classCode).maybeSingle();
    if (!classData) {
      toast({ title: "Error", description: "Invalid class code", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("class_enrollments").insert({ class_id: classData.id, student_id: user.id });
    if (error?.code === "23505") {
      toast({ title: "Already enrolled", description: "You're already in this class" });
    } else if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined!", description: "You've joined the class" });
    }
    setJoinOpen(false);
    setClassCode("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
        <Button onClick={() => setJoinOpen(true)}>Join Class</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Classes</CardTitle>
            <FlaskConical className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{stats.experiments}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{stats.assignments}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
            <Trophy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{stats.submitted}</div></CardContent>
        </Card>
      </div>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Join a Class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class Code</Label>
              <Input placeholder="Enter class code" value={classCode} onChange={(e) => setClassCode(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
              <Button onClick={handleJoinClass}>Join</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
