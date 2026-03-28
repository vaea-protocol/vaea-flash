'use client';
import { useState, type ReactNode } from 'react';

/* ── Code Block with header + copy ── */
export function Code({ code, lang = 'typescript' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#1c1c1c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang || 'code'}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: copied ? '#29C1A2' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', background: '#1a1a1a', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.7, color: '#e0e0e0' }}>{code}</code>
      </pre>
    </div>
  );
}

/* ── Multi-SDK Code Tabs (TS / Rust / Python) ── */
export function CodeTabs({ ts, rust, python }: { ts: string; rust?: string; python?: string }) {
  const [tab, setTab] = useState<'ts' | 'rust' | 'python'>('ts');
  const [copied, setCopied] = useState(false);
  const tabs = [
    { key: 'ts' as const, label: 'TypeScript' },
    ...(rust ? [{ key: 'rust' as const, label: 'Rust' }] : []),
    ...(python ? [{ key: 'python' as const, label: 'Python' }] : []),
  ];
  const code = tab === 'ts' ? ts : tab === 'rust' ? (rust || '') : (python || '');
  const lang = tab === 'ts' ? 'typescript' : tab;
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1c1c1c', padding: '4px 6px 4px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
              background: tab === t.key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: copied ? '#29C1A2' : 'rgba(255,255,255,0.4)', padding: '0 10px' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', background: '#1a1a1a', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.7, color: '#e0e0e0' }}>{code}</code>
      </pre>
    </div>
  );
}
