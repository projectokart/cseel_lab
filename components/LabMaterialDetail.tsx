import { useState } from "react";
import { X, ShoppingCart, AlertTriangle, Shield, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export interface LabMaterialData {
  id: string;
  scientific_name: string;
  common_names: string[] | null;
  specification: string | null;
  category: string;
  warning: string | null;
  safety: string | null;
  handling: string | null;
  storage: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  current_stock: number;
  rating: number;
  vendor_id: string | null;
}

const CAT_COLOR: Record<string, string> = {
  CHE: "bg-blue-100 text-blue-700",
  GLS: "bg-cyan-100 text-cyan-700",
  EQP: "bg-orange-100 text-orange-700",
  BIO: "bg-green-100 text-green-700",
  ELC: "bg-yellow-100 text-yellow-700",
  SAF: "bg-red-100 text-red-700",
  CON: "bg-purple-100 text-purple-700",
  PHY: "bg-indigo-100 text-indigo-700",
  MIC: "bg-teal-100 text-teal-700",
  MSR: "bg-pink-100 text-pink-700",
};

const CAT_LABEL: Record<string, string> = {
  CHE: "Chemical", GLS: "Glassware", EQP: "Equipment",
  BIO: "Biological", ELC: "Electrical", SAF: "Safety",
  CON: "Consumable", PHY: "Physics", MIC: "Microscopy", MSR: "Measurement",
};

interface Props {
  material: LabMaterialData;
  onClose: () => void;
}

const LabMaterialDetail = ({ material, onClose }: Props) => {
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const inCart = isInCart(material.id);
  const catColor = CAT_COLOR[material.category] || "bg-gray-100 text-gray-600";
  const catLabel = CAT_LABEL[material.category] || material.category;
  const discount = material.original_price && material.original_price > material.price
    ? Math.round((1 - material.price / material.original_price) * 100)
    : null;

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(material.id, qty);
    setAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${catColor}`}>{catLabel}</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{material.id}</span>
            </div>
            <h2 className="text-base font-bold text-foreground leading-tight">{material.scientific_name}</h2>
            {material.common_names && material.common_names.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{material.common_names.join(", ")}</p>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image + Price */}
          <div className="flex gap-4">
            <div className="w-24 h-24 shrink-0 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
              {material.image_url ? (
                <img src={material.image_url} alt={material.scientific_name} className="w-full h-full object-contain" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-primary">₹{material.price?.toFixed(2)}</span>
                {material.original_price && material.original_price > material.price && (
                  <span className="text-sm text-muted-foreground line-through">₹{material.original_price?.toFixed(2)}</span>
                )}
                {discount && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{discount}% off</span>
                )}
              </div>
              {material.specification && (
                <p className="text-xs text-muted-foreground mt-1">{material.specification}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-semibold ${material.current_stock < 5 ? "text-red-500" : material.current_stock < 15 ? "text-orange-500" : "text-green-600"}`}>
                  {material.current_stock < 1 ? "Out of stock" : material.current_stock < 5 ? `Only ${material.current_stock} left` : `${material.current_stock} in stock`}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          {material.warning && (
            <div className="flex gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-700 mb-0.5">Warning</p>
                <p className="text-xs text-orange-700 leading-relaxed">{material.warning}</p>
              </div>
            </div>
          )}

          {/* Safety */}
          {material.safety && (
            <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <Shield className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">Safety Instructions</p>
                <p className="text-xs text-blue-700 leading-relaxed">{material.safety}</p>
              </div>
            </div>
          )}

          {/* Handling + Storage */}
          {(material.handling || material.storage) && (
            <div className="grid grid-cols-1 gap-3">
              {material.handling && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs font-semibold text-foreground mb-1">Handling</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{material.handling}</p>
                </div>
              )}
              {material.storage && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs font-semibold text-foreground mb-1">Storage</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{material.storage}</p>
                </div>
              )}
            </div>
          )}

          {/* Qty + Add to Cart */}
          {user && material.current_stock > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-sm font-bold"
                >−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(material.current_stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-sm font-bold"
                >+</button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={adding || inCart}
                className="flex-1 gap-2"
              >
                {inCart ? (
                  <><CheckCircle className="h-4 w-4" /> Cart mein hai</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> {adding ? "Adding..." : "Add to Cart"}</>
                )}
              </Button>
            </div>
          )}

          {!user && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Cart mein add karne ke liye <a href="/login" className="text-primary font-semibold hover:underline">login karein</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabMaterialDetail;