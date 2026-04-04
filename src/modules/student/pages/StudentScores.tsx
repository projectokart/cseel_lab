import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StudentScores = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchScores = async () => {
      const { data } = await supabase.from("submissions").select("*, assignments(title)").eq("student_id", user.id).order("submitted_at", { ascending: false });
      if (data) setSubmissions(data);
    };
    fetchScores();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Scores</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Graded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{(s.assignments as any)?.title || "—"}</TableCell>
                  <TableCell>{s.score !== null ? `${s.score}%` : "Not graded"}</TableCell>
                  <TableCell className="text-xs">{new Date(s.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{s.graded_at ? new Date(s.graded_at).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
              {submissions.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No submissions yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentScores;
