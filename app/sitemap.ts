import type { MetadataRoute } from 'next';
import { DEFAULT_SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: DEFAULT_SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${DEFAULT_SITE_URL}/input`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
