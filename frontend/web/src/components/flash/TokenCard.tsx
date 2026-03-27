'use client';
import Link from 'next/link';
import type { TokenCapacity } from '@/lib/api';
import { formatAmount, formatPct } from '@/lib/constants';

interface TokenCardProps {
  token: TokenCapacity;
  index: number;
}

export default function TokenCard({ token, index }: TokenCardProps) {
  const isDirect = token.route_type === 'direct';

  return (
    <Link
      href={`/flash/${token.symbol}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="glow-card"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          animation: `fadeInUp 0.5s var(--ease) ${index * 0.05}s forwards`,
          opacity: 0,
          cursor: 'pointer',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: isDirect ? 'var(--vaea-teal-ultra-light)' : 'var(--bg-alt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: isDirect ? 'var(--vaea-teal)' : 'var(--text-secondary)',
            }}>
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{token.symbol}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{token.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`status-dot ${token.status}`} />
            <span className={`badge ${isDirect ? 'badge-teal' : 'badge-success'}`}>
              {isDirect ? 'Direct' : 'Synthetic'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 2 }}>
              Max Capacity
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {formatAmount(token.max_amount)}
            </div>
          </div>
          <div style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 2 }}>
              Fee (SDK)
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--vaea-teal)' }}>
              {formatPct(token.fee_sdk.total_pct)}
            </div>
          </div>
        </div>

        {/* Route info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          <span>via {token.source_protocol}</span>
          {token.swap_protocol && (
            <>
              <span style={{ color: 'var(--vaea-teal)' }}>→</span>
              <span>{token.swap_protocol}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
