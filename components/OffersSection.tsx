import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Promotion = Tables<"promotions">;

const OffersSection = () => {
  const [items, setItems] = useState<Promotion[]>([]);

  useEffect(() => {
    supabase
      .from("promotions")
      .select("*")
      .eq("type", "offer")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Tag size={18} className="text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Special Offers & Events
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: item.bg_color,
                borderRadius: 20,
                padding: "24px",
                border: `1px solid ${item.accent_color}20`,
              }}
              className="flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h3>
              <div
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: 16,
                }}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
              {item.cta_text && item.cta_link && (
                <Link
                  to={item.cta_link}
                  style={{
                    color: item.accent_color,
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  {item.cta_text} <ArrowRight size={15} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;