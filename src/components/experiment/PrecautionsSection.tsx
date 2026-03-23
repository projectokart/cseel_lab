import React from "react";
import { C, PrecautionItem } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  precautions: PrecautionItem[];
}

const PrecautionsSection: React.FC<Props> = ({ precautions }) => {
  if (!precautions.length) return null;
  return (
    <ScrollSection id="precautions" number="12" title="Precautions & Safety" icon="⚠️" alt>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {precautions.map(({ icon, text }, i) => (
          <div key={i} style={{ display: "flex", gap: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>{text}</span>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default PrecautionsSection;
