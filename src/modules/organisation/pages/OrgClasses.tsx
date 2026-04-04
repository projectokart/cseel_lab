import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const OrgClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("classes")
        .select("id, name, description, class_code, is_active, created_at, teacher_id")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      const teacherIds = [...new Set(data.map(c => c.teacher_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", teacherIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.display_name]));

      const withCounts = await Promise.all(data.map(async (c) => {
        const { count } = await supabase.from("class_enrollments").select("id", { count: "exact", head: true }).eq("class_id", c.id);
        return { ...c, studentCount: count || 0, teacherName: profileMap[c.teacher_id] || "Unknown" };
      }));
      setClasses(withCounts);
      setLoading(false);
    };
    fetchClasses();
  }, []);

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.teacherName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Classes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{classes.length} total classes</p>
        </div>
        <BookOpen className="h-8 w-8 text-primary/30" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search classes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-muted-foreground text-sm">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.teacherName}</TableCell>
                    <TableCell><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{c.class_code}</span></TableCell>
                    <TableCell><Badge variant="secondary">{c.studentCount} students</Badge></TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "outline"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No classes found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgClasses;
