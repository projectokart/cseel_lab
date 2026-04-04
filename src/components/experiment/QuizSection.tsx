import React, { useState } from "react";
import { C, QuizItem } from "./constants";
import { ScrollSection } from "./atoms";

const QuizCard = ({ item, idx }: { item: QuizItem; idx: number }) => {
  const [sel, setSel] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <div style={{ fontWeight: "bold", color: C.navy, marginBottom: 12, fontSize: 14 }}>Q{idx + 1}. {item.question}</div>
      <div style={{ display: "grid", gap: 7, marginBottom: 12 }}>
        {item.options.map((o, i) => {
          let bg = C.offWhite, bdr = C.border, clr = C.text;
          if (shown) {
            if (i === item.answer) { bg = `${C.green}12`; bdr = C.green; clr = C.green; }
            else if (i === sel) { bg = `${C.red}10`; bdr = C.red; clr = C.red; }
          } else if (i === sel) { bg = C.tealLight; bdr = C.teal; clr = C.teal; }
          return (
            <button key={i} onClick={() => !shown && setSel(i)}
              style={{ textAlign: "left", padding: "9px 13px", background: bg, border: `1px solid ${bdr}`, borderRadius: 7, color: clr, fontSize: 13, cursor: shown ? "default" : "pointer", fontFamily: "inherit", transition: "all .15s" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, marginRight: 7 }}>{String.fromCharCode(65 + i)}.</span>{o}
            </button>
          );
        })}
      </div>
      <button onClick={() => sel !== null && setShown(true)} disabled={sel === null || shown}
        style={{ padding: "7px 16px", background: sel !== null && !shown ? C.teal : C.border, color: sel !== null && !shown ? C.white : C.textLight, border: "none", borderRadius: 20, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", cursor: sel !== null && !shown ? "pointer" : "default" }}>
        {shown ? "✓ Done" : "Check Answer"}
      </button>
      {shown && <div style={{ marginTop: 10, padding: "9px 13px", background: C.tealLight, borderRadius: 7, fontSize: 12, color: C.navyMid, borderLeft: `3px solid ${C.teal}` }}>💡 {item.explanation}</div>}
    </div>
  );
};

interface Props {
  quiz: QuizItem[];
  relatedExperiments?: string[];
}

const QuizSection: React.FC<Props> = ({ quiz, relatedExperiments }) => {
  if (!quiz.length) return null;
  return (
    <ScrollSection id="quiz" number="13" title="Self-Check Quiz" icon="✏️">
      {quiz.map((q, i) => <QuizCard key={i} item={q} idx={i} />)}
      {relatedExperiments && relatedExperiments.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 16, marginBottom: 16 }}>🔗 Related Experiments</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {relatedExperiments.map(t => (
              <div key={t} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer" }}>
                <div style={{ fontSize: 13.5, fontWeight: "bold", color: C.navy, marginBottom: 4 }}>{t}</div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: C.teal }}>View →</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ScrollSection>
  );
};

export default QuizSection;
