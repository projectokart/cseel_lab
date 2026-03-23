import React from "react";
import { C, ResultsData } from "./constants";
import { ScrollSection } from "./atoms";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  results: ResultsData;
}

const ResultsSection: React.FC<Props> = ({ results }) => {
  return (
    <ScrollSection id="results" number="06" title="Results, Data & Graph" icon="📊" alt>
      {/* Observations */}
      <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
        {results.observations.map(({ obs, sig }, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.green}12`, border: `1px solid ${C.green}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: C.green, fontSize: 14 }}>✓</span>
            </div>
            <div>
              <div style={{ fontSize: 13.5, color: C.text, marginBottom: 4 }}>{obs}</div>
              <div style={{ fontSize: 12.5, color: C.teal, fontStyle: "italic" }}>→ {sig}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      {results.data_table.headers.length > 0 && (
        <>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 15, marginBottom: 12 }}>📋 Observation Data Table</div>
          <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 28 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: C.white }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {results.data_table.headers.map((h, i) => (
                    <th key={i} style={{ padding: "11px 16px", textAlign: i === 0 ? "left" : "right", color: i === 0 ? C.white : C.teal, fontFamily: "monospace", fontSize: 11.5, fontWeight: "normal", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.data_table.rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.offWhite }}>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 13, color: C.teal, fontWeight: "bold" }}>{row[0]}</td>
                    {row.slice(1).map((v, j) => (
                      <td key={j} style={{ padding: "10px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: C.textMid }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Graph */}
      {results.graph_data.length > 0 && (
        <>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 15, marginBottom: 12 }}>📈 Data Graph</div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.graph_data} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.teal} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="r" stroke={C.textLight} tick={{ fontSize: 11, fill: C.textMid }} />
                <YAxis stroke={C.textLight} tick={{ fontSize: 11, fill: C.textMid }} />
                <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="B2" name="Series 1" stroke={C.teal} strokeWidth={2.5} fill="url(#sg1)" dot={{ fill: C.teal, r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="B4" name="Series 2" stroke={C.navy} strokeWidth={2} fill="none" strokeDasharray="5 2" dot={{ fill: C.navy, r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ScrollSection>
  );
};

export default ResultsSection;
