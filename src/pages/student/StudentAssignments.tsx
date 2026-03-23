import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, Upload } from "lucide-react";

const StudentAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    const { data: enrollments } = await supabase.from("class_enrollments").select("class_id").eq("student_id", user.id);
    const classIds = enrollments?.map((e: any) => e.class_id) || [];

    if (classIds.length === 0) { setLoading(false); return; }

    const { data } = await supabase
      .from("assignments")
      .select("*, classes(name), experiments(title)")
      .in("class_id", classIds)
      .order("due_date");

    const { data: submissions } = await supabase
      .from("submissions")
      .select("assignment_id, content, submitted_at")
      .eq("student_id", user.id);

    const submissionMap: Record<string, any> = {};
    submissions?.forEach((s: any) => { submissionMap[s.assignment_id] = s; });

    if (data) {
      setAssignments(data.map((a: any) => ({
        ...a,
        submitted: !!submissionMap[a.id],
        submission: submissionMap[a.id] || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, [user]);

  const openSubmit = (assignment: any) => {
    setActiveAssignment(assignment);
    setAnswer(assignment.submission?.content || "");
    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !activeAssignment || !answer.trim()) {
      toast({ title: "Error", description: "Please write your answer before submitting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Upsert: update if already submitted
    const { error } = await supabase.from("submissions").upsert({
      student_id: user.id,
      assignment_id: activeAssignment.id,
      content: answer.trim(),
      submitted_at: new Date().toISOString(),
    }, { onConflict: "student_id,assignment_id" });

    setSubmitting(false);
    if (error) {
      toast({ title: "Submit failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Submitted!", description: "Your assignment has been submitted successfully." });
      setSubmitOpen(false);
      fetchAssignments();
    }
  };

  const pending = assignments.filter(a => !a.submitted);
  const submitted = assignments.filter(a => a.submitted);

  const isOverdue = (dueDate: string) => dueDate && new Date(dueDate) < new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">My Assignments</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {pending.length} pending · {submitted.length} submitted
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/>
            <p className="text-muted-foreground font-medium">No assignments yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Join a class to see your assignments here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-orange-400"/> Pending ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(a => (
                  <Card key={a.id} className={`border ${isOverdue(a.due_date) ? "border-red-200 bg-red-50/30" : "border-border"}`}>
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{a.title}</h3>
                          {isOverdue(a.due_date) && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{(a.classes as any)?.name} {(a.experiments as any)?.title && `· ${(a.experiments as any).title}`}</p>
                        {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                        {a.due_date && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3"/>
                            Due: {new Date(a.due_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={()=>openSubmit(a)} className="flex items-center gap-1.5 flex-shrink-0">
                        <Upload className="h-3.5 w-3.5"/> Submit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Submitted */}
          {submitted.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500"/> Submitted ({submitted.length})
              </h2>
              <div className="space-y-3">
                {submitted.map(a => (
                  <Card key={a.id} className="border border-green-100 bg-green-50/20">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{a.title}</h3>
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">Submitted</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{(a.classes as any)?.name}</p>
                        {a.submission?.submitted_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3"/>
                            Submitted: {new Date(a.submission.submitted_at).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={()=>openSubmit(a)} className="flex-shrink-0 text-xs">
                        Edit Submission
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeAssignment?.submitted ? "Edit Submission" : "Submit Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeAssignment?.title}</p>
              {activeAssignment?.description && (
                <p className="text-xs text-muted-foreground mt-1">{activeAssignment.description}</p>
              )}
            </div>
            <div>
              <Label htmlFor="answer" className="text-sm font-medium">Your Answer</Label>
              <Textarea
                id="answer"
                placeholder="Write your answer here..."
                value={answer}
                onChange={e=>setAnswer(e.target.value)}
                rows={6}
                className="mt-1.5 text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setSubmitOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting||!answer.trim()}>
                {submitting ? "Submitting..." : activeAssignment?.submitted ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAssignments;
