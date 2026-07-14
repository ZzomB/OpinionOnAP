'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Article } from '@/lib/github';

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  const [readSlugs, setReadSlugs] = useState<string[]>([]);

  // Load read articles history from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('read-articles');
        if (stored) {
          setReadSlugs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading read history:', e);
      }
    }
  }, []);

  // Mark an article as read
  const handleArticleClick = (slug: string) => {
    if (!readSlugs.includes(slug)) {
      const updated = [...readSlugs, slug];
      setReadSlugs(updated);
      try {
        localStorage.setItem('read-articles', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving read history:', e);
      }
    }
  };

  // Find the two most recent dates in the articles array
  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(articles.map((a) => a.date)));
    uniqueDates.sort((a, b) => b.localeCompare(a)); // Sort descending
    return {
      today: uniqueDates[0] || null,
      yesterday: uniqueDates[1] || null,
    };
  }, [articles]);

  // Today's articles
  const todayArticles = useMemo(() => {
    return articles.filter((a) => a.date === dates.today);
  }, [articles, dates.today]);

  const todayBusiness = useMemo(() => {
    return todayArticles.filter((a) => a.category.toLowerCase() === 'business');
  }, [todayArticles]);

  const todayWorld = useMemo(() => {
    return todayArticles.filter((a) => a.category.toLowerCase() === 'world');
  }, [todayArticles]);

  // Yesterday's articles
  const yesterdayArticles = useMemo(() => {
    return articles.filter((a) => a.date === dates.yesterday);
  }, [articles, dates.yesterday]);

  const yesterdayBusiness = useMemo(() => {
    return yesterdayArticles.filter((a) => a.category.toLowerCase() === 'business');
  }, [yesterdayArticles]);

  const yesterdayWorld = useMemo(() => {
    return yesterdayArticles.filter((a) => a.category.toLowerCase() === 'world');
  }, [yesterdayArticles]);

  // Format YYYY-MM-DD date string to English (e.g. July 13, 2026)
  const formatEnglishDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const year = parts[0];
      const month = months[parseInt(parts[1], 10) - 1] || '';
      const day = parseInt(parts[2], 10);
      return `${month} ${day}, ${year}`;
    }
    return dateStr;
  };

  // Utility to parse summary markdown into raw text for excerpt
  const getExcerpt = (summaryMd: string) => {
    const plainText = summaryMd
      .replace(/[\*\-]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (plainText.length > 140) {
      return plainText.slice(0, 140) + '...';
    }
    return plainText || '요약 내용이 없습니다.';
  };

  return (
    <div className="w-full space-y-12">
      {/* Centered Simplified Title Area */}
      <section className="text-center pt-4 pb-2 space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          OpinionOnAP
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Daily feed providing original perspectives and analytical commentary on topics reported by AP News.
        </p>
      </section>

      {/* 1. Today's Briefing Block */}
      {dates.today && (
        <div className="space-y-6">
          {/* Today's Divider Bar */}
          <div className="w-full flex items-center gap-4 py-1">
            <div className="flex-grow h-px bg-border/90" />
            <span className="text-sm font-semibold tracking-wider uppercase text-primary/95 bg-primary/10 px-3.5 py-1 rounded-full border border-primary/30">
              Today's Briefing — {formatEnglishDate(dates.today)}
            </span>
            <div className="flex-grow h-px bg-border/90" />
          </div>

          {/* Today's 2-Column Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Business Column */}
            <div className="rounded-2xl bg-card/45 border border-border/90 p-6 shadow-xs flex flex-col h-fit">
              <div className="flex justify-center items-center border-b border-border/75 pb-4 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground text-center">
                  Business
                </h2>
              </div>
              {todayBusiness.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Today's Business news has not been posted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {todayBusiness.map((article) => {
                    const isRead = readSlugs.includes(article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/posts/${article.slug}`}
                        onClick={() => handleArticleClick(article.slug)}
                        className="block group -mx-6 px-6 py-4 flex flex-col gap-2 hover:bg-secondary/25 border-b border-border/75 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-bold transition-colors leading-snug duration-150 ${
                            isRead 
                              ? 'text-muted-foreground/60 dark:text-zinc-500 font-medium' 
                              : 'text-foreground group-hover:text-primary'
                          }`}>
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
                          {getExcerpt(article.summaryMd)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* World Column */}
            <div className="rounded-2xl bg-card/45 border border-border/90 p-6 shadow-xs flex flex-col h-fit">
              <div className="flex justify-center items-center border-b border-border/75 pb-4 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground text-center">
                  World
                </h2>
              </div>
              {todayWorld.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Today's World news has not been posted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {todayWorld.map((article) => {
                    const isRead = readSlugs.includes(article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/posts/${article.slug}`}
                        onClick={() => handleArticleClick(article.slug)}
                        className="block group -mx-6 px-6 py-4 flex flex-col gap-2 hover:bg-secondary/25 border-b border-border/75 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-bold transition-colors leading-snug duration-150 ${
                            isRead 
                              ? 'text-muted-foreground/60 dark:text-zinc-500 font-medium' 
                              : 'text-foreground group-hover:text-primary'
                          }`}>
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
                          {getExcerpt(article.summaryMd)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2. Yesterday's Briefing Block */}
      {dates.yesterday && (
        <div className="space-y-6 pt-4">
          {/* Yesterday's Divider Bar */}
          <div className="w-full flex items-center gap-4 py-1">
            <div className="flex-grow h-px bg-border/90" />
            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground bg-secondary/80 px-3.5 py-1 rounded-full border border-border">
              Yesterday's Briefing — {formatEnglishDate(dates.yesterday)}
            </span>
            <div className="flex-grow h-px bg-border/90" />
          </div>

          {/* Yesterday's 2-Column Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Business Column */}
            <div className="rounded-2xl bg-card/45 border border-border/90 p-6 shadow-xs flex flex-col h-fit">
              <div className="flex justify-center items-center border-b border-border/75 pb-4 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground text-center">
                  Business
                </h2>
              </div>
              {yesterdayBusiness.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Yesterday's Business news is not available.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {yesterdayBusiness.map((article) => {
                    const isRead = readSlugs.includes(article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/posts/${article.slug}`}
                        onClick={() => handleArticleClick(article.slug)}
                        className="block group -mx-6 px-6 py-4 flex flex-col gap-2 hover:bg-secondary/25 border-b border-border/75 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-bold transition-colors leading-snug duration-150 ${
                            isRead 
                              ? 'text-muted-foreground/60 dark:text-zinc-500 font-medium' 
                              : 'text-foreground group-hover:text-primary'
                          }`}>
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
                          {getExcerpt(article.summaryMd)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* World Column */}
            <div className="rounded-2xl bg-card/45 border border-border/90 p-6 shadow-xs flex flex-col h-fit">
              <div className="flex justify-center items-center border-b border-border/75 pb-4 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground text-center">
                  World
                </h2>
              </div>
              {yesterdayWorld.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Yesterday's World news is not available.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {yesterdayWorld.map((article) => {
                    const isRead = readSlugs.includes(article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/posts/${article.slug}`}
                        onClick={() => handleArticleClick(article.slug)}
                        className="block group -mx-6 px-6 py-4 flex flex-col gap-2 hover:bg-secondary/25 border-b border-border/75 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-bold transition-colors leading-snug duration-150 ${
                            isRead 
                              ? 'text-muted-foreground/60 dark:text-zinc-500 font-medium' 
                              : 'text-foreground group-hover:text-primary'
                          }`}>
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
                          {getExcerpt(article.summaryMd)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
