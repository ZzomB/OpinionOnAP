# Task List - Header Sync, English Conversion, & Sitemap Integration

- [x] Header Integrations (Root & Subproject)
  - [x] Update `GlobalHeader.tsx` in `01 root_WeDoDare` to add "피드 (Feed)" column and mobile menu item
  - [x] Update `GlobalHeader.tsx` in `01 OpinionForAP` to match the exact same menu structure
- [x] UI Refinements
  - [x] Remove `CheckCircle2` checkmarks from `ArticleList.tsx` for read articles (keep only text color change)
- [x] English Conversion & Multilingual Parser
  - [x] Update `pipeline.py` prompts to instruct Gemini to write in natural, native-level English
  - [x] Update `pipeline.py` headings in markdown generation to English equivalents
  - [x] Update `extract_summary` helper in `pipeline.py` to match English headings
  - [x] Update `extractSections` in `src/lib/github.ts` to parse both English and Korean headings (backward compatibility)
  - [x] Update `parseToc` and page rendering in `src/app/posts/[slug]/page.tsx` to dynamically detect language and translate labels accordingly
- [x] SEO & Sitemap Alignment
  - [x] Add `/feed/OpinionOnAP/sitemap.xml` to sitemap index in `01 root_WeDoDare/src/app/sitemap.xml/route.ts`
- [x] Verification
  - [x] Build both projects and verify sitemaps, headers, and UI render correctly

