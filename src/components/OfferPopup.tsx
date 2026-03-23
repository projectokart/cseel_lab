import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface PromoItem {
  id: string;
  title: string;
  content: string;
  cta_text: string | null;
  cta_link: string | null;
  accent_color: string;
}

const STORAGE_KEY = "offer-popup-closed";

const OfferPopup = () => {
  const [item, setItem] = useState<PromoItem | null>(null);

  useEffect(() => {
    const closed = localStorage.getItem(STORAGE_KEY);
    if (closed) {
      const hoursAgo = (Date.now() - Number(closed)) / 3600000;
      if (hoursAgo < 24) return;
    }

    const load = async () => {
      const { data } = await (supabase as any)
        .from("promotions")
        .select("id,title,content,cta_text,cta_link,accent_color")
        .eq("type", "popup")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .single();
      if (data) setTimeout(() => setItem(data as PromoItem), 2000);
    };
    load();
  }, []);

  const close = () => {
    setItem(null);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, backdropFilter: "blur(2px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1001, width: "min(480px,92vw)", background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
          >
            <button onClick={close} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              <X size={16} color="#444" />
            </button>
            <div style={{ height: 5, background: item.accent_color }} />
            <div style={{ padding: "28px 32px 32px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 12 }}>
                {item.title}
              </h2>
              <div
                style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
              {item.cta_text && item.cta_link && (
                <a href={item.cta_link} onClick={close}
                  style={{ display: "block", background: item.accent_color, color: "white", textAlign: "center", padding: "14px 24px", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                  {item.cta_text}
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;