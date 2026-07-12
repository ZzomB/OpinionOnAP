import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, ExternalLink, FileText, BookOpen, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getArticles, getArticleBySlug } from '@/lib/github';
import TableOfContents from '@/components/TableOfContents';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface TocEntry {
  value: string;
  depth: number;
  id: string;
  children?: TocEntry[];
}

// Helper to parse TOC dynamically
function parseToc(article: { summaryMd?: string; mainMd?: string; analysisMd?: string }): TocEntry[] {
  const toc: TocEntry[] = [];

  // 1. 핵심 요약
  if (article.summaryMd) {
    toc.push({
      value: '핵심 요약',
      depth: 2,
      id: 'summary',
      children: []
    });
  }

  // Extract H3 headings from markdown content
  const extractH3s = (mdText: string): TocEntry[] => {
    if (!mdText) return [];
    const lines = mdText.split('\n');
    const h3s: TocEntry[] = [];
    lines.forEach((line) => {
      const match = line.match(/^###\s+(.+)$/);
      if (match) {
        const title = match[1].replace(/\*\*/g, '').trim();
        const cleanId = title
          .toLowerCase()
          .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, '')
          .replace(/\s+/g, '-');
        h3s.push({
          value: title,
          depth: 3,
          id: cleanId,
        });
      }
    });
    return h3s;
  };

  // 2. 주요 내용
  if (article.mainMd) {
    toc.push({
      value: '주요 내용',
      depth: 2,
      id: 'main-content',
      children: extractH3s(article.mainMd)
    });
  }

  // 3. 시사점 및 분석
  if (article.analysisMd) {
    toc.push({
      value: '시사점 및 분석',
      depth: 2,
      id: 'analysis',
      children: extractH3s(article.analysisMd)
    });
  }

  return toc;
}

// ReactMarkdown Heading override to inject dynamic IDs
const markdownComponents = {
  h3: ({ node, children, ...props }: any) => {
    const text = String(children || '');
    const id = text
      .toLowerCase()
      .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, '')
      .replace(/\s+/g, '-');
    return (
      <h3 id={id} className="scroll-mt-20 font-bold text-foreground text-base md:text-lg mt-6 mb-3" {...props}>
        {children}
      </h3>
    );
  }
};

// Statically generate routes at build time
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600;

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const toc = parseToc(article);

  // Dynamic Disclaimer English Translation & Selective Bullet Removing (Supports old posts)
  const cleanFooterMd = article.footerMd
    ? article.footerMd
        .replace(/^\s*\*\s+/gm, '') // Remove bullet points only from the separate footer section
        .replace(/\n(?=\*\*Disclaimer:\*\*|Disclaimer:)/g, '\n\n') // Ensure double newline before Disclaimer for paragraph break
        .replace(
          /Disclaimer:.*AP\s*통신.*/g,
          "**Disclaimer:** While referencing AP News reports for factual background, the core of this post is the author's independent analysis and subjective insights."
        )
    : '';

  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      {/* 2-Column Layout Grid for Table of Contents Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-12">
        
        {/* Left: Main Editorial Content */}
        <article className="space-y-8 overflow-hidden">
          {/* Back Button */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              피드로 돌아가기
            </Link>
          </div>

          {/* Title Area & Metadata Block */}
          <div className="space-y-4 border-b border-border/80 pb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {article.title}
            </h1>

            {/* Rearranged Meta Row below title */}
            <div className="flex flex-row items-end justify-between pt-2">
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-foreground/90 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {article.category}
                </span>
                <span className="text-muted-foreground text-xs font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
              </div>
              
              {article.originalLink && (
                <div>
                  <a
                    href={article.originalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-semibold border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg"
                  >
                    AP News 원본 기사 <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Collapsible TOC */}
          {toc.length > 0 && (
            <div className="lg:hidden sticky top-(--sticky-top) z-30 mb-6">
              <details className="bg-secondary/40 border border-border/80 rounded-xl p-4 backdrop-blur-xs select-none">
                <summary className="cursor-pointer text-sm font-bold text-foreground">목차</summary>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <TableOfContents toc={toc} />
                </div>
              </details>
            </div>
          )}

          {/* Section 1: 핵심 요약 (Mint card styled for callout accentuation) */}
          {article.summaryMd && (
            <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8 space-y-4 shadow-xs">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
              <h2 id="summary" className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-primary scroll-mt-20">
                <FileText className="w-6 h-6" />
                핵심 요약
              </h2>
              <div className="prose prose-base md:prose-lg dark:prose-invert prose-primary max-w-none text-foreground/90 prose-p:leading-[1.75] md:prose-p:leading-[1.85] prose-li:leading-[1.75] md:prose-li:leading-[1.85] prose-li:my-1.5">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{article.summaryMd}</ReactMarkdown>
              </div>
            </section>
          )}

          {/* Explicit Divider 1: summary -> main */}
          {article.summaryMd && article.mainMd && (
            <hr className="border-t border-border/60 my-6" />
          )}

          {/* Section 2: 주요 내용 (Plain section without card structure) */}
          {article.mainMd && (
            <section className="space-y-4 py-2">
              <h2 id="main-content" className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-foreground scroll-mt-20">
                <BookOpen className="w-6 h-6 text-primary" />
                주요 내용
              </h2>
              <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none text-foreground/90 prose-headings:font-bold prose-headings:text-foreground prose-h3:scroll-mt-20 prose-p:leading-[1.75] md:prose-p:leading-[1.85] prose-li:leading-[1.75] md:prose-li:leading-[1.85] prose-p:mb-4">
                <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
                  {article.mainMd}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Explicit Divider 2: main -> analysis */}
          {article.mainMd && article.analysisMd && (
            <hr className="border-t border-border/60 my-6" />
          )}

          {/* Section 3: 시사점 및 분석 (Plain section without card structure) */}
          {article.analysisMd && (
            <section className="space-y-4 py-2">
              <h2 id="analysis" className="flex items-center gap-2 text-xl md:text-2xl font-extrabold text-foreground scroll-mt-20">
                <BarChart2 className="w-6 h-6 text-primary" />
                시사점 및 분석
              </h2>
              <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none text-foreground/90 prose-headings:font-bold prose-headings:text-foreground prose-h3:scroll-mt-20 prose-p:leading-[1.75] md:prose-p:leading-[1.85] prose-li:leading-[1.75] md:prose-li:leading-[1.85] prose-p:mb-4">
                <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
                  {article.analysisMd}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Explicit Divider 3: analysis -> footer */}
          {article.analysisMd && cleanFooterMd && (
            <hr className="border-t border-border/60 my-6" />
          )}

          {/* Disclaimer & Citation Footer (Clean without extra inner borders) */}
          {cleanFooterMd && (
            <section className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed">
              <div className="prose dark:prose-invert prose-xs max-w-none text-muted-foreground/80 prose-p:my-1 prose-li:my-1">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{cleanFooterMd}</ReactMarkdown>
              </div>
            </section>
          )}
        </article>

        {/* Right: Sticky Table of Contents Sidebar (Desktop only) */}
        <aside className="relative hidden lg:block">
          <div className="sticky top-(--sticky-top)">
            <div className="bg-secondary/40 border border-border/90 rounded-2xl p-6 backdrop-blur-xs">
              <h3 className="text-base font-bold text-foreground mb-4">목차</h3>
              <div
                className="overflow-y-auto overscroll-contain pr-2"
                style={{
                  maxHeight: 'calc(100vh - var(--header-height) - 8rem)',
                }}
              >
                <TableOfContents toc={toc} />
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
