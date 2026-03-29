'use client';

const ICON_MAP: Record<string, string> = {
  SOL: '/tokens/s_sol.webp',
  USDC: '/tokens/s_usdc.webp',
  USDT: '/tokens/s_usdt.webp',
  JitoSOL: '/tokens/s_jitosol.webp',
  JupSOL: '/tokens/jupsol.png',
  JUP: '/tokens/s_jup.webp',
  JLP: '/tokens/jupiter_perps.png',
  cbBTC: '/tokens/cbbtc.webp',
  mSOL: '/tokens/msol.png',
  bSOL: '/tokens/blazesolana.png',
  INF: '/tokens/infSOL.png',
  laineSOL: '/tokens/lainesol.webp',
  TRUMP: '/tokens/s_trump.webp',
  PENGU: '/tokens/s_pengu.webp',
  BONK: '/tokens/s_bonk.webp',
  WIF: '/tokens/s_wif.webp',
  RAY: '/tokens/s_ray.webp',
  HNT: '/tokens/s_hnt.webp',
  RNDR: '/tokens/RNDR.png',
  JITO: '/tokens/s_jto.webp',
  KMNO: '/tokens/s_kmno.webp',
  PYUSD: '/tokens/s_pyusd.webp',
  USDS: '/tokens/s_usds.webp',
  USD1: '/tokens/s_usd1.webp',
  USDG: '/tokens/s_usdg.webp',
  EURC: '/tokens/s_eurc.webp',
  wETH: '/tokens/s_weth.png',
  PYTH: '/tokens/s_pyth.png',
  W: '/tokens/s_w.png',
  ORCA: '/tokens/s_orca.png',
};

const FALLBACK_COLORS = [
  '#29C1A2', '#FF718F', '#823FFF', '#FF9060', '#8ECAE6',
];

interface TokenIconProps {
  symbol: string;
  size?: number;
  index?: number;
}

export default function TokenIcon({ symbol, size = 36, index = 0 }: TokenIconProps) {
  const src = ICON_MAP[symbol];

  return (
    <div className="token-coin" style={{ width: size, height: size }}>
      <div className="token-coin-inner" style={{ width: size, height: size }}>
        {src ? (
          <img
            src={src}
            alt={symbol}
            width={size}
            height={size}
            style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: size * 0.36,
              background: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
            }}
          >
            {symbol.slice(0, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
