import React from "react";
import { C, OverviewData, ConceptItem } from "./constants";
import { Callout, ScrollSection } from "./atoms";

interface Props {
  overview?: OverviewData;
  concepts?: ConceptItem[];
}

const ConceptOverview: React.FC<Props> = ({ overview, concepts }) => {
  return (
    <>
      {overview && (
        <ScrollSection id="overview" number="01" title="Overview & Objective" icon="🎯">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <Callout label="Overview" accent={C.teal}>{overview.overview}</Callout>
              <Callout label="Objective" accent={C.navy}>{overview.objective}</Callout>
            </div>
            <div>
              <Callout label="Hypothesis" accent={C.gold}>{overview.hypothesis}</Callout>
              <div style={{ padding: "16px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: C.teal, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Quick Stats</div>
                {[{ l: "Duration", v: overview.duration }, { l: "Difficulty", v: overview.difficulty }, { l: "Level", v: overview.level }, { l: "Subject", v: overview.subject }].map(({ l, v }) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.textMid }}>{l}</span>
                    <span style={{ fontWeight: "bold", color: C.navy }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollSection>
      )}

      {concepts && concepts.length > 0 && (
        <ScrollSection id="concept" number="02" title="Concept & Theory" icon="💡" alt>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
            {concepts.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, display: "flex", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollSection>
      )}
    </>
  );
};

export default ConceptOverview;
