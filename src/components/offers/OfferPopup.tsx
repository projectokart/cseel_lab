import { useState, useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
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
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

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
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 9998,
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
          />

          {/*
            KEY FIX: Centering wrapper div — full viewport, flex center.
            Old code used transform: translate(-50%,-50%) directly on the
            motion.div which conflicted with framer-motion's y animation,
            causing the popup to render off-center on mobile.
          */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              pointerEvents: "none",
            }}
          >
            <motion.div
              key="popup"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              style={{
                pointerEvents: "auto",
                width: "min(480px, 100%)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff",
                borderRadius: 24,
                boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
                position: "relative",
              }}
            >
              {/* Top accent stripe */}
              <div style={{ height: 5, background: item.accent_color, borderRadius: "24px 24px 0 0" }} />

              {/* Close button */}
              <button
                onClick={close}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.07)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.13)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
                aria-label="Close offer"
              >
                <X size={16} color="#444" />
              </button>

              {/* Body */}
              <div style={{ padding: "28px 32px 32px" }}>
                {/* Badge */}
                <div style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: item.accent_color,
                      background: item.accent_color + "18",
                      padding: "4px 10px",
                      borderRadius: 99,
                    }}
                  >
                    <Sparkles size={11} />
                    Special Offer
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.3,
                    marginBottom: 12,
                    paddingRight: 30,
                  }}
                >
                  {item.title}
                </h2>

                <div
                  style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65, marginBottom: 24 }}
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                {item.cta_text && item.cta_link && (
                  <a
                    href={item.cta_link}
                    onClick={close}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: item.accent_color,
                      color: "white",
                      padding: "14px 24px",
                      borderRadius: 14,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      transition: "opacity 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = "0.92";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    {item.cta_text}
                  </a>
                )}

                <button
                  onClick={close}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 12,
                    padding: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#9CA3AF",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;