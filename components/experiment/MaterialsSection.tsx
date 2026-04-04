import React from "react";
import { C, MaterialItem } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  materials: MaterialItem[];
}

const MaterialsSection: React.FC<Props> = ({ materials }) => {
  if (!materials.length) return null;
  return (
    <ScrollSection id="materials" number="03" title="Materials & Apparatus" icon="🔧">
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {materials.map(({ item, qty, spec, note }, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.offWhite }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal }} />
              <div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: "500" }}>{item}</div>
                {(note || spec) && <div style={{ fontSize: 11.5, color: C.textLight, marginTop: 1 }}>{note || spec}</div>}
              </div>
            </div>
            {qty && <span style={{ fontFamily: "monospace", fontSize: 12, color: C.teal, background: C.tealLight, padding: "3px 10px", borderRadius: 6 }}>{qty}</span>}
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default MaterialsSection;
