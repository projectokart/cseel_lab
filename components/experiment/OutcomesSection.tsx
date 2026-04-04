import React from "react";
import { C } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  outcomes: string[];
}

const OutcomesSection: React.FC<Props> = ({ outcomes }) => {
  if (!outcomes.length) return null;
  return (
    <ScrollSection id="outcomes" number="10" title="Learning Outcomes" icon="🎓" alt>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {outcomes.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.teal, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "monospace", flexShrink: 0, fontWeight: "bold" }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{o}</span>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default OutcomesSection;
