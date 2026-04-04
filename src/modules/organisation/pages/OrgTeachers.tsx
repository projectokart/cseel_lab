import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const OrgTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      if (!roles || roles.length === 0) { setLoading(false); return; }
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
      // Get class counts for each teacher
      const withClasses = await Promise.all((profiles || []).map(async (p) => {
        const { count } = await supabase.from("classes").select("id", { count: "exact", head: true }).eq("teacher_id", p.user_id).eq("is_active", true);
        return { ...p, classCount: count || 0 };
      }));
      setTeachers(withClasses);
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const filtered = teachers.filter(t =>
    (t.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.institution || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{teachers.length} registered teachers</p>
        </div>
        <GraduationCap className="h-8 w-8 text-primary/30" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search teachers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <TableHead>Classes</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.display_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{t.institution || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{t.city || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{t.classCount} classes</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No teachers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgTeachers;
