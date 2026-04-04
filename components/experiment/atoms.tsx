import React from "react";
import { C } from "./constants";

export const Tag = ({ text }: { text: string }) => (
  <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 20, background: C.tealLight, color: C.teal, fontSize: 10, fontFamily: "monospace", marginRight: 5, marginBottom: 4, border: `1px solid ${C.tealMid}` }}>{text}</span>
);

export const FBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: C.navy, borderRadius: 8, padding: "10px 16px", fontFamily: "Georgia,serif", fontSize: 16, color: C.teal, textAlign: "center", fontStyle: "italic", letterSpacing: "0.06em", margin: "8px 0", boxShadow: `0 0 14px rgba(0,180,190,0.12)` }}>
    {children}
  </div>
);

export const Callout = ({ label, children, accent = C.teal }: { label?: string; children: React.ReactNode; accent?: string }) => (
  <div style={{ borderLeft: `3px solid ${accent}`, background: `${accent}0d`, borderRadius: "0 6px 6px 0", padding: "8px 12px", marginBottom: 10 }}>
    {label && <div style={{ fontFamily: "monospace", fontSize: 9, color: accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4, fontWeight: "bold" }}>{label}</div>}
    <div style={{ fontSize: 11.5, color: C.text, lineHeight: 1.65 }}>{children}</div>
  </div>
);

export const MiniDivider = () => (
  <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border},transparent)`, margin: "10px 0" }} />
);

export const Step = ({ n, title, body, tip }: { n: number; title: string; body: string; tip?: string }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.teal, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold", flexShrink: 0, fontFamily: "monospace" }}>{n}</div>
    <div>
      <div style={{ fontSize: 11.5, fontWeight: "bold", color: C.navy, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.55 }}>{body}</div>
      {tip && <div style={{ marginTop: 4, fontSize: 10.5, color: C.gold, fontStyle: "italic" }}>💡 {tip}</div>}
    </div>
  </div>
);

export const ScrollSection = ({ id, title, icon, number, alt = false, children }: {
  id: string; title: string; icon: string; number: string; alt?: boolean; children: React.ReactNode;
}) => (
  <section id={id} style={{ background: alt ? "#f4fafc" : C.white, padding: "52px 0", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 14, borderBottom: `2px solid ${C.teal}` }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9.5, color: C.teal, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 2 }}>{number}</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: "bold", color: C.navy, margin: 0 }}>{title}</h2>
        </div>
      </div>
      {children}
    </div>
  </section>
);
