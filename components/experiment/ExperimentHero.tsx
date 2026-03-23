import React from "react";
import { C, OverviewData } from "./constants";

interface Props {
  experiment: {
    title: string;
    subject: string;
    description?: string;
  };
  overview?: OverviewData;
  mode: "book" | "scroll";
  onModeChange: (mode: "book" | "scroll") => void;
}

const ExperimentHero: React.FC<Props> = ({ experiment, overview, mode, onModeChange }) => {
  const tags = overview?.tags || [experiment.subject];
  const duration = overview?.duration || "45 min";
  const difficulty = overview?.difficulty || "Medium";
  const quizCount = overview?.quiz_count || 0;

  return (
    <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,#0d2a4a 55%,#0a3a58 100%)`, padding: "52px 24px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,rgba(0,180,190,0.1) 1px,transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${C.teal},transparent)` }} />
      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 16 }}>
          {["Catalog", experiment.subject].map((b, i, arr) => (
            <React.Fragment key={b}>
              <span style={{ fontFamily: "monospace", fontSize: 10.5, color: i === arr.length - 1 ? C.teal : "rgba(255,255,255,0.4)" }}>{b}</span>
              {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>›</span>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.teal}20`, border: `1px solid ${C.teal}45`, borderRadius: 20, padding: "3px 12px", marginBottom: 14 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal }} />
              <span style={{ fontFamily: "monospace", fontSize: 9.5, color: C.teal, letterSpacing: "0.2em", textTransform: "uppercase" }}>{experiment.subject}</span>
            </div>
            <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(18px,2.8vw,28px)", color: "#ffffff", fontWeight: "bold", lineHeight: 1.3, marginBottom: 10, marginTop: 0 }}>
              {experiment.title}
            </h1>
            {experiment.description && (
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 18, maxWidth: 520 }}>
                {experiment.description}
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
              {tags.map(t => (
                <span key={t} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "monospace" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            {/* Mode Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 40, padding: 3, boxShadow: "0 2px 8px rgba(0,100,140,0.1)" }}>
              {(["book", "scroll"] as const).map(m => (
                <button key={m} onClick={() => onModeChange(m)}
                  style={{
                    padding: "8px 20px", border: "none", borderRadius: 36, cursor: "pointer",
                    background: mode === m ? C.teal : "transparent",
                    color: mode === m ? C.white : C.textMid,
                    fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em",
                    textTransform: "uppercase", fontWeight: mode === m ? "bold" : "normal",
                    transition: "all .2s",
                    boxShadow: mode === m ? `0 2px 12px ${C.teal}50` : "none",
                  }}>
                  {m === "book" ? "📖 Read as Book" : "📄 Scroll View"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              {[{ icon: "⏱", l: "Duration", v: duration }, { icon: "🎯", l: "Difficulty", v: difficulty }, { icon: "📋", l: "Quiz", v: `${quizCount} Qs` }].map(({ icon, l, v }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{icon}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${C.teal},transparent)` }} />
    </div>
  );
};

export default ExperimentHero;
