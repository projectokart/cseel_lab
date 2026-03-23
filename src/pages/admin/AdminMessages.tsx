import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminMessages = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setContacts(data);
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true } as any).eq("id", id);
    toast({ title: "Marked as read" });
    fetchData();
  };

  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-white">{unreadCount} new</Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Institution</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer ${!c.is_read ? "bg-primary/5" : ""}`}
                  onClick={() => setSelected(c)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.institution || "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_read ? "secondary" : "default"}>
                      {c.is_read ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!c.is_read && (
                      <Button size="icon" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); markRead(c.id); }}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No messages yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message from {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div><span className="font-semibold text-sm">Email:</span> <span className="text-sm">{selected.email}</span></div>
              {selected.institution && <div><span className="font-semibold text-sm">Institution:</span> <span className="text-sm">{selected.institution}</span></div>}
              {selected.phone && <div><span className="font-semibold text-sm">Phone:</span> <span className="text-sm">{selected.phone}</span></div>}
              <div>
                <span className="font-semibold text-sm">Message:</span>
                <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="text-xs text-muted-foreground">Sent: {new Date(selected.created_at).toLocaleString()}</div>
              {!selected.is_read && (
                <Button size="sm" onClick={() => { markRead(selected.id); setSelected(null); }}>
                  <Check className="h-4 w-4 mr-2" /> Mark as Read
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
