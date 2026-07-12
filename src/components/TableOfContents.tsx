'use client';

import { useEffect, useState } from 'react';

interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

interface TableOfContentsProps {
  toc: TocEntry[];
}

function TableOfContentsLink({
  item,
  activeId,
}: {
  item: TocEntry;
  activeId: string | null;
}) {
  const isActive = activeId === item.id;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!item.id) return;

    const element = document.getElementById(item.id);
    if (element) {
      const headerHeight = 56; // --header-height: 3.5rem = 56px
      const offset = headerHeight + 20; // Additional offset padding
      
      const elementTop = element.getBoundingClientRect().top;
      const currentScrollY = window.scrollY || window.pageYOffset;
      const targetScrollY = currentScrollY + elementTop - offset;

      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth',
      });

      setTimeout(() => {
        window.history.pushState(null, '', `#${item.id}`);
        window.dispatchEvent(new Event('scroll'));
      }, 300);
    } else {
      window.location.hash = item.id;
    }
  };

  return (
    <div className="space-y-2">
      <a
        href={`#${item.id}`}
        onClick={handleClick}
        className={`block text-sm font-medium transition-colors cursor-pointer ${
          isActive
            ? 'text-primary font-bold border-l-2 border-primary pl-2'
            : 'text-muted-foreground hover:text-foreground pl-2'
        }`}
      >
        {item.value}
      </a>
      {item.children && item.children.length > 0 && (
        <div className="space-y-2 pl-4 border-l border-border/40 ml-2">
          {item.children.map((subItem) => (
            <TableOfContentsLink
              key={subItem.id}
              item={subItem}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const collectIds = (items: TocEntry[]): string[] => {
      const ids: string[] = [];
      items.forEach((item) => {
        if (item.id) {
          ids.push(item.id);
        }
        if (item.children) {
          ids.push(...collectIds(item.children));
        }
      });
      return ids;
    };

    const headings = collectIds(toc).filter(Boolean);
    if (headings.length === 0) return;

    const headerHeight = 56;
    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 10;

    const init = () => {
      type HeadingElement = { id: string; element: HTMLElement };
      const headingElements: HeadingElement[] = headings
        .map((id) => {
          const element = document.getElementById(id);
          return element ? { id, element } : null;
        })
        .filter((item): item is HeadingElement => item !== null);

      if (headingElements.length === 0) {
        retryCount++;
        if (retryCount < maxRetries) {
          timeoutId = setTimeout(init, 100);
        }
        return;
      }

      const observerOptions = {
        rootMargin: `-${headerHeight + 100}px 0px -70% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      };

      observer = new IntersectionObserver((entries) => {
        const viewportTop = headerHeight + 100;
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting && entry.target.id)
          .map((entry) => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
            intersectionRatio: entry.intersectionRatio,
          }))
          .sort((a, b) => {
            const distanceA = Math.abs(a.top - viewportTop);
            const distanceB = Math.abs(b.top - viewportTop);
            if (distanceA < distanceB) return -1;
            if (distanceA > distanceB) return 1;
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].id);
        }
      }, observerOptions);

      headingElements.forEach(({ element }) => {
        observer!.observe(element);
      });

      const updateActiveHeading = () => {
        const viewportTop = headerHeight + 100;
        
        interface BestMatch {
          id: string;
          distance: number;
        }
        let bestMatch: BestMatch | null = null;
        
        for (const heading of headingElements) {
          const { id, element } = heading;
          const rect = element.getBoundingClientRect();
          const top = rect.top;
          
          if (top <= viewportTop + 150) {
            const distance = top <= viewportTop 
              ? viewportTop - top 
              : (top - viewportTop) * 1.5;
            
            if (!bestMatch || distance < bestMatch.distance) {
              bestMatch = { id, distance };
            }
          }
        }

        if (bestMatch) {
          setActiveId(bestMatch.id);
        } else if (headingElements.length > 0) {
          if (window.scrollY < 100) {
            setActiveId(headingElements[0].id);
          }
        }
      };

      updateActiveHeading();

      let ticking = false;
      handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActiveHeading();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    };

    timeoutId = setTimeout(init, 0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
      if (handleScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [toc]);

  return (
    <nav className="space-y-3 text-base">
      {toc.map((item) => (
        <TableOfContentsLink key={item.id} item={item} activeId={activeId} />
      ))}
    </nav>
  );
}
