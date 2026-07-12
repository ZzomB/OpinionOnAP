import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/github';

// Cache the sitemap for 24 hours (86400 seconds) to avoid hitting GitHub API on crawler requests
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  const baseUrl = 'https://www.wedodare.com/feed/OpinionOnAP';

  const articleEntries = articles.map((article) => ({
    url: `${baseUrl}/posts/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...articleEntries,
  ];
}
