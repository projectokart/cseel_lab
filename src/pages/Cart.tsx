import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2, ShoppingCart, ArrowLeft, FlaskConical,
  Plus, Minus, Package, Loader2, CheckCircle,
} from "lucide-react";

const Cart = () => {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice,
          selectedExperiments, toggleSelect } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"materials" | "experiments">("materials");

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setPlacing(true);
    try {
      // Create order
      const { data: order, error: oErr } = await (supabase as any)
        .from("orders")
        .insert({ user_id: user.id, total_price: totalPrice, notes: notes || null, status: "pending" })
        .select("id")
        .single();
      if (oErr) throw oErr;

      // Insert order items
      const orderItems = items.map(i => ({
        order_id: order.id,
        lab_material_id: i.lab_material_id,
        quantity: i.quantity,
        price_at_order: i.price,
      }));
      const { error: iErr } = await (supabase as any).from("order_items").insert(orderItems);
      if (iErr) throw iErr;

      // Clear cart
      await clearCart();
      toast({ title: "Order place ho gaya ✓", description: "Admin approve karega jald hi" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">

          <div className="flex items-center gap-3 mb-6">
            <Link to="/hands-on-experiments" className="text-primary hover:underline flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Catalog
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">My Cart</h1>
          <p className="text-sm text-muted-foreground mb-6">{totalItems} items · ₹{totalPrice.toFixed(2)}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "materials" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Lab Materials {items.length > 0 && <span className="ml-1.5 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{items.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab("experiments")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "experiments" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Experiments {selectedExperiments.length > 0 && <span className="ml-1.5 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{selectedExperiments.length}</span>}
            </button>
          </div>

          {/* LAB MATERIALS TAB */}
          {activeTab === "materials" && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Lab materials cart khali hai</p>
                  <Link to="/hands-on-experiments"><Button>Browse Experiments</Button></Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map(item => (
                      <Card key={item.id}>
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="w-14 h-14 rounded-lg border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image_url
                              ? <img src={item.image_url} alt={item.scientific_name} className="w-full h-full object-contain" />
                              : <Package className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{item.scientific_name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                            <p className="text-sm font-bold text-primary mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          {/* Qty controls */}
                          <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
                            <button onClick={() => updateQty(item.lab_material_id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted text-sm font-bold transition-colors">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQty(item.lab_material_id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted text-sm font-bold transition-colors">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.lab_material_id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Order summary */}
                  <div className="border border-border rounded-2xl p-4 mb-4 bg-muted/30">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <textarea
                    className="w-full border border-input rounded-xl p-3 text-sm bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30 mb-4"
                    rows={2} placeholder="Order note (optional)..."
                    value={notes} onChange={e => setNotes(e.target.value)}
                  />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={clearCart}>Clear All</Button>
                    <Button className="flex-1 gap-2" onClick={placeOrder} disabled={placing || !user}>
                      {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      {user ? `Place Order (₹${totalPrice.toFixed(2)})` : "Login to Order"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* EXPERIMENTS TAB */}
          {activeTab === "experiments" && (
            <>
              {selectedExperiments.length === 0 ? (
                <div className="text-center py-20">
                  <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Koi experiment select nahi kiya</p>
                  <Link to="/hands-on-experiments"><Button>Browse Experiments</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExperiments.map(exp => (
                    <Card key={exp.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {exp.thumbnail_url
                            ? <img src={exp.thumbnail_url} alt={exp.title} className="w-full h-full object-cover" />
                            : <FlaskConical className="h-6 w-6 m-auto mt-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/experiment/${exp.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                            {exp.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{exp.subject} · {exp.class || "Higher Ed"}</p>
                        </div>
                        <button onClick={() => toggleSelect(exp)} className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </PageTransition>
    </Layout>
  );
};

export default Cart;