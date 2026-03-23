import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  lab_material_id: string;
  scientific_name: string;
  common_names: string[];
  category: string;
  image_url: string | null;
  price: number;
  quantity: number;
}

export interface ExperimentItem {
  id: string;
  title: string;
  subject: string;
  thumbnail_url?: string | null;
  class?: string | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (labMaterialId: string, qty?: number) => Promise<void>;
  removeItem: (labMaterialId: string) => Promise<void>;
  updateQty: (labMaterialId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isInCart: (labMaterialId: string) => boolean;
  selectedExperiments: ExperimentItem[];
  selectedIds: string[];
  toggleSelect: (exp: ExperimentItem) => Promise<void>;
  clearSelected: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExperiments, setSelectedExperiments] = useState<ExperimentItem[]>([]);

  useEffect(() => {
    if (user) { fetchCart(); fetchSelectedExperiments(); }
    else { setItems([]); setSelectedExperiments([]); }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("cart_items")
        .select("id, lab_material_id, quantity, lab_materials(id, scientific_name, common_names, category, image_url, price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setItems((data || []).map((row: any) => ({
        id: row.id,
        lab_material_id: row.lab_material_id,
        scientific_name: row.lab_materials?.scientific_name || "",
        common_names: Array.isArray(row.lab_materials?.common_names) ? row.lab_materials.common_names : [],
        category: row.lab_materials?.category || "",
        image_url: row.lab_materials?.image_url || null,
        price: row.lab_materials?.price || 0,
        quantity: row.quantity,
      })));
    } catch (err: any) {
      console.error("Cart fetch error:", err.message);
    } finally { setLoading(false); }
  };

  const addItem = async (labMaterialId: string, qty = 1) => {
    if (!user) { toast({ title: "Login karein", description: "Cart use karne ke liye login karein", variant: "destructive" }); return; }
    try {
      const { error } = await (supabase as any).from("cart_items")
        .upsert({ user_id: user.id, lab_material_id: labMaterialId, quantity: qty }, { onConflict: "user_id,lab_material_id" });
      if (error) throw error;
      toast({ title: "Cart mein add ho gaya ✓" });
      await fetchCart();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const removeItem = async (labMaterialId: string) => {
    if (!user) return;
    try {
      await (supabase as any).from("cart_items").delete().eq("user_id", user.id).eq("lab_material_id", labMaterialId);
      setItems(prev => prev.filter(i => i.lab_material_id !== labMaterialId));
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const updateQty = async (labMaterialId: string, qty: number) => {
    if (!user) return;
    if (qty < 1) { await removeItem(labMaterialId); return; }
    try {
      await (supabase as any).from("cart_items").update({ quantity: qty }).eq("user_id", user.id).eq("lab_material_id", labMaterialId);
      setItems(prev => prev.map(i => i.lab_material_id === labMaterialId ? { ...i, quantity: qty } : i));
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const clearCart = async () => {
    if (!user) return;
    try { await (supabase as any).from("cart_items").delete().eq("user_id", user.id); setItems([]); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const fetchSelectedExperiments = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase as any)
        .from("user_experiment_selections")
        .select("experiment_id, experiments(id, title, subject, thumbnail_url, class)")
        .eq("user_id", user.id);
      setSelectedExperiments((data || []).map((r: any) => ({
        id: r.experiments?.id, title: r.experiments?.title,
        subject: r.experiments?.subject, thumbnail_url: r.experiments?.thumbnail_url,
        class: r.experiments?.class,
      })).filter((e: any) => e.id));
    } catch { }
  };

  const toggleSelect = async (exp: ExperimentItem) => {
    if (!user) { toast({ title: "Login karein", description: "Experiment select karne ke liye login karein", variant: "destructive" }); return; }
    const isSelected = selectedExperiments.some(e => e.id === exp.id);
    try {
      if (isSelected) {
        await (supabase as any).from("user_experiment_selections").delete().eq("user_id", user.id).eq("experiment_id", exp.id);
        setSelectedExperiments(prev => prev.filter(e => e.id !== exp.id));
      } else {
        await (supabase as any).from("user_experiment_selections")
          .insert({ user_id: user.id, experiment_id: exp.id });
        setSelectedExperiments(prev => [...prev, exp]);
      }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const clearSelected = () => setSelectedExperiments([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isInCart = (labMaterialId: string) => items.some(i => i.lab_material_id === labMaterialId);
  const selectedIds = selectedExperiments.map(e => e.id);

  return (
    <CartContext.Provider value={{
      items, loading, addItem, removeItem, updateQty, clearCart,
      totalItems, totalPrice, isInCart,
      selectedExperiments, selectedIds, toggleSelect, clearSelected,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};