import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PromoItem {
  id: string;
  title: string;
  content: string;
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string;
  accent_color: string;
}

const AnnouncementBar = () => {
  const [item, setItem] = useState<PromoItem | null>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (dismissed) return;

    const load = async () => {
      const { data } = await (supabase as any)
        .from("promotions")
        .select("id,title,content,cta_text,cta_link,bg_color,accent_color")
        .eq("type", "announcement")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .single();
      if (data) setItem(data as PromoItem);
    };
    load();
  }, []);

  if (!item) return null;

  const dismiss = () => {
    setItem(null);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  return (
    <div style={{
      background: item.bg_color,
      color: item.accent_color,
      padding: "10px 48px 10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      fontSize: 14,
      fontWeight: 500,
      position: "relative",
      zIndex: 999,
    }}>
      <span dangerouslySetInnerHTML={{ __html: item.content }} />
      {item.cta_text && item.cta_link && (
        <a href={item.cta_link} style={{ color: item.accent_color, fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}>
          {item.cta_text}
        </a>
      )}
      <button onClick={dismiss} style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        background: "transparent", border: "none", color: item.accent_color,
        cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
      }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBar;