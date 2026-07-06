import type { MetadataRoute } from 'next';

const BASE_URL = 'https://memoramagnet.shop';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/upload`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/shipping`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/track`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
