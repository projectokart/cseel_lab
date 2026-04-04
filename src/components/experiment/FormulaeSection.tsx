import React from "react";
import { C, FormulaItem } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  formulae: FormulaItem[];
}

const FormulaeSection: React.FC<Props> = ({ formulae }) => {
  if (!formulae.length) return null;
  return (
    <ScrollSection id="formulae" number="07" title="Key Formulae" icon="📐">
      <div style={{ display: "grid", gap: 20 }}>
        {formulae.map(({ formula, name, vars }) => (
          <div key={name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22, display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ minWidth: 200, flexShrink: 0 }}>
              <div style={{ background: C.navy, borderRadius: 8, padding: "12px 20px", fontFamily: "Georgia,serif", fontSize: 20, color: C.teal, textAlign: "center", fontStyle: "italic", marginBottom: 8, boxShadow: `0 0 14px rgba(0,180,190,0.1)` }}>{formula}</div>
              <div style={{ fontSize: 13.5, fontWeight: "bold", color: C.navy }}>{name}</div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
              {vars.map(({ symbol, desc, unit }) => (
                <div key={symbol} style={{ padding: "8px 12px", background: C.offWhite, borderRadius: 7, border: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 17, color: C.teal, fontStyle: "italic", marginRight: 6 }}>{symbol}</span>
                  <span style={{ fontSize: 12, color: C.text }}>= {desc}</span>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: C.textLight, marginTop: 2 }}>{unit}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default FormulaeSection;
