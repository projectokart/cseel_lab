import React from "react";
import { C, NumericalItem } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  numericals: NumericalItem[];
}

const NumericalsSection: React.FC<Props> = ({ numericals }) => {
  if (!numericals.length) return null;
  return (
    <ScrollSection id="numericals" number="08" title="Numerical Problems" icon="🔢" alt>
      <div style={{ display: "grid", gap: 16 }}>
        {numericals.map(({ question, given, solution, answer }, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14.5, marginBottom: 12 }}>Q{i + 1}. {question}</div>
            {given && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                {given.map(g => <span key={g} style={{ padding: "3px 10px", background: C.tealLight, borderRadius: 6, fontFamily: "monospace", fontSize: 12, color: C.teal }}>{g}</span>)}
              </div>
            )}
            <div style={{ fontFamily: "monospace", fontSize: 12.5, color: C.textMid, marginBottom: 8, padding: "8px 12px", background: C.offWhite, borderRadius: 7 }}>Solution: {solution}</div>
            <div style={{ fontFamily: "monospace", fontSize: 14, color: C.teal, fontWeight: "bold" }}>∴ {answer}</div>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default NumericalsSection;
