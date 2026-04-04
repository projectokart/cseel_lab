import React from "react";
import { C, ApplicationItem } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  applications: ApplicationItem[];
}

const ApplicationsSection: React.FC<Props> = ({ applications }) => {
  if (!applications.length) return null;
  return (
    <ScrollSection id="applications" number="09" title="Applications in Daily Life & Industry" icon="🌍">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {applications.map(({ icon, category, title, desc }) => (
          <div key={title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14 }}>{title}</div>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: C.teal, background: C.tealLight, padding: "1px 6px", borderRadius: 4 }}>{category}</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollSection>
  );
};

export default ApplicationsSection;
