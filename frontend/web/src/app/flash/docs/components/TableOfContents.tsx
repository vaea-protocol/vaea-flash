'use client';
import { useEffect, useState, useCallback } from 'react';
import type { DocPage } from '../nav';

export default function TableOfContents({ page }: { page: DocPage }) {
  const [activeId, setActiveId] = useState(page.headings[0]?.id || '');

  /* ── Scroll spy — tracks which heading is currently in view ── */
  const handleScroll = useCallback(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const scrollTop = main.scrollTop;
    let currentId = page.headings[0]?.id || '';

    for (const h of page.headings) {
      const el = document.getElementById(h.id);
      if (!el) continue;
      // offsetTop is relative to the document, we need position relative to main
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top;
      if (top <= 100) {
        currentId = h.id;
      }
    }
    setActiveId(currentId);
  }, [page.headings]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    main.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => main.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (page.headings.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const main = document.querySelector('main');
    if (!el || !main) return;
    const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 20;
    main.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div style={{ width: 200, flexShrink: 0 }}>
      <div style={{
        fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
        color: 'var(--text-3)', marginBottom: 10,
      }}>
        On this page
      </div>
      {page.headings.map(h => {
        const isActive = activeId === h.id;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}
            style={{
              display: 'block', textDecoration: 'none',
              padding: '4px 0',
              fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--emerald)' : 'var(--text-3)',
              borderLeft: isActive ? '2px solid var(--emerald)' : '2px solid transparent',
              paddingLeft: h.level === 3 ? 22 : 10,
              transition: 'all 0.15s ease', lineHeight: 1.6,
            }}
          >
            {h.label}
          </a>
        );
      })}
    </div>
  );
}
