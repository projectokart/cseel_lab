// CSEEL Brand Tokens — shared across all experiment components
export const C: Record<string, string> = {
  navy:      "#0a1628",
  navyMid:   "#1a3a5c",
  teal:      "#00b4be",
  tealDark:  "#008c96",
  tealLight: "#e8f8f9",
  tealMid:   "#b3ecf0",
  white:     "#ffffff",
  offWhite:  "#f7fbfc",
  pageBg:    "#fdf6e9",       // creamy white for flipbook pages
  border:    "#d4edf0",
  borderMid: "#a8d8dd",
  text:      "#1a2e4a",
  textMid:   "#3a5a7a",
  textLight: "#7a9ab8",
  gold:      "#d97706",
  green:     "#059669",
  red:       "#dc2626",
  purple:    "#7c3aed",
};

// Section navigation items
export const NAV_SECTIONS = [
  { id: "overview",     label: "Overview" },
  { id: "concept",      label: "Concept" },
  { id: "materials",    label: "Materials" },
  { id: "procedure",    label: "Procedure" },
  { id: "media",        label: "Media" },
  { id: "results",      label: "Results" },
  { id: "formulae",     label: "Formulae" },
  { id: "numericals",   label: "Numericals" },
  { id: "applications", label: "Applications" },
  { id: "outcomes",     label: "Outcomes" },
  { id: "diy",          label: "DIY / Code" },
  { id: "precautions",  label: "Precautions" },
  { id: "quiz",         label: "Quiz" },
];

// Types for section data
export interface OverviewData {
  overview: string;
  objective: string;
  hypothesis: string;
  tags: string[];
  duration: string;
  difficulty: string;
  quiz_count: number;
  level: string;
  subject: string;
}

export interface ConceptItem {
  icon: string;
  title: string;
  desc: string;
}

export interface MaterialItem {
  item: string;
  spec?: string;
  qty?: string;
  note?: string;
}

export interface ProcedureStep {
  title: string;
  body: string;
  tip?: string;
}

export interface MediaData {
  video_url?: string;
  images: { caption: string; url?: string; icon?: string }[];
}

export interface ResultObservation {
  obs: string;
  sig: string;
}

export interface ResultsData {
  observations: ResultObservation[];
  data_table: { headers: string[]; rows: string[][] };
  graph_data: { r: number; B2: number; B4: number }[];
}

export interface FormulaItem {
  formula: string;
  name: string;
  vars: { symbol: string; desc: string; unit: string }[];
}

export interface NumericalItem {
  question: string;
  given?: string[];
  solution: string;
  answer: string;
}

export interface ApplicationItem {
  icon: string;
  category: string;
  title: string;
  desc: string;
}

export interface DIYProject {
  title: string;
  difficulty: string;
  time: string;
  desc: string;
  skills?: string[];
}

export interface PrecautionItem {
  icon: string;
  text: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface CodeSimData {
  language: string;
  label: string;
  code: string;
}
