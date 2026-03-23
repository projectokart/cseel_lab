import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CheckCircle, XCircle, Clock, Truck, ChevronDown, ChevronUp, User } from "lucide-react";

interface OrderItem {
  id: string;
  lab_material_id: string;
  quantity: number;
  price_at_order: number;
  lab_materials: {
    scientific_name: string;
    image_url: string | null;
    category: string;
  } | null;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles: { display_name: string | null; } | null;
  order_items: OrderItem[];
}

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved:  { label: "Approved",  color: "bg-blue-100 text-blue-700",    icon: CheckCircle },
  rejected:  { label: "Rejected",  color: "bg-red-100 text-red-700",      icon: XCircle },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700",  icon: Truck },
};

const AdminOrders = () => {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [editOrder, setEditOrder]   = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving]         = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select(`
          id, user_id, status, total_price, notes, admin_notes, created_at,
          profiles ( display_name ),
          order_items (
            id, lab_material_id, quantity, price_at_order,
            lab_materials ( scientific_name, image_url, category )
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast({ title: "Load failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await (supabase as any)
        .from("orders")
        .update({ status, admin_notes: adminNotes || null })
        .eq("id", orderId);
      if (error) throw error;
      toast({ title: `Order ${status} ✓` });
      setEditOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.profiles?.display_name || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    approved:  orders.filter(o => o.status === "approved").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-blue-600" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center border border-border">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search order ID, user..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No orders found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const sc = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            const isOpen = expanded === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Row */}
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : order.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary font-semibold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${sc.color}`}>
                          <StatusIcon className="h-3 w-3" />{sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{order.profiles?.display_name || "Unknown User"}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">₹{order.total_price?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{order.order_items?.length || 0} items</p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div className="border-t border-border p-4 bg-muted/20 space-y-3">
                      {/* Items */}
                      <div className="space-y-2">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-background rounded-lg border border-border">
                            <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                              {item.lab_materials?.image_url
                                ? <img src={item.lab_materials.image_url} className="w-full h-full object-contain" alt="" />
                                : <span className="text-xs text-muted-foreground">IMG</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.lab_materials?.scientific_name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price_at_order}</p>
                            </div>
                            <p className="text-sm font-semibold shrink-0">₹{(item.quantity * item.price_at_order).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-700">User Note</p>
                          <p className="text-xs text-yellow-700 mt-0.5">{order.notes}</p>
                        </div>
                      )}

                      {order.admin_notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700">Admin Note</p>
                          <p className="text-xs text-blue-700 mt-0.5">{order.admin_notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap pt-1">
                        {order.status === "pending" && (
                          <>
                            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                              onClick={() => { setEditOrder(order); setAdminNotes(order.admin_notes || ""); }}>
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1.5"
                              onClick={() => { setEditOrder({ ...order, status: "rejecting" }); setAdminNotes(order.admin_notes || ""); }}>
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {order.status === "approved" && (
                          <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(order.id, "delivered")}>
                            <Truck className="h-3.5 w-3.5" /> Mark Delivered
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1.5"
                          onClick={() => { setEditOrder(order); setAdminNotes(order.admin_notes || ""); }}>
                          Add Note
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approve/Reject Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editOrder?.status === "rejecting" ? "Reject Order" : "Update Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Admin Note (optional)</Label>
              <textarea
                className="w-full mt-1 border border-input rounded-lg p-2 text-sm bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30"
                rows={3}
                placeholder="Reason ya note..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOrder(null)}>Cancel</Button>
              {editOrder?.status === "rejecting" ? (
                <Button variant="destructive" className="flex-1" disabled={saving}
                  onClick={() => { setSaving(true); updateStatus(editOrder.id, "rejected"); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                </Button>
              ) : (
                <Button className="flex-1" disabled={saving}
                  onClick={() => { setSaving(true); updateStatus(editOrder!.id, "approved"); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;