'use client';
import { usePathname, useRouter } from 'next/navigation';
import { NAV } from '../nav';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const current = pathname.split('/').pop() || 'introduction';

  return (
    <aside className="docs-no-scrollbar" style={{
      width: 260, flexShrink: 0, height: '100%',
      borderRight: '1px solid var(--border)', background: 'white',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Status banner ── */}
      <div style={{
        margin: '16px 16px 16px', padding: '10px 14px', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(41,193,162,0.07), rgba(130,63,255,0.04))',
        border: '1px solid rgba(41,193,162,0.12)', fontSize: '0.7rem', color: 'var(--text-2)',
      }}>
        <strong style={{ color: 'var(--text)' }}>⚠️ Devnet Only</strong><br />
        Mainnet — April 2026
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, paddingBottom: 16 }}>
        {NAV.map(group => (
          <div key={group.title} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--text-3)', padding: '0 20px', marginBottom: 4,
            }}>
              {group.title}
            </div>
            {group.pages.map(page => {
              const isActive = current === page.slug;
              return (
                <button
                  key={page.slug}
                  onClick={() => router.push(`/flash/docs/${page.slug}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 20px', border: 'none', cursor: 'pointer',
                    background: isActive ? 'var(--vaea-accent-light)' : 'transparent',
                    borderRight: isActive ? '2.5px solid var(--emerald)' : '2.5px solid transparent',
                    fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text)' : 'var(--text-2)',
                    fontFamily: 'Outfit, sans-serif', borderRadius: 0,
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = 'var(--bg)'); }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = 'transparent'); }}
                >
                  <span style={{ fontSize: '0.78rem', width: 20, textAlign: 'center' }}>{page.icon}</span>
                  {page.title}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
        <a href="https://github.com/vaea-protocol/vaea-flash" target="_blank" rel="noopener" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>GitHub ↗</a>
        <span style={{ margin: '0 8px' }}>·</span>
        <a href="https://discord.gg/vaea" target="_blank" rel="noopener" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Discord ↗</a>
        <span style={{ margin: '0 8px' }}>·</span>
        <a href="https://twitter.com/vaboratory" target="_blank" rel="noopener" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Twitter ↗</a>
      </div>
    </aside>
  );
}
