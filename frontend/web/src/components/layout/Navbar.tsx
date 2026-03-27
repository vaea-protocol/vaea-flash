'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/flash', label: 'Dashboard' },
  { href: '/flash/tools', label: 'Tools' },
  { href: '/flash/docs', label: 'Docs' },
];

export default function Navbar() {
  const path = usePathname();

  return (
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
        {/* Logo noir */}
        <Link href="/flash" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/Logo_noire.png" alt="VAEA" width={80} height={28} style={{ objectFit: 'contain' }} priority />
        </Link>

        {/* Center nav */}
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

        {/* Right */}
        <button className="btn btn-dark" style={{ fontSize: '0.8rem', padding: '9px 22px' }}>
          Connect
        </button>
      </div>
    </header>
  );
}
