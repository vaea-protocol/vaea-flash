import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VAEA Flash — Universal Flash Loans on Solana",
    template: "%s | VAEA Flash",
  },
  description:
    "Flash loan any SPL token on Solana in a single atomic transaction. 30+ tokens supported including LSTs and mid-caps. From 0.03% fee. SDKs in TypeScript, Rust, and Python.",
  keywords: [
    "solana flash loan",
    "flash loan",
    "defi",
    "solana lending",
    "VAEA",
    "universal flash loan",
    "SPL token",
    "JitoSOL flash loan",
    "mSOL flash loan",
    "USDC flash loan",
    "solana defi protocol",
    "flash loan SDK",
    "atomic transaction",
    "solana arbitrage",
    "liquidation bot solana",
    "flash loan aggregator",
  ],
  metadataBase: new URL("https://vaea.fi"),
  alternates: { canonical: "/flash" },
  openGraph: {
    title: "VAEA Flash — Universal Flash Loans on Solana",
    description:
      "Flash loan any SPL token on Solana. 30+ tokens, from 0.03% fee, one atomic transaction. The universal flash loan layer for Solana DeFi.",
    siteName: "VAEA Flash",
    type: "website",
    url: "https://vaea.fi/flash",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VAEA Flash — Universal Flash Loans on Solana",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="#FEF4EF" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "VAEA Flash",
              description:
                "Universal flash loan protocol for Solana. Borrow any SPL token in one atomic transaction.",
              applicationCategory: "DeFi",
              operatingSystem: "Solana",
              url: "https://vaea.fi/flash",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Open protocol — pay only the flash loan fee",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
