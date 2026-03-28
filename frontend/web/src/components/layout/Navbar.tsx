'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/flash', label: 'Dashboard' },
  { href: '/flash/tools', label: 'Tools' },
  { href: '/flash/learn', label: 'Learn' },
  { href: '/flash/docs', label: 'Docs' },
  { href: 'https://github.com/vaea-protocol/vaea-flash', label: 'GitHub', external: true },
];

export default function Navbar() {
  const path = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(254,244,239,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div className="mx" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <Link href="/flash" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <Image src="/Logo_noire.png" alt="VAEA" width={80} height={28} style={{ objectFit: 'contain' }} priority />
          </Link>

          {/* Desktop nav */}
          <nav className="pill-nav desktop-only" style={{ flexDirection: 'row' }}>
            {NAV.map(item => {
              const active = !item.external && (path === item.href || (item.href !== '/flash' && path.startsWith(item.href)));
              if (item.external) {
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  </a>
                );
              }
              return (
                <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop connect */}
          <button className="btn btn-dark desktop-only" style={{ fontSize: '0.8rem', padding: '9px 22px', flexDirection: 'row' }} onClick={() => setShowModal(true)}>
            Connect
          </button>

          {/* Mobile hamburger */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, flexDirection: 'column', gap: 5,
              display: 'none', /* overridden by mobile-only */
            }}
            aria-label="Menu"
          >
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: 'var(--text)', transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: 'var(--text)', transition: 'all 0.3s',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: 'var(--text)', transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
            }} />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div
            className="mobile-only"
            style={{
              flexDirection: 'column',
              padding: '8px 16px 16px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(254,244,239,0.98)',
              backdropFilter: 'blur(20px)',
              display: 'none', /* overridden by mobile-only */
            }}
          >
            {NAV.map(item => {
              const active = !item.external && (path === item.href || (item.href !== '/flash' && path.startsWith(item.href)));
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 12px', borderRadius: 14,
                      fontSize: '0.95rem', fontWeight: 600,
                      color: 'var(--text-2)', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    {item.label}
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 12px',
                    borderRadius: 14,
                    fontSize: '0.95rem',
                    fontWeight: active ? 800 : 600,
                    color: active ? 'var(--text)' : 'var(--text-2)',
                    textDecoration: 'none',
                    background: active ? 'white' : 'transparent',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="btn btn-dark"
              onClick={() => { setShowModal(true); setMenuOpen(false); }}
              style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: '0.88rem' }}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </header>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="fade-in"
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '40px 44px',
              maxWidth: 380,
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔌</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 8 }}>Wallet Connect</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
              Wallet connection is coming soon.<br />
              In the meantime, explore the dashboard and documentation.
            </p>
            <div style={{ display: 'inline-flex', padding: '5px 16px', borderRadius: 'var(--r-full)', background: '#823FFF10', color: '#823FFF', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 20 }}>
              Coming Soon
            </div>
            <br />
            <button className="btn btn-dark" onClick={() => setShowModal(false)} style={{ fontSize: '0.82rem', padding: '10px 28px' }}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
