import React from "react";
import { C, ProcedureStep } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  steps: ProcedureStep[];
}

const ProcedureSection: React.FC<Props> = ({ steps }) => {
  if (!steps.length) return null;
  return (
    <ScrollSection id="procedure" number="04" title="Step-by-Step Procedure" icon="📋" alt>
      <div style={{ display: "grid", gap: 14 }}>
        {steps.map(({ title, body, tip }, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, display: "flex", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.teal, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 14, fontWeight: "bold", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontWeight: "bold", color: C.navy, fontSize: 15, marginBottom: 5 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65 }}>{body}</div>
              {tip && <div style={{ marginTop: 8, padding: "7px 11px", background: `${C.gold}0e`, borderRadius: 7, border: `1px solid ${C.gold}30`, fontSize: 12, color: C.gold }}>💡 {tip}</div>}
            </div>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default ProcedureSection;
