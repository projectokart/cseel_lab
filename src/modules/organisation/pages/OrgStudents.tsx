import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const OrgStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      if (!roles || roles.length === 0) { setLoading(false); return; }
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
      const withEnrollments = await Promise.all((profiles || []).map(async (p) => {
        const { count } = await supabase.from("class_enrollments").select("id", { count: "exact", head: true }).eq("student_id", p.user_id);
        const { count: subs } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("student_id", p.user_id);
        return { ...p, enrollments: count || 0, submissions: subs || 0 };
      }));
      setStudents(withEnrollments);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    (s.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.institution || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{students.length} registered students</p>
        </div>
        <Users className="h-8 w-8 text-primary/30" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-muted-foreground text-sm">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Classes Enrolled</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.display_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.institution || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.city || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{s.enrollments}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{s.submissions}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgStudents;
