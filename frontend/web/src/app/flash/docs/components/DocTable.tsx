import type { ReactNode } from 'react';

/* ── VAEA-styled doc table ── */
export function DocTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 20, WebkitOverflowScrolling: 'touch' }}>
      <table className="vtable">
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Inline tag/badge ── */
export function Tag({ children, color = 'emerald' }: { children: ReactNode; color?: 'emerald' | 'coral' | 'purple' | 'orange' | 'sky' | 'default' }) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}
