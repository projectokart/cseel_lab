import React, { useRef, useState, useEffect, useCallback } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { C, OverviewData, ConceptItem, MaterialItem, ProcedureStep, FormulaItem, NumericalItem, ApplicationItem, DIYProject, PrecautionItem, QuizItem, ResultsData } from "./constants";
import { Tag, FBox, Callout, MiniDivider, Step } from "./atoms";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── Crinkle Sound ──
function playCrinkle() {
  try {
    // @ts-ignore
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf; g.gain.value = 0.15;
    src.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}

// ── Page Shell ──
const Page = React.forwardRef((props: any, ref: any) => (
  <div ref={ref} className="h-full overflow-hidden flex flex-col"
    style={{ background: C.pageBg, boxShadow: "inset 8px 0 24px -8px rgba(0,100,140,0.08), inset -2px 0 8px rgba(0,0,0,0.03)" }}>
    <div style={{ height: 3, background: `linear-gradient(90deg,${C.teal},${C.navy})`, flexShrink: 0 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 16px 5px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal }} />
        <span style={{ fontFamily: "monospace", fontSize: 8, color: C.teal, letterSpacing: "0.22em", textTransform: "uppercase" }}>C.S.E.E.L</span>
      </div>
      <span style={{ fontFamily: "Georgia,serif", fontSize: 8.5, color: C.textLight, fontStyle: "italic" }}>{props.subtitle || "Experiment"}</span>
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, background: "linear-gradient(90deg,rgba(0,100,180,0.06),transparent)", pointerEvents: "none", zIndex: 2 }} />
    {props.title && (
      <div style={{ padding: "8px 16px 0 22px", flexShrink: 0 }}>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 12.5, fontWeight: "bold", color: C.navy, borderBottom: `2px solid ${C.teal}`, paddingBottom: 5, marginBottom: 9, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
          {props.title}
        </h3>
      </div>
    )}
    <div style={{ flex: 1, overflow: "hidden", padding: "8px 16px 6px 22px", fontSize: 11, color: C.text, lineHeight: 1.65 }}>
      {props.children}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 16px 4px 22px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <span style={{ fontFamily: "monospace", fontSize: 7.5, color: C.textLight, letterSpacing: "0.2em", textTransform: "uppercase" }}>Experiential Learning</span>
      <span style={{ fontFamily: "Georgia,serif", fontSize: 9, color: C.textLight, fontStyle: "italic" }}>— {props.number} —</span>
    </div>
    <div style={{ height: 3, background: `linear-gradient(90deg,${C.navy},${C.teal})`, flexShrink: 0 }} />
  </div>
));
Page.displayName = "Page";

// ── Covers ──
const CoverFront = React.forwardRef((props: { title: string; subject?: string }, ref: any) => (
  <div ref={ref} data-density="hard"
    style={{ background: `linear-gradient(145deg,${C.navy} 0%,#0d2a4a 55%,#0a3050 100%)`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(0,180,190,0.12) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${C.teal},transparent)` }} />
    <div style={{ textAlign: "center", zIndex: 1, padding: "24px 28px", border: `1px solid rgba(0,180,190,0.25)`, borderRadius: 6, maxWidth: "82%" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px", background: `${C.teal}15` }}>🧪</div>
      <div style={{ fontFamily: "monospace", fontSize: 8, color: C.teal, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 8 }}>C.S.E.E.L · Lab Journal</div>
      <div style={{ width: 44, height: 1, background: `${C.teal}60`, margin: "0 auto 12px" }} />
      <h1 style={{ fontFamily: "Georgia,serif", fontSize: 20, color: "#ffffff", fontWeight: "bold", lineHeight: 1.25, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8, marginTop: 0 }}>
        {props.title}
      </h1>
      {props.subject && <div style={{ fontFamily: "Georgia,serif", fontSize: 12, color: C.teal, fontStyle: "italic", marginBottom: 12 }}>{props.subject}</div>}
      <div style={{ width: 44, height: 1, background: `${C.gold}50`, margin: "0 auto 10px" }} />
      <div style={{ fontFamily: "monospace", fontSize: 8, color: `${C.gold}90`, letterSpacing: "0.3em" }}>2026 EDITION</div>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${C.teal},transparent)` }} />
  </div>
));
CoverFront.displayName = "CoverFront";

