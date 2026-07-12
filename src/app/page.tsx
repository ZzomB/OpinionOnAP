import { getLatestArticles } from '@/lib/github';
import { ArticleList } from '@/components/ArticleList';

// Enable Incremental Static Regeneration (ISR) - revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  const articles = await getLatestArticles();

  return (
    <div className="w-full">
      <ArticleList articles={articles} />
    </div>
  );
}
