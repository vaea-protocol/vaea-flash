'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_PAGES } from '../nav';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = query.length >= 2
    ? ALL_PAGES.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-3)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search docs..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            borderRadius: 12, border: '1.5px solid var(--border)',
            background: 'white', fontFamily: 'Outfit, sans-serif',
            fontSize: '0.82rem', color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--emerald)')}
          onMouseLeave={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
          background: 'white', borderRadius: 14, border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: 340, overflowY: 'auto',
        }}>
          {results.map(page => (
            <button
              key={page.slug}
              onClick={() => { router.push(`/flash/docs/${page.slug}`); setOpen(false); setQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'Outfit, sans-serif',
                borderBottom: '1px solid var(--border)', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '0.85rem' }}>{page.icon}</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{page.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 1 }}>{page.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
          background: 'white', borderRadius: 14, border: '1px solid var(--border)',
          padding: '20px 16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)',
        }}>
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
