'use client';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from './components/Sidebar';
import TableOfContents from './components/TableOfContents';
import SearchBar from './components/SearchBar';
import type { ReactNode } from 'react';
import { ALL_PAGES } from './nav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSlug = pathname.split('/').pop() || 'introduction';
  const currentPage = ALL_PAGES.find(p => p.slug === currentSlug);
  const currentIdx = ALL_PAGES.findIndex(p => p.slug === currentSlug);
  const prev = currentIdx > 0 ? ALL_PAGES[currentIdx - 1] : null;
  const next = currentIdx < ALL_PAGES.length - 1 ? ALL_PAGES[currentIdx + 1] : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ═══ App Navbar (64px) ═══ */}
      <Navbar />

      {/* ═══ Docs body — fills remaining height ═══ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ═══ Sidebar (gauche) — never scrolls with content ═══ */}
        <Sidebar />

        {/* ═══ Center + Right column ═══ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', minHeight: 0 }}>

            {/* Center — ONLY this scrolls */}
            <main className="docs-no-scrollbar" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '36px 40px 80px' }}>
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                {children}

                {/* ── Prev / Next ── */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', gap: 16,
                  marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--border)',
                }}>
                  {prev ? (
                    <button onClick={() => router.push(`/flash/docs/${prev.slug}`)} style={{
                      flex: 1, textAlign: 'left', padding: '14px 18px', borderRadius: 14,
                      border: '1px solid var(--border)', background: 'white', cursor: 'pointer',
                      transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--emerald)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>← Previous</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{prev.icon} {prev.title}</div>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => router.push(`/flash/docs/${next.slug}`)} style={{
                      flex: 1, textAlign: 'right', padding: '14px 18px', borderRadius: 14,
                      border: '1px solid var(--border)', background: 'white', cursor: 'pointer',
                      transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--emerald)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Next →</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{next.icon} {next.title}</div>
                    </button>
                  ) : <div />}
                </div>
              </div>
            </main>

            {/* Right — Search + Table of Contents */}
            <div className="desktop-only" style={{ padding: '20px 24px 36px 0', flexDirection: 'column', flexShrink: 0, width: 230 }}>
              <SearchBar />
              {currentPage && (
                <div style={{ marginTop: 24 }}>
                  <TableOfContents page={currentPage} />
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
