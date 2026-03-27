import { MetadataRoute } from 'next';
import { SUPPORTED_TOKENS } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://vaea.fi';

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/flash`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/flash/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/flash/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/flash/learn`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/flash/tools/collateral-swap`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/flash/tools/self-liquidation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/flash/tools/leverage`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const tokenPages: MetadataRoute.Sitemap = SUPPORTED_TOKENS.map(token => ({
    url: `${base}/flash/${token.symbol}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...tokenPages];
}
