import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/crop', '/customize', '/recipients', '/checkout', '/confirmation'],
      },
    ],
    sitemap: 'https://memoramagnet.shop/sitemap.xml',
  };
}
