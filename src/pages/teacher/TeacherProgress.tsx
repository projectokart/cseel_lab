import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const TeacherProgress = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      setLoading(true);
      // Get teacher's assignments
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, title")
        .eq("teacher_id", user.id);

      if (!assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }

      const assignmentIds = assignments.map((a) => a.id);
      const assignmentMap = Object.fromEntries(assignments.map((a) => [a.id, a.title]));

      // Get submissions for those assignments
      const { data: subs } = await supabase
        .from("submissions")
        .select("*")
        .in("assignment_id", assignmentIds)
        .order("submitted_at", { ascending: false });

      if (subs) {
        // Get student profiles
        const studentIds = [...new Set(subs.map((s) => s.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", studentIds);

        const profileMap = Object.fromEntries(
          (profiles || []).map((p) => [p.user_id, p.display_name || "Unknown"])
        );

        setSubmissions(
          subs.map((s) => ({
            ...s,
            assignment_title: assignmentMap[s.assignment_id] || "—",
            student_name: profileMap[s.student_id] || "Unknown",
          }))
        );
      }
      setLoading(false);
    };
    fetchProgress();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Student Progress</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.assignment_title}</TableCell>
                    <TableCell>{s.score !== null ? `${s.score}%` : "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={s.graded_at ? "secondary" : "default"}>
                        {s.graded_at ? "Graded" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No submissions yet. Assign experiments to your classes to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProgress;
