import type { ReactNode } from 'react';

const CFG = {
  info: { bg: '#29C1A208', border: '#29C1A2', icon: 'ℹ️', label: 'Note' },
  tip:  { bg: '#823FFF08', border: '#823FFF', icon: '💡', label: 'Tip' },
  warn: { bg: '#FF718F08', border: '#FF718F', icon: '⚠️', label: 'Warning' },
};

export function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warn'; children: ReactNode }) {
  const c = CFG[type];
  return (
    <div style={{
      padding: '16px 20px', borderRadius: 14, background: c.bg,
      borderLeft: `3px solid ${c.border}`, marginBottom: 20,
      fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7,
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: c.border, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {c.icon} {c.label}
      </div>
      {children}
    </div>
  );
}
