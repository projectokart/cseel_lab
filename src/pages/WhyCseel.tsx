import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import { Beaker, Users, GraduationCap, Globe, Award, TrendingUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";

const nodeData = {
  spark:       { title:"Spark",                subtitle:"Real phenomenon shown",    phase:"Phase 1 · Experience",    color:"#7C3AED", light:"#EDE9FE", tag:"Kolb · Concrete Experience",       emoji:"⚡", content:`Every lesson at CSEEL begins not with a textbook — but with a real, tangible phenomenon.\n\nA candle extinguishing in a closed jar. Iron rusting overnight. A prism splitting light. Before we explain anything, students experience it first.\n\nCuriosity is ignited before theory is introduced.`, bullets:["Real-world phenomena as lesson starters","No theory before experience","Curiosity-first approach","Observation & questioning encouraged"] },
  concrete:    { title:"Concrete Experience",  subtitle:"Do the experiment",         phase:"Phase 1 · Experience",    color:"#7C3AED", light:"#EDE9FE", tag:"Kolb · Hands-on",                  emoji:"🧪", content:`Students don't watch — they do. Every concept in CSEEL is paired with a hands-on experiment that students physically perform.\n\nMeasuring, mixing, heating, observing, recording. The experiment is not a demonstration — it is the lesson.\n\nStudents build scientific intuition through their own hands.`, bullets:["100+ hands-on experiments","Students perform — not just watch","Physical + virtual lab options","Record, measure, observe yourself"] },
  observe:     { title:"Observe & Reflect",    subtitle:"What did I notice?",        phase:"Phase 1 · Experience",    color:"#7C3AED", light:"#EDE9FE", tag:"Kolb · Reflective Observation",    emoji:"🔍", content:`After the experiment, students pause and reflect. What happened? What surprised me?\n\nThis Reflective Observation stage is where raw experience transforms into meaningful data. Students write lab notes and draw preliminary conclusions.\n\nReflection separates a student who "did a lab" from one who is "learning science."`, bullets:["Structured lab reflection prompts","Peer discussion sessions","Lab report writing","Compare expected vs actual results"] },
  abstract:    { title:"Abstract Theory",      subtitle:"Why did it happen?",        phase:"Phase 2 · Conceptualize", color:"#0F766E", light:"#CCFBF1", tag:"Kolb · Abstract Conceptualization", emoji:"💡", content:`Now that students have experienced the phenomenon, theory finally makes sense — because they already felt it.\n\nAbstract Theory is introduced through visual explainers, animations, and guided lessons connected directly to the experiment.`, bullets:["Theory taught after experience","Visual explainers & animations","Concept maps & diagrams","Connected directly to the experiment"] },
  remember:    { title:"Remember · Understand",subtitle:"Bloom Level 1–2",           phase:"Phase 2 · Conceptualize", color:"#0F766E", light:"#CCFBF1", tag:"Bloom's Taxonomy L1–L2",            emoji:"🧠", content:`Bloom's Taxonomy defines six levels of cognitive learning. The first two — Remember and Understand — form the foundation.\n\nAt CSEEL, students move through Remember (recalling facts) and Understand (explaining in their own words) through quizzes and concept checks.`, bullets:["Bloom L1: Remember — recall facts","Bloom L2: Understand — explain in own words","Concept check quizzes","Flashcard & summary tools"] },
  simulation:  { title:"Simulation",           subtitle:"Visualise the concept",     phase:"Phase 2 · Conceptualize", color:"#0F766E", light:"#CCFBF1", tag:"Virtual Lab · Simulation",          emoji:"🖥️", content:`Some experiments are too dangerous or impossible in a regular classroom.\n\nCSEEL's virtual simulation platform lets students explore these safely. Students manipulate variables and run experiments hundreds of times in minutes.\n\nSimulations bridge the gap between what a classroom can offer and what science actually looks like.`, bullets:["100+ virtual simulations","Safe exploration of dangerous experiments","Variable manipulation & observation","Unlimited repetition for mastery"] },
  pbl:         { title:"PBL · Project Work",   subtitle:"Solve real problems",       phase:"Phase 3 · Apply",         color:"#B45309", light:"#FEF3C7", tag:"Project-Based Learning",            emoji:"🏗️", content:`Project-Based Learning is the engine of deep application. Students are given a real-world challenge and must use everything they've learned to solve it.\n\nProjects span multiple lessons — research, planning, prototyping, and presentation. Students work in teams, just like real scientists.`, bullets:["Real-world challenge problems","Multi-lesson project arcs","Team-based collaboration","Research, prototype, present cycle"] },
  apply:       { title:"Apply · Analyse",      subtitle:"Bloom Level 3–4",           phase:"Phase 3 · Apply",         color:"#B45309", light:"#FEF3C7", tag:"Bloom's Taxonomy L3–L4",            emoji:"⚙️", content:`Once students understand a concept, they must use it. Apply asks students to use knowledge in new contexts. Analyse asks them to break down complex situations and find patterns.\n\nAt CSEEL this means structured problem sets, designing experiments, and interpreting data.`, bullets:["Bloom L3: Apply — use in new contexts","Bloom L4: Analyse — break down & find patterns","Structured problem sets","Data interpretation exercises"] },
  collaborate: { title:"Collaborate",          subtitle:"Team-based inquiry",        phase:"Phase 3 · Apply",         color:"#B45309", light:"#FEF3C7", tag:"Collaborative Learning",            emoji:"🤝", content:`Science is rarely done alone. Collaboration is a core scientific skill — and CSEEL builds it deliberately into every stage.\n\nStudents work in structured teams with assigned roles: researcher, experimenter, recorder, presenter. They debate findings and challenge each other's conclusions.`, bullets:["Structured team roles","Peer-to-peer learning","Debate & discussion sessions","Group experiment design"] },
  quiz:        { title:"Quiz · Test",          subtitle:"Knowledge check",           phase:"Phase 4 · Assess",        color:"#BE123C", light:"#FFE4E6", tag:"Formative Assessment",              emoji:"📝", content:`CSEEL's assessment is not a one-time high-stakes exam — it is a continuous diagnostic tool. Quizzes are short, frequent, and precise.\n\nEach quiz is mapped to specific learning objectives. The results identify exactly which concept a student hasn't mastered yet.`, bullets:["Short, frequent diagnostic quizzes","Mapped to learning objectives","Real-time results & analysis","Identifies exact knowledge gaps"] },
  mastery:     { title:"Mastery Gate",         subtitle:"Pass or Re-learn",          phase:"Phase 4 · Assess",        color:"#BE123C", light:"#FFE4E6", tag:"Mastery Learning · B. Bloom",       emoji:"🔑", content:`The Mastery Gate is the heart of CSEEL's learning model. Benjamin Bloom proved that given enough time and the right support, virtually every student can master any concept.\n\nIf a student passes — they move forward. If not — they receive targeted re-learning and try again.`, bullets:["Threshold-based progression","Pass → move forward","Not yet → targeted re-learning","Based on Bloom's Mastery Learning research"] },
  feedback:    { title:"Feedback",             subtitle:"Personalised report",       phase:"Phase 4 · Assess",        color:"#BE123C", light:"#FFE4E6", tag:"Personalised Feedback",             emoji:"📊", content:`Every assessment at CSEEL generates a personalised feedback report — for the student, and for their teacher.\n\nThe report doesn't just say "You got 6/10." It says exactly which concept needs work and what to focus on next.`, bullets:["Concept-level gap identification","Student + teacher reports","Actionable next steps","Real-time teacher dashboard"] },
  evaluate:    { title:"Evaluate · Create",    subtitle:"Bloom Level 5–6",           phase:"Phase 5 · Master",        color:"#166534", light:"#DCFCE7", tag:"Bloom's Taxonomy L5–L6",            emoji:"🌟", content:`The highest levels of Bloom's Taxonomy — Evaluate and Create — represent true mastery.\n\nEvaluate asks students to judge scientific work and critique experiments. Create asks them to design original experiments and generate novel solutions.`, bullets:["Bloom L5: Evaluate — judge & critique","Bloom L6: Create — design original work","Evidence-based argumentation","Novel solution generation"] },
  design:      { title:"Design · Innovate",    subtitle:"Student creates new work",  phase:"Phase 5 · Master",        color:"#166534", light:"#DCFCE7", tag:"Innovation & Creation",             emoji:"🚀", content:`The final active stage: Design & Innovate. Students take everything they've learned and create something original.\n\nThis might be a new experimental protocol, a science communication project, an engineering prototype, or a research paper.`, bullets:["Original experiment design","Research paper or poster","Engineering prototype","Science communication project"] },
  certified:   { title:"Certified Master",     subtitle:"Portfolio + certificate",   phase:"Phase 5 · Master",        color:"#166534", light:"#DCFCE7", tag:"CSEEL Certification",               emoji:"🎓", content:`A student who reaches Certified Master has completed every stage of the CSEEL Integrated Learning Model.\n\nCSEEL awards a Mastery Certificate recognised by partner institutions. Students build a digital portfolio of their projects, experiments, and presentations.`, bullets:["CSEEL Mastery Certificate","Digital portfolio of work","Recognised by partner institutions","Proof of genuine scientific competency"] },
};

type NodeKey = keyof typeof nodeData;

/* ─── HTML-STYLE POPUP with curved SVG line ─── */
const StagePopup = ({ nodeKey, anchorEl, containerEl, onClose }: {
  nodeKey: NodeKey | null;
  anchorEl: HTMLElement | null;
  containerEl: HTMLElement | null;
  onClose: () => void;
}) => {
  const node = nodeKey ? nodeData[nodeKey] : null;
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [curve, setCurve] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const drawCurve = useCallback(() => {
    if (!anchorEl || !cardRef.current || !svgRef.current || !containerEl) return;
    const btn = anchorEl.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();
    const svg = svgRef.current.getBoundingClientRect();
    const x1 = btn.left + btn.width / 2 - svg.left;
    const y1 = btn.bottom - svg.top;
    const x2 = card.left + card.width / 2 - svg.left;
    const y2 = card.top - svg.top + 4;
    const mid = (y2 - y1) * 0.55;
    setCurve(`M ${x1} ${y1} C ${x1} ${y1 + mid}, ${x2} ${y2 - mid}, ${x2} ${y2}`);
  }, [anchorEl, containerEl]);

  useEffect(() => {
    if (nodeKey) {
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(drawCurve, 30);
      }));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setRendered(false); setCurve(""); }, 400);
      return () => clearTimeout(t);
    }
  }, [nodeKey, drawCurve]);

  useEffect(() => {
    window.addEventListener("resize", drawCurve);
    return () => window.removeEventListener("resize", drawCurve);
  }, [drawCurve]);

  if (!rendered || !node) return null;

  const markerId = `arr-${nodeKey}`;

  return (
    <>
      {/* Full-page click-away */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* SVG overlay — covers whole viewport for curve */}
      <svg ref={svgRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 40, overflow: "visible" }}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke={node.color} strokeWidth="1.8" strokeLinecap="round" />
          </marker>
        </defs>
        <path d={curve} fill="none" stroke={node.color} strokeWidth="2"
          strokeDasharray="6 4" strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
          style={{ opacity: visible ? 0.75 : 0, transition: "opacity 0.5s ease" }} />
      </svg>

      {/* Popup card — fixed, centred horizontally, below clicked button */}
      <div ref={cardRef}
        className="fixed z-50 pointer-events-auto"
        style={{
          left: "50%",
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 28 : "50%",
          transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(18px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
          width: "min(92vw, 420px)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 0 1.5px ${node.color}22`, borderTop: `3px solid ${node.color}` }}>

          {/* header */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{node.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ background: node.light, color: node.color }}>{node.phase}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{node.title}</h3>
                <p className="text-xs font-medium mt-0.5" style={{ color: node.color }}>{node.tag}</p>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-70 transition-opacity"
                style={{ background: node.light }}>
                <X className="w-3.5 h-3.5" style={{ color: node.color }} />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="px-5 py-4">
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mb-4"
              style={{ display:"-webkit-box", WebkitLineClamp:6, WebkitBoxOrient:"vertical", overflow:"hidden" } as React.CSSProperties}>
              {node.content}
            </p>
            <div className="rounded-xl p-3" style={{ background: node.light }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: node.color }}>Key Elements</p>
              <ul className="space-y-1.5">
                {node.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                      style={{ background: node.color, fontSize: 9 }}>{i + 1}</span>
                    <span className="text-xs text-gray-700 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── SVG FLOW DIAGRAM ─── */
const LearningFlowDiagram = ({ svgRef, onNodeClick }: {
  svgRef: React.RefObject<SVGSVGElement>;
  onNodeClick: (key: NodeKey, el: HTMLElement) => void;
}) => {
  const [hovered, setHov] = useState<NodeKey | null>(null);
  const [active,  setAct] = useState<NodeKey | null>(null);
  const gRefs = useRef<Record<string, SVGGElement | null>>({});

  const BW = 152, BH = 56;
  const LX = 130, CX = 410, RX = 688;
  const LC = LX+BW/2, CC = CX+BW/2, RC = RX+BW/2;
  const R1Y=88, R2Y=238, R3Y=390, R4Y=534, R5Y=752;
  const R1M=R1Y+BH/2, R2M=R2Y+BH/2, R3M=R3Y+BH/2;
  const DX=CC+BW/2, DY=R4Y+78;

  const C={p:"#7C3AED",t:"#0F766E",a:"#B45309",r:"#BE123C",g:"#166534"};
  const L={p:"#EDE9FE",t:"#CCFBF1",a:"#FEF3C7",r:"#FFE4E6",g:"#DCFCE7"};

  const handleClick = (key: NodeKey) => {
    const g = gRefs.current[key];
    if (!g) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    // create a proxy HTMLElement from SVG bounding box
    const svgRect = svgEl.getBoundingClientRect();
    const gRect = g.getBoundingClientRect();
    // build a fake element with getBoundingClientRect
    const fakeEl = {
      getBoundingClientRect: () => gRect,
    } as HTMLElement;
    setAct(prev => prev === key ? null : key);
    onNodeClick(key, fakeEl);
  };

  const Box = ({ id, x, y, w=BW, h=BH, title, subtitle, color, light }: {
    id: NodeKey; x:number; y:number; w?:number; h?:number;
    title:string; subtitle:string; color:string; light:string;
  }) => {
    const isH = hovered===id, isA = active===id;
    const fill = isA ? color : isH ? light : light;
    const tc   = isA ? "white" : color;
    return (
      <g ref={el => { gRefs.current[id] = el; }}
        style={{ cursor:"pointer" }}
        onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
        onClick={() => handleClick(id)}
        filter={isH||isA ? "drop-shadow(0 6px 18px rgba(0,0,0,0.16))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.07))"}>
        <rect x={x} y={y} width={w} height={h} rx={11}
          fill={fill} stroke={color} strokeWidth={isA ? 0 : 1.4}
          style={{ transition:"fill 0.2s" }} />
        <text x={x+w/2} y={y+h/2-9} textAnchor="middle" dominantBaseline="central"
          fontSize={12.5} fontWeight={650} fill={tc} style={{ transition:"fill 0.2s", fontFamily:"inherit" }}>{title}</text>
        <text x={x+w/2} y={y+h/2+10} textAnchor="middle" dominantBaseline="central"
          fontSize={10} fill={isA ? "rgba(255,255,255,0.8)" : "#6B7280"} style={{ fontFamily:"inherit" }}>{subtitle}</text>
        <circle cx={x+w-11} cy={y+11} r="3.5" fill={color} opacity={isA ? 0 : 0.55}>
          <animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  };

  const Diamond = ({ id, x, y, sz=46, color, light }: {
    id:NodeKey; x:number; y:number; sz?:number; color:string; light:string;
  }) => {
    const isA = active===id, isH = hovered===id;
    const pts = `${x},${y-sz} ${x+sz},${y} ${x},${y+sz} ${x-sz},${y}`;
    return (
      <g ref={el => { gRefs.current[id] = el; }}
        style={{ cursor:"pointer" }}
        onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
        onClick={() => handleClick(id)}
        filter={isH||isA ? "drop-shadow(0 6px 18px rgba(0,0,0,0.18))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.1))"}>
        <polygon points={pts} fill={isA ? color : light} stroke={color} strokeWidth={isA ? 0 : 1.6} style={{ transition:"fill 0.2s" }} />
        <text x={x} y={y-9} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={650} fill={isA ? "white" : color} style={{ fontFamily:"inherit" }}>Mastery</text>
        <text x={x} y={y+9} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={650} fill={isA ? "white" : color} style={{ fontFamily:"inherit" }}>Gate?</text>
      </g>
    );
  };

  const Arr = ({ d, col="#9CA3AF", dash="" }: { d:string; col?:string; dash?:string }) => (
    <path d={d} fill="none" stroke={col} strokeWidth={1.6} strokeDasharray={dash}
      strokeLinecap="round" strokeLinejoin="round" markerEnd={`url(#ah-${col.slice(1)})`} />
  );

  return (
    <svg ref={svgRef} width="100%" viewBox="0 0 876 1038" style={{ fontFamily:"inherit" }}>
      <defs>
        {[C.p,C.t,C.a,C.r,C.g,"#9CA3AF","#EF4444"].map(col => (
          <marker key={col} id={`ah-${col.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>

      {/* Title */}
      <text x="488" y="28" textAnchor="middle" fontSize={16} fontWeight={700} fill="#111827" style={{ fontFamily:"inherit" }}>CSEEL Integrated Learning Model</text>
      <text x="488" y="48" textAnchor="middle" fontSize={11} fill="#9CA3AF" style={{ fontFamily:"inherit" }}>Kolb · Bloom · Mastery — unified</text>

      {/* Phase sidebar labels — properly spaced */}
      {[
        { y:R1Y,  h:BH+55, num:"1", label:"PHASE 1", sub:"EXPERIENCE",    col:C.p },
        { y:R2Y,  h:BH+55, num:"2", label:"PHASE 2", sub:"CONCEPTUALIZE", col:C.t },
        { y:R3Y,  h:BH+55, num:"3", label:"PHASE 3", sub:"APPLY",         col:C.a },
        { y:R4Y,  h:180,   num:"4", label:"PHASE 4", sub:"ASSESS",        col:C.r },
        { y:R5Y,  h:BH+55, num:"5", label:"PHASE 5", sub:"MASTER",        col:C.g },
      ].map(ph => (
        <g key={ph.num}>
          <rect x={2} y={ph.y} width={5} height={ph.h} rx={3} fill={ph.col} />
          <text x={16} y={ph.y+16} fontSize={8.5} fontWeight={700} fill={ph.col} letterSpacing="1" style={{ fontFamily:"inherit" }}>{ph.label}</text>
          <text x={16} y={ph.y+30} fontSize={8} fill={ph.col} opacity={0.7} style={{ fontFamily:"inherit" }}>{ph.sub}</text>
        </g>
      ))}

      {/* Phase 1 */}
      <Box id="spark"    x={LX} y={R1Y} title="Spark"               subtitle="Real phenomenon shown"  color={C.p} light={L.p} />
      <Box id="concrete" x={CX} y={R1Y} title="Concrete Experience"  subtitle="Do the experiment"      color={C.p} light={L.p} />
      <Box id="observe"  x={RX} y={R1Y} title="Observe & Reflect"    subtitle="What did I notice?"     color={C.p} light={L.p} />
      <Arr d={`M${LX+BW} ${R1M} L${CX} ${R1M}`} col={C.p} />
      <Arr d={`M${CX+BW} ${R1M} L${RX} ${R1M}`} col={C.p} />
      <path d={`M${RC} ${R1Y+BH} L${RC} ${R1Y+BH+22} Q${RC} ${R1Y+BH+40} ${RC+22} ${R1Y+BH+40} L${RX+BW+40} ${R1Y+BH+40} Q${RX+BW+56} ${R1Y+BH+40} ${RX+BW+56} ${R1Y+BH+56} L${RX+BW+56} ${R2Y+BH/2} Q${RX+BW+56} ${R2Y+BH+8} ${RX+BW} ${R2Y+BH/2}`}
        fill="none" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#ah-9CA3AF)" />

      {/* Phase 2 */}
      <Box id="simulation" x={RX} y={R2Y} title="Simulation"            subtitle="Visualise the concept"  color={C.t} light={L.t} />
      <Box id="remember"   x={CX} y={R2Y} title="Remember · Understand"  subtitle="Bloom Level 1–2"        color={C.t} light={L.t} />
      <Box id="abstract"   x={LX} y={R2Y} title="Abstract Theory"        subtitle="Why did it happen?"     color={C.t} light={L.t} />
      <Arr d={`M${RX} ${R2Y+BH/2} L${CX+BW} ${R2Y+BH/2}`} col={C.t} />
      <Arr d={`M${CX} ${R2Y+BH/2} L${LX+BW} ${R2Y+BH/2}`} col={C.t} />
      <path d={`M${LC} ${R2Y+BH} L${LC} ${R2Y+BH+22} Q${LC} ${R2Y+BH+40} ${LC-22} ${R2Y+BH+40} L${LX-40} ${R2Y+BH+40} Q${LX-56} ${R2Y+BH+40} ${LX-56} ${R2Y+BH+56} L${LX-56} ${R3Y+BH/2} Q${LX-56} ${R3Y+BH+8} ${LX} ${R3Y+BH/2}`}
        fill="none" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#ah-9CA3AF)" />

      {/* Phase 3 */}
      <Box id="pbl"         x={LX} y={R3Y} title="PBL · Project Work"   subtitle="Solve real problems"     color={C.a} light={L.a} />
      <Box id="apply"       x={CX} y={R3Y} title="Apply · Analyse"       subtitle="Bloom Level 3–4"         color={C.a} light={L.a} />
      <Box id="collaborate" x={RX} y={R3Y} title="Collaborate"           subtitle="Team-based inquiry"      color={C.a} light={L.a} />
      <Arr d={`M${LX+BW} ${R3Y+BH/2} L${CX} ${R3Y+BH/2}`} col={C.a} />
      <Arr d={`M${CX+BW} ${R3Y+BH/2} L${RX} ${R3Y+BH/2}`} col={C.a} />
      <Arr d={`M${CC+BW/2} ${R3Y+BH} L${CC+BW/2} ${R4Y}`} col="#9CA3AF" />

      {/* Phase 4 */}
      <Box id="quiz"     x={LX} y={R4Y} title="Quiz · Test"      subtitle="Knowledge check"       color={C.r} light={L.r} />
      <Diamond id="mastery" x={DX} y={DY} color={C.r} light={L.r} />
      <Box id="feedback" x={RX} y={R4Y} title="Feedback"         subtitle="Personalised report"   color={C.r} light={L.r} />
      <Arr d={`M${LX+BW} ${R4Y+BH/2} L${DX-46} ${DY}`} col={C.r} />
      <Arr d={`M${DX+46} ${DY} L${RX} ${R4Y+BH/2}`} col={C.r} />

      <text x={DX-68} y={DY+22} textAnchor="middle" fontSize={10} fill="#EF4444" style={{ fontFamily:"inherit" }}>Not yet</text>
      <text x={DX+32} y={DY+32} textAnchor="start"  fontSize={10} fill={C.g} fontWeight={600} style={{ fontFamily:"inherit" }}>Pass ✓</text>
      <path d={`M${DX} ${DY+46} L${DX} ${DY+82} Q${DX} ${DY+104} ${DX-22} ${DY+104} L${LX+22} ${DY+104} Q${LX} ${DY+104} ${LX} ${DY+82} L${LX} ${R4Y+BH}`}
        fill="none" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#ah-EF4444)" />
      <text x={(DX+LX)/2} y={DY+118} textAnchor="middle" fontSize={9.5} fill="#EF4444" style={{ fontFamily:"inherit" }}>↩  Re-learn loop</text>
      <Arr d={`M${DX} ${DY+46} L${DX} ${R5Y}`} col={C.g} />

      {/* Phase 5 */}
      <Box id="evaluate"  x={LX} y={R5Y} title="Evaluate · Create"   subtitle="Bloom Level 5–6"          color={C.g} light={L.g} />
      <Box id="design"    x={CX} y={R5Y} title="Design · Innovate"    subtitle="Student creates new work" color={C.g} light={L.g} />
      <Box id="certified" x={RX} y={R5Y} title="Certified Master"     subtitle="Portfolio + certificate"  color={C.g} light={L.g} />
      <Arr d={`M${LX+BW} ${R5Y+BH/2} L${CX} ${R5Y+BH/2}`} col={C.g} />
      <Arr d={`M${CX+BW} ${R5Y+BH/2} L${RX} ${R5Y+BH/2}`} col={C.g} />
      <Arr d={`M${CC+BW/2} ${R5Y+BH} L${CC+BW/2} ${R5Y+BH+52}`} col={C.g} />

      <rect x={308} y={R5Y+BH+54} width={320} height={66} rx={14} fill={C.g} />
      <text x="468" y={R5Y+BH+81} textAnchor="middle" fontSize={15} fontWeight={700} fill="white" style={{ fontFamily:"inherit" }}>🎓 Master Output</text>
      <text x="468" y={R5Y+BH+101} textAnchor="middle" fontSize={10.5} fill="rgba(255,255,255,0.75)" style={{ fontFamily:"inherit" }}>Independent Scientific Thinker · CSEEL Certified</text>
      <g style={{ cursor:"pointer" }} onClick={() => handleClick("certified")}>
        <rect x={308} y={R5Y+BH+54} width={320} height={66} rx={14} fill="transparent" />
      </g>

      <text x="488" y={R5Y+BH+140} textAnchor="middle" fontSize={10} fill="#CBD5E1" style={{ fontFamily:"inherit" }}>✦ Click any node to explore this stage</text>
    </svg>
  );
};

/* ─── SECTION ─── */
const LearningFlowSection = () => {
  const [activeNode, setActiveNode] = useState<NodeKey | null>(null);
  const [anchorEl,   setAnchorEl]   = useState<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleNodeClick = useCallback((key: NodeKey, el: HTMLElement) => {
    if (activeNode === key) { setActiveNode(null); setAnchorEl(null); return; }
    setActiveNode(key);
    setAnchorEl(el);
  }, [activeNode]);

  const handleClose = () => { setActiveNode(null); setAnchorEl(null); };

  return (
    <section className="py-10 md:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Our Methodology</p>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
              From <span className="text-muted-foreground font-normal">curious</span>
              <span className="text-primary"> → certified</span>
            </h2>
            <p className="text-sm text-muted-foreground">Click any node to explore what happens inside each stage.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mb-8">
            {["Kolb's Cycle","Bloom's Taxonomy","Mastery Learning","PBL","Inquiry-Based"].map(t => (
              <span key={t} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/15">{t}</span>
            ))}
          </div>
        </ScrollReveal>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-2xl border border-gray-100 shadow-lg p-2 md:p-8">
            <LearningFlowDiagram svgRef={svgRef} onNodeClick={handleNodeClick} />
          </div>
        </div>
      </div>

      <StagePopup
        nodeKey={activeNode}
        anchorEl={anchorEl}
        containerEl={null}
        onClose={handleClose}
      />
    </section>
  );
};

/* ─── FEATURES ─── */
const features = [
  { icon:Beaker,        title:"100+ Virtual Labs",  desc:"Access science experiments anytime, anywhere." },
  { icon:Users,         title:"Collaborative",       desc:"Teachers and students connected seamlessly." },
  { icon:GraduationCap, title:"Curriculum Aligned", desc:"Mapped to CBSE, ICSE, and state boards." },
  { icon:Globe,         title:"Any Device",          desc:"Works everywhere with an internet connection." },
  { icon:Award,         title:"40% Better Results",  desc:"Proven improvement in science comprehension." },
  { icon:TrendingUp,    title:"Live Analytics",      desc:"Real-time progress tracking for all." },
];

/* ─── PAGE ─── */
const WhyCseel = () => (
  <Layout>
    <PageTransition>

      <section className="about-hero-gradient py-14 md:py-24 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"55px 55px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-3">Why Choose CSEEL</p>
          <h1 className="text-3xl md:text-6xl font-bold mb-4 leading-tight">Science Education,<br /><span className="opacity-75">Reimagined.</span></h1>
          <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto mb-8">One seamless learning journey — from first spark of curiosity to certified mastery.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/compare-plans"><Button size="lg" variant="secondary" className="rounded-full px-6">Explore Plans</Button></Link>
            <Link to="/demo"><Button size="lg" variant="outline" className="rounded-full px-6 border-white/30 text-white hover:bg-white/10">See Demo</Button></Link>
          </div>
        </div>
      </section>

      <section className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[{v:"100+",l:"Experiments"},{v:"40%",l:"Better Results"},{v:"50K+",l:"Students"},{v:"NEP 2020",l:"Aligned"}].map(s=>(
              <div key={s.l}>
                <div className="text-xl md:text-2xl font-bold text-primary-foreground">{s.v}</div>
                <div className="text-xs text-primary-foreground/60 uppercase tracking-widest">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LearningFlowSection />

      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">What We Offer</p>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">Built for real classrooms</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map(f => (
              <ScrollReveal key={f.title}>
                <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 about-hero-gradient text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-3xl mb-3">🚀</div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Ready to start the journey?</h2>
          <p className="opacity-80 mb-7 text-sm md:text-base">Join thousands of students already on the path from curious to certified.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/compare-plans"><Button size="lg" variant="secondary" className="rounded-full px-8">Get Started Free</Button></Link>
            <Link to="/contact-us"><Button size="lg" variant="outline" className="rounded-full px-8 border-white/30 text-white hover:bg-white/10">Talk to Us</Button></Link>
          </div>
        </div>
      </section>

    </PageTransition>
  </Layout>
);

export default WhyCseel;