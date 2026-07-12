'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function GlobalHeader() {
  const currentPath = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const navItems = [
    { label: '홈', href: '/' },
    { label: '블로그', href: '/blog' },
  ];

  const functionItems = [
    { label: '구글드라이브 썸네일 변환 (G2Thumbnail)', href: '/function/G2Thumbnail' },
    { label: '이미지 랜덤 제시 (ImageRandomPresentation)', href: '/function/ImageRandomPresentation' },
    { label: '프롬프트 저장소 (PromptArchive)', href: '/function/PromptArchive' },
  ];

  const isFunctionActive = currentPath.startsWith('/function');

  // Check if a path is active.
  // Note: inside this app, basePath is /feed/OpinionOnAP, so "/" is our feed home page.
  // External paths like "/blog" or the main platform "/" will be handled as standard <a> links or absolute links in production.
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b border-border bg-background/80 backdrop-blur-md select-none transition-colors duration-300">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
        
        {/* 로고 영역 */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-90 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img 
            src="/feed/OpinionOnAP/logo-light.png?v=2" 
            alt="WeDoDare Logo" 
            width={24} 
            height={24} 
            className="rounded-md object-contain transition-all duration-300 filter dark:invert"
          />
          <span className="tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            WeDoDare Feed
          </span>
        </Link>

        {/* 데스크톱 내비게이션 메뉴 */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          <Link
            href="/"
            className={`text-sm font-semibold transition-all hover:text-primary ${
              isLinkActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            피드 홈
          </Link>

          <a
            href="/blog"
            className="text-sm font-semibold transition-all hover:text-primary text-muted-foreground"
          >
            블로그
          </a>
          
          {/* 기능 드롭다운 (Nike-Style full-width menu) */}
          <div className="group h-full flex items-center">
            <button 
              className={`flex items-center gap-1 text-sm font-semibold transition-all hover:text-primary cursor-pointer h-full ${
                isFunctionActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              기능
              <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            {/* 배경 어둡게 처리하는 오버레이 (Backdrop Blur) */}
            <div className="fixed inset-0 top-14 bg-black/25 backdrop-blur-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-30" />

            {/* 드롭다운 콘텐츠 영역 */}
            <div className="absolute top-14 left-0 w-full bg-background border-b border-border shadow-2xl opacity-0 translate-y-[-8px] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-40">
              <div className="mx-auto max-w-3xl px-8 py-10 grid grid-cols-2 gap-8">
                
                {/* Column 1: 웹 기능 */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                    웹 기능 (Functions)
                  </h4>
                  <ul className="space-y-3">
                    {functionItems.map((subItem) => {
                      return (
                        <li key={subItem.href}>
                          <a
                            href={subItem.href}
                            className="text-sm font-semibold transition-all hover:text-primary block text-foreground"
                          >
                            {subItem.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Column 2: 플랫폼 정보 */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                    플랫폼 (Platform)
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="/"
                        className="text-sm font-semibold transition-all hover:text-primary block text-foreground"
                      >
                        WeDoDare 홈
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blog"
                        className="text-sm font-semibold transition-all hover:text-primary block text-foreground"
                      >
                        WeDoDare 기술 블로그
                      </a>
                    </li>
                    <li>
                      <Link
                        href="/"
                        className="text-sm font-semibold transition-all hover:text-primary block text-primary"
                      >
                        피드 (OpinionOnAP)
                      </Link>
                    </li>
                    <li>
                      <a
                        href="https://github.com/ZzomB"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold transition-all hover:text-primary block text-foreground"
                      >
                        GitHub 저장소
                      </a>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </nav>

        {/* 오른쪽 유틸리티 영역 */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
        </div>

        {/* 모바일 햄버거 버튼 및 테마 토글 */}
        <div className="flex md:hidden items-center gap-3 z-50">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-foreground hover:bg-muted focus:outline-none cursor-pointer"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* 모바일 메뉴 모달/오버레이 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-background z-40 border-t border-border flex flex-col p-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 border-b border-border/50 transition-colors ${
                isLinkActive('/') ? 'text-primary' : 'text-foreground'
              }`}
            >
              피드 홈
            </Link>

            <a
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b border-border/50 transition-colors text-foreground"
            >
              블로그
            </a>

            {/* 모바일 기능 드롭다운 (아코디언) */}
            <div className="flex flex-col">
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className={`flex items-center justify-between text-base font-semibold py-2 border-b border-border/50 transition-colors text-left cursor-pointer ${
                  isFunctionActive ? 'text-primary' : 'text-foreground'
                }`}
              >
                <span>기능</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileDropdownOpen && (
                <div className="pl-4 py-2 flex flex-col gap-2 bg-muted/30 rounded-lg mt-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1 px-1">웹 기능</div>
                  {functionItems.map((subItem) => {
                    return (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm font-medium py-1 transition-colors pl-2 text-muted-foreground hover:text-primary"
                      >
                        {subItem.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* 모바일 플랫폼 홈 바로가기 */}
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b border-border/50 transition-colors text-foreground"
            >
              WeDoDare 홈
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