const CoverBack = React.forwardRef((_: any, ref: any) => (
  <div ref={ref} data-density="hard"
    style={{ background: C.navy, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(0,180,190,0.08) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
    <div style={{ textAlign: "center", opacity: 0.4 }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 12, color: C.teal, fontStyle: "italic", letterSpacing: "0.15em", marginBottom: 8 }}>End of Report</div>
      <div style={{ width: 36, height: 1, background: C.teal, margin: "0 auto 8px" }} />
      <div style={{ fontFamily: "monospace", fontSize: 8, color: C.teal, letterSpacing: "0.3em" }}>C.S.E.E.L · 2026</div>
    </div>
  </div>
));
CoverBack.displayName = "CoverBack";

// ── Mini Chart for flipbook ──
const MiniChart = ({ data }: { data: any[] }) => (
  <div style={{ height: 130 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.teal} stopOpacity={0.3} />
            <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis dataKey="r" tick={{ fontSize: 8, fill: C.textLight }} />
        <YAxis tick={{ fontSize: 8, fill: C.textLight }} />
        <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10 }} />
        <Area type="monotone" dataKey="B2" stroke={C.teal} strokeWidth={2} fill="url(#cg1)" dot={{ fill: C.teal, r: 3 }} />
        <Area type="monotone" dataKey="B4" stroke={C.navy} strokeWidth={1.5} fill="none" strokeDasharray="4 2" dot={{ fill: C.navy, r: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ── PROPS ──
interface FlipbookProps {
  experimentTitle: string;
  experimentSubject?: string;
  overview?: OverviewData;
  concepts?: ConceptItem[];
  materials?: MaterialItem[];
  procedure?: ProcedureStep[];
  results?: ResultsData;
  formulae?: FormulaItem[];
  numericals?: NumericalItem[];
  applications?: ApplicationItem[];
  outcomes?: string[];
  diyProjects?: DIYProject[];
  precautions?: PrecautionItem[];
  quiz?: QuizItem[];
}

const FlipbookView: React.FC<FlipbookProps> = ({
  experimentTitle, experimentSubject, overview, concepts, materials, procedure,
  results, formulae, numericals, applications, outcomes, diyProjects, precautions, quiz,
}) => {
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [bookW, setBookW] = useState(420);
  const [bookH, setBookH] = useState(600);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      if (vw < 520) { setBookW(300); setBookH(440); setPortrait(true); }
      else if (vw < 860) { setBookW(360); setBookH(520); setPortrait(false); }
      else { setBookW(430); setBookH(620); setPortrait(false); }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const flip = useCallback((dir: "prev" | "next") => {
    if (!bookRef.current) return;
    dir === "next" ? bookRef.current.pageFlip().flipNext() : bookRef.current.pageFlip().flipPrev();
  }, []);

  const onFlip = useCallback((e: any) => { setPage(e.data); playCrinkle(); }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flip("next");
      if (e.key === "ArrowLeft") flip("prev");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [flip]);

  const totalPages = 2 + (overview ? 1 : 0) + (concepts ? 1 : 0) + (materials ? 1 : 0) + (procedure ? 1 : 0) + 1 + (results ? 2 : 0) + (formulae ? 1 : 0) + (numericals ? 1 : 0) + (applications ? 1 : 0) + (outcomes ? 1 : 0) + (diyProjects ? 1 : 0) + (precautions ? 1 : 0) + (quiz ? 1 : 0);
  let pageNum = 0;

  return (
    <div style={{ background: `radial-gradient(ellipse at 50% 0%,#0d2a4a,${C.navy} 65%)`, padding: "48px 16px 32px", minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ filter: "drop-shadow(0 40px 70px rgba(0,0,0,0.6))", position: "relative", zIndex: 10 }}>
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef} width={bookW} height={bookH} size="fixed"
          minWidth={260} maxWidth={500} minHeight={380} maxHeight={700}
          showCover={true} useMouseEvents={true} flippingTime={900}
          maxShadowOpacity={0.8} showPageCorners={true} usePortrait={portrait}
          autoSize={false} drawShadow={true} onFlip={onFlip}
          style={{ backgroundColor: "transparent" }}
        >
          <CoverFront title={experimentTitle} subject={experimentSubject} />

          {overview && (
            <Page title="I. Overview & Objective" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              <Callout label="Overview" accent={C.teal}>{overview.overview}</Callout>
              <Callout label="Objective" accent={C.navy}>{overview.objective}</Callout>
              <Callout label="Hypothesis" accent={C.gold}>{overview.hypothesis}</Callout>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {overview.tags.map(t => <Tag key={t} text={t} />)}
              </div>
            </Page>
          )}

          {concepts && concepts.length > 0 && (
            <Page title="II. Concept & Theory" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {concepts.map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: "bold", color: C.navy, marginBottom: 1 }}>{title}</div>
                    <div style={{ fontSize: 10.5, color: C.textMid, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </Page>
          )}

          {materials && materials.length > 0 && (
            <Page title="III. Materials & Apparatus" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {materials.map(({ item, spec, qty }, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4.5px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.text }}>{item}</span>
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 9.5, color: C.teal, background: C.tealLight, padding: "1px 6px", borderRadius: 4 }}>{spec || qty}</span>
                </div>
              ))}
            </Page>
          )}

          {procedure && procedure.length > 0 && (
            <Page title="IV. Procedure" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {procedure.map(({ title, body, tip }, i) => <Step key={i} n={i + 1} title={title} body={body} tip={tip} />)}
            </Page>
          )}

          <Page title="V. Video & Media" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
            <div style={{ background: C.navy, borderRadius: 8, padding: "18px 14px", textAlign: "center", marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${C.teal}20`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, margin: "0 auto 6px" }}>▶</div>
              <div style={{ fontFamily: "monospace", fontSize: 8.5, color: C.teal }}>EXPERIMENT DEMO VIDEO</div>
            </div>
          </Page>

          {results && (
            <>
              <Page title="VI. Observations & Data" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
                {results.observations.map(({ obs, sig }, i) => (
                  <Callout key={i} accent={C.green}><strong>{obs}</strong><br />→ {sig}</Callout>
                ))}
                {results.data_table.headers.length > 0 && (
                  <>
                    <MiniDivider />
                    <div style={{ overflowX: "auto", borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, background: C.white }}>
                        <thead>
                          <tr style={{ background: C.navy }}>
                            {results.data_table.headers.map(h => (
                              <th key={h} style={{ padding: "5px 8px", textAlign: "center", color: C.teal, fontFamily: "monospace", fontSize: 8.5, fontWeight: "normal" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.data_table.rows.slice(0, 5).map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.offWhite }}>
                              {row.map((v, j) => (
                                <td key={j} style={{ padding: "4px 8px", textAlign: "center", fontFamily: "monospace", color: j === 0 ? C.teal : C.textMid, fontWeight: j === 0 ? "bold" : "normal" }}>{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Page>
              {results.graph_data.length > 0 && (
                <Page title="VII. Graph" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
                  <MiniChart data={results.graph_data} />
                  <MiniDivider />
                  <Callout label="Graph Insight" accent={C.teal}>Data plotted shows the expected relationship pattern.</Callout>
                </Page>
              )}
            </>
          )}

          {formulae && formulae.length > 0 && (
            <Page title="VIII. Key Formulae" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {formulae.map(({ formula, name, vars }) => (
                <React.Fragment key={name}>
                  <FBox>{formula}</FBox>
                  <div style={{ fontSize: 9.5, color: C.textMid, textAlign: "center", marginBottom: 10 }}>{name}</div>
                </React.Fragment>
              ))}
            </Page>
          )}

          {numericals && numericals.length > 0 && (
            <Page title="IX. Numerical Problems" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {numericals.slice(0, 5).map(({ question, solution, answer }, i) => (
                <div key={i} style={{ background: C.offWhite, borderRadius: 6, padding: "7px 10px", marginBottom: 7, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: "bold", color: C.navy, marginBottom: 2 }}>Q{i + 1}. {question}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 9.5, color: C.textLight }}>Sol: {solution}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: C.teal, fontWeight: "bold" }}>∴ {answer}</div>
                </div>
              ))}
            </Page>
          )}

          {applications && applications.length > 0 && (
            <Page title="X. Applications" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {applications.map(({ icon, title, category, desc }) => (
                <div key={title} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: "bold", color: C.navy }}>
                      {title} <span style={{ fontFamily: "monospace", fontSize: 8.5, color: C.teal, background: C.tealLight, padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>{category}</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textMid, lineHeight: 1.45 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </Page>
          )}

          {outcomes && outcomes.length > 0 && (
            <Page title="XI. Learning Outcomes" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              <Callout label="After this experiment, students will:" accent={C.teal}>
                {outcomes.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                    <span style={{ color: C.teal, fontSize: 11, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5 }}>{o}</span>
                  </div>
                ))}
              </Callout>
            </Page>
          )}

          {precautions && precautions.length > 0 && (
            <Page title="XII. Precautions" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {precautions.map(({ icon, text }, i) => (
                <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 10.5, color: C.text, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </Page>
          )}

          {quiz && quiz.length > 0 && (
            <Page title="XIII. Self-Check Quiz" number={String(++pageNum).padStart(2, "0")} subtitle={experimentSubject}>
              {quiz.slice(0, 4).map((q, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "7px 10px", background: C.offWhite, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: "bold", color: C.navy, marginBottom: 5 }}>
                    Q{i + 1}. {q.question}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{
                        fontSize: 9.5, padding: "3px 7px", borderRadius: 4,
                        background: j === q.answer ? `${C.green}15` : C.white,
                        border: `1px solid ${j === q.answer ? C.green : C.border}`,
                        color: j === q.answer ? C.green : C.textMid,
                      }}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Page>
          )}

          <CoverBack />
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 28, zIndex: 10 }}>
        <button onClick={() => flip("prev")} style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.teal}40`, background: `${C.teal}12`, color: C.teal, cursor: "pointer", fontSize: 16 }}>←</button>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.15em" }}>
          Page {page + 1} / {totalPages}
        </div>
        <button onClick={() => flip("next")} style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.teal}40`, background: `${C.teal}12`, color: C.teal, cursor: "pointer", fontSize: 16 }}>→</button>
      </div>
    </div>
  );
};

export default FlipbookView;
