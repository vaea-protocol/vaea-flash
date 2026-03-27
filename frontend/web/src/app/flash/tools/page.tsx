'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

const TOOLS = [
  {
    id: 'swap',
    title: 'Collateral Swap',
    verb: 'Swap',
    color: '#29C1A2',
    gradient: 'linear-gradient(135deg, #29C1A2 0%, #1DA88B 100%)',
    tagline: 'Change collateral, keep your position open',
    desc: 'Deposit token A → flash borrow token B → repay token A → deposit token B. One tx. Zero exposure gap. Your position never closes.',
    benefits: ['No manual close/reopen', 'Zero liquidation risk during swap', 'Works across Marginfi, Kamino, Drift'],
    example: 'You hold SOL as collateral but want JitoSOL for yield. Swap in 1 atomic tx instead of manually closing, swapping, re-depositing.',
  },
  {
    id: 'liq',
    title: 'Self-Liquidation',
    verb: 'Protect',
    color: '#FF718F',
    gradient: 'linear-gradient(135deg, #FF718F 0%, #E5567A 100%)',
    tagline: 'Liquidate yourself, save the penalty',
    desc: 'When your health factor drops, protocols charge 5-15% penalty. Self-liquidate with VAEA Flash and pay only the 0.03% flash fee.',
    benefits: ['Save 5-15% vs protocol liquidation', 'Real-time health factor monitoring', 'Automatic threshold alerts'],
    example: 'Health factor at 1.05? Instead of waiting for a bot to take 10%, self-liquidate and save ~$500 on a $5K position.',
  },
  {
    id: 'lever',
    title: 'Leverage',
    verb: 'Multiply',
    color: '#823FFF',
    gradient: 'linear-gradient(135deg, #823FFF 0%, #6B2FD9 100%)',
    tagline: 'Loop leverage in one atomic transaction',
    desc: 'Flash borrow → deposit → borrow → deposit → repay. Create 2-5x leveraged positions without manual looping. Set-and-forget.',
    benefits: ['Up to 5x leverage in 1 tx', 'No manual deposit-borrow loops', 'Instant unwind when needed'],
    example: 'Want 3x SOL exposure? VAEA does deposit→borrow→deposit→borrow→deposit→repay in one atomic tx. Gas: ~0.001 SOL.',
  },
];

export default function ToolsPage() {
  const [active, setActive] = useState<string | null>(null);
  const activeTool = TOOLS.find(t => t.id === active);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ Hero ═══ */}
      <div className="mx" style={{ paddingTop: 56, paddingBottom: 20 }}>
        <div className="fade-in" style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.4rem)', marginBottom: 10 }}>
            DeFi superpowers,<br />
            <span style={{ background: 'linear-gradient(135deg, #29C1A2, #823FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              one transaction.
            </span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 440 }}>
            Flash loans are the engine. These tools are what you actually use.
            No code required — connect wallet, pick action, sign once.
          </p>
        </div>
      </div>

      {/* ═══ Tool Cards ═══ */}
      <div className="mx" style={{ paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TOOLS.map((t, i) => (
            <div
              key={t.id}
              className="fade-in"
              style={{ animationDelay: `${i * 0.08}s`, cursor: 'pointer' }}
              onClick={() => setActive(active === t.id ? null : t.id)}
            >
              {/* Color header bar */}
              <div style={{
                background: t.gradient,
                borderRadius: '24px 24px 0 0',
                padding: '28px 28px 22px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                }} />
                <div style={{
                  position: 'absolute', bottom: -30, left: 20,
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }} />
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, marginBottom: 10 }}>
                  {t.verb}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.2 }}>
                  {t.title}
                </div>
              </div>

              {/* Body */}
              <div style={{
                background: 'white',
                borderRadius: '0 0 24px 24px',
                padding: '22px 28px 28px',
                border: '1px solid var(--border)',
                borderTop: 'none',
                transition: 'box-shadow 0.25s var(--ease)',
                boxShadow: active === t.id ? `0 8px 32px ${t.color}20` : 'none',
              }}>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 18 }}>
                  {t.tagline}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.benefits.map(b => (
                    <span key={b} style={{
                      padding: '5px 12px', borderRadius: 'var(--r-full)',
                      background: `${t.color}10`, color: t.color,
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {b}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 18 }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, color: t.color,
                    cursor: 'pointer',
                  }}>
                    {active === t.id ? 'Close ↑' : 'Learn more →'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Expanded Detail ═══ */}
      {activeTool && (
        <div className="mx fade-in" style={{ paddingBottom: 40 }}>
          <div style={{
            background: 'white', borderRadius: 'var(--r-lg)',
            padding: 36, border: '1px solid var(--border)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40,
          }}>
            <div>
              <div style={{
                display: 'inline-flex', padding: '6px 14px', borderRadius: 'var(--r-full)',
                background: `${activeTool.color}12`, color: activeTool.color,
                fontSize: '0.72rem', fontWeight: 800, marginBottom: 14,
              }}>
                How it works
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 12 }}>{activeTool.title}</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24 }}>
                {activeTool.desc}
              </p>
              <button className="btn btn-dark">
                Connect Wallet
              </button>
            </div>
            <div>
              <div style={{
                background: 'var(--bg)', borderRadius: 'var(--r)', padding: 24,
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Example scenario
                </div>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.75, fontWeight: 500 }}>
                  {activeTool.example}
                </p>
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                  {['begin_flash', activeTool.verb.toLowerCase(), 'end_flash'].map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 1 ? activeTool.gradient : 'var(--border)',
                        color: i === 1 ? 'white' : 'var(--text-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 900,
                      }}>
                        {i + 1}
                      </div>
                      <code style={{ fontSize: '0.72rem', fontWeight: 700, color: i === 1 ? activeTool.color : 'var(--text-2)' }}>
                        {step}
                      </code>
                      {i < 2 && <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CTA ═══ */}
      <div className="mx" style={{ paddingBottom: 80 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)',
          borderRadius: 'var(--r-xl)', padding: '48px 52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(41,193,162,0.15)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '40%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(130,63,255,0.12)', filter: 'blur(30px)' }} />
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 6 }}>
              Build with VAEA Flash
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              Want to build your own tool? Our SDKs give you full control.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link href="/flash/docs" className="btn" style={{ background: 'white', color: 'var(--text)', fontWeight: 800 }}>
              Read Docs
            </Link>
            <a href="https://github.com/vaea" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
