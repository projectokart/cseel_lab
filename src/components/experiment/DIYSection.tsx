import React from "react";
import { C, DIYProject, CodeSimData } from "./constants";
import { ScrollSection, Tag } from "./atoms";

interface Props {
  projects: DIYProject[];
  code?: CodeSimData;
}

const DIYSection: React.FC<Props> = ({ projects, code }) => {
  if (!projects.length && !code) return null;
  return (
    <ScrollSection id="diy" number="11" title="DIY & Major Projects + Code" icon="🔨">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {projects.map(({ title, difficulty, time, desc, skills }) => {
          const dc = difficulty === "Easy" ? C.green : difficulty === "Medium" ? C.gold : C.red;
          return (
            <div key={title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14 }}>{title}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: dc, background: `${dc}12`, padding: "2px 7px", borderRadius: 5 }}>{difficulty}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: C.textLight }}>{time}</span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.6 }}>{desc}</div>
              {skills && skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {skills.map(s => <Tag key={s} text={s} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {code && (
        <>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 15, marginBottom: 12 }}>💻 {code.language} Code Simulation</div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "18px 22px", fontFamily: "monospace", fontSize: 13, color: "#a8d8dd", lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {code.code}
          </div>
        </>
      )}
    </ScrollSection>
  );
};

export default DIYSection;
