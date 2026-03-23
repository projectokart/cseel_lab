import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Mail } from "lucide-react";

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  is_read: boolean | null;
  created_at: string;
}

const AdminSupport = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets((data as Ticket[]) || []);
  };

  useEffect(() => { fetchTickets(); }, []);

  const markResolved = async (id: string) => {
    await supabase.from("support_tickets").update({ status: "resolved", is_read: true }).eq("id", id);
    toast({ title: "Ticket resolved" });
    fetchTickets();
    setSelected(null);
  };

  const statusColor = (s: string) => s === "open" ? "destructive" : "secondary";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(t)}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.subject || "-"}</TableCell>
                      <TableCell><Badge variant={statusColor(t.status)}>{t.status}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {tickets.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No tickets</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          {selected ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">{selected.subject || "No Subject"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {selected.email}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {new Date(selected.created_at).toLocaleString()}
                </div>
                {selected.status === "open" && (
                  <Button onClick={() => markResolved(selected.id)} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Resolved
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Click a ticket to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
