import { useState, useEffect } from "react";
import { C, NAV_SECTIONS } from "./constants";

const StickyNav = ({ active }: { active: string }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const h = () => setVis(window.scrollY > 340);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!vis) return null;
  return (
    <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 200, background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,80,120,0.08)" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px", display: "flex", overflowX: "auto", gap: 0, scrollbarWidth: "none" }}>
        {NAV_SECTIONS.map(({ id, label }) => (
          <button key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            style={{ padding: "9px 13px", background: "none", border: "none", borderBottom: active === id ? `2px solid ${C.teal}` : "2px solid transparent", color: active === id ? C.teal : C.textLight, fontSize: 11.5, fontFamily: "monospace", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "color .15s" }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickyNav;
