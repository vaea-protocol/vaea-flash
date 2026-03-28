'use client';
import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentSlug = pathname.split('/').pop() || 'introduction';
  const currentPage = ALL_PAGES.find(p => p.slug === currentSlug);
  const currentIdx = ALL_PAGES.findIndex(p => p.slug === currentSlug);
  const prev = currentIdx > 0 ? ALL_PAGES[currentIdx - 1] : null;
  const next = currentIdx < ALL_PAGES.length - 1 ? ALL_PAGES[currentIdx + 1] : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ═══ App Navbar (64px) ═══ */}
      <Navbar />

      {/* ═══ Mobile docs header — hamburger + page title ═══ */}
      <div className="docs-mobile-header">
        <button
          className="docs-mobile-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {sidebarOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
            }
          </svg>
        </button>
        <span className="docs-mobile-title">{currentPage?.icon} {currentPage?.title || 'Documentation'}</span>
      </div>

      {/* ═══ Docs body — fills remaining height ═══ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ═══ Sidebar (gauche) — desktop: always visible, mobile: overlay ═══ */}
        <div className={`docs-sidebar-wrapper ${sidebarOpen ? 'docs-sidebar-open' : ''}`}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* ═══ Mobile overlay backdrop ═══ */}
        {sidebarOpen && (
          <div className="docs-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ═══ Center + Right column ═══ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', minHeight: 0 }}>

            {/* Center — ONLY this scrolls */}
            <main className="docs-no-scrollbar docs-main" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '36px 40px 80px' }}>
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

            {/* Right — Search + Table of Contents (desktop only) */}
            <div className="docs-toc-column">
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
