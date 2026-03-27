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
];

export default function Navbar() {
  const path = usePathname();
  const [showModal, setShowModal] = useState(false);

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

          <nav className="pill-nav">
            {NAV.map(item => {
              const active = path === item.href || (item.href !== '/flash' && path.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button className="btn btn-dark" style={{ fontSize: '0.8rem', padding: '9px 22px' }} onClick={() => setShowModal(true)}>
            Connect
          </button>
        </div>
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
