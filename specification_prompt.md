# 📋 뉴스 게시판 웹사이트 개발을 위한 상세 명세서 및 프롬프트

이 문서는 GitHub 저장소의 `_posts` 폴더에 축적된 마크다운 뉴스 데이터들을 소스로 활용하여, 공지글 게시판 스타일의 웹사이트를 제작하기 위한 **개발 명세서 겸 프롬프트**입니다. 

새 프로젝트를 생성한 후, AI 어시스턴트에게 본 문서 전체를 프롬프트로 제공하여 고품질의 웹 어플리케이션을 개발하도록 지시할 수 있습니다.

---

# 🤖 [새 프로젝트용 개발 프롬프트] 뉴스 게시판 웹사이트 구현 지침

## 1. 프로젝트 개요 (Overview)
- **목표:** GitHub Public 저장소에 자동 커밋되는 마크다운(`_posts`) 기사들을 동적으로 파싱하여, 세련되고 현대적인 블로그/게시판 웹사이트를 구축합니다.
- **데이터 소스 방식:** 빌드 타임 또는 런타임에 GitHub REST API 및 Raw 콘텐츠를 직접 Fetch하여 가공 및 렌더링합니다. 별도의 DB 구축 없이 파일 기반으로 운영됩니다.

---

## 2. 데이터 소스 명세 (Data Source Specification)

### A. 저장소 정보 및 API 엔드포인트
- **저장소 URL:** `https://github.com/ZzomB/newstransmitter.git`
- **대상 폴더 주소:** `https://github.com/ZzomB/newstransmitter/tree/main/_posts`
- **GitHub API 포스트 목록 조회 주소:**
  - `GET https://api.github.com/repos/ZzomB/newstransmitter/contents/_posts`
  - *Response 구조:* 파일 목록 배열이 반환되며, 각 객체는 `name`, `path`, `download_url` 등의 속성을 포함합니다.
- **Raw 파일 다운로드 주소 템플릿:**
  - `https://raw.githubusercontent.com/ZzomB/newstransmitter/main/_posts/{파일명}`

### B. 파일명 규칙 (Naming Convention)
- **규칙:** `YYYY-MM-DD-ap-{category}-{index}.md`
  - **`YYYY-MM-DD`:** 기사 등록 날짜 (예: `2026-07-12`)
  - **`ap`:** AP News 소스를 나타내는 고정 식별자
  - **`{category}`:** 소문자로 기록된 카테고리 (예: `world`, `business`)
  - **`{index}`:** 해당 날짜 및 카테고리 내의 뉴스 순번 (예: `1`, `2`, `3`)
  - *예시 파일명:* `2026-07-12-ap-business-1.md`

---

## 3. 마크다운 파일 구조 및 데이터 스키마 (File Schema)

기사는 **YAML Front Matter**와 **Markdown Body**의 결합 구조로 이루어져 있습니다. 아래의 규칙을 엄격히 분석하여 파싱해야 합니다.

### A. YAML Front Matter (메타데이터)
```yaml
---
title: "포스트 제목"
date: "YYYY-MM-DD"
category: "CategoryName" (예: World, Business 등 첫 글자가 대문자로 변환되어 들어있음)
original_link: "원본 뉴스 링크 URL"
---
```

### B. Markdown Body (본문 스키마)
본문은 다음 3개의 주요 마크다운 헤더 구조와 하단 출처 표기 섹션으로 고정되어 있습니다.

1. **`## 📌 핵심 요약`**
   - 3~4개의 글머리 기호(`*` 또는 `-`)로 구성된 뉴스 요약 팩트.
2. **`## 📖 주요 내용`**
   - 가공된 사건 서술 본문. 주로 여러 개의 소제목(`### 1. 소제목`) 형식으로 작성됨.
3. **`## 💡 시사점 및 분석`**
   - 전문적인 애널리스트 관점의 인사이트 분석. 주로 숫자가 매겨진 소제목(`### ① 소제목`) 형식으로 작성됨.
4. **`---` (구분선) 및 출처/디스클레이머**
   - `* **Source:** [AP News 원본 기사 읽기](원본링크)`
   - `* **Disclaimer:** 본 포스트는 AP 통신의 보도 사실을 바탕으로 작성자의 주관적인 분석과 인사이트를 더해 재구성한 독립적인 콘텐츠입니다.`

---

## 4. 웹사이트 주요 기능 요구사항 (Key Requirements)

### A. 게시판/블로그 레이아웃 및 뷰
1. **메인 페이지 (기사 목록):**
   - 최신순 정렬 (파일명 혹은 Front Matter의 `date` 기준 정렬).
   - 카드(Card) 레이아웃 혹은 리스트 레이아웃을 제공하고, 타이틀, 카테고리 태그, 요약 일부를 미리보기로 노출.
   - **카테고리 필터링:** 전체(All), World, Business 등으로 즉시 필터링 가능할 것.
2. **상세 페이지 (기사 보기):**
   - Front Matter에서 추출한 제목, 날짜, 카테고리, 원본 링크를 상단에 노출.
   - 마크다운 파서(예: `marked`, `react-markdown` 등)를 사용하여 본문을 스타일리시한 HTML로 렌더링.
   - 하단에 원본 AP 기사로 이동할 수 있는 외부 링크 버튼 제공.

### B. 디자인 시스템 및 UI/UX
- **테마:** 다크 모드(Dark Mode)를 기본적으로 지원하고 세련된 글래스모피즘(Glassmorphism) 및 부드러운 그라데이션 적용.
- **타이포그래피:** 가독성이 뛰어난 한국어/영어 최적화 폰트 지정 (예: Pretendard, Inter 등).
- **반응형 디자인:** 모바일, 태블릿, 데스크톱 화면에 맞추어 유연하게 크기가 변하는 반응형 레이아웃 구현.
- **애니메이션:** 스크롤 시 Fade-in, 카드 호버(Hover) 시의 스케일 업 및 섀도우 효과 등 미세 상호작용 제공.

### C. 데이터 Fetch 및 캐싱 (Performance)
- **GitHub API Rate Limit 대응:**
  - GitHub REST API는 인증 없이 요청 시 시간당 60회로 제한됩니다.
  - **대안 1 (추천 - 빌드 시 정적 생성):** Astro, Next.js (SSG mode) 등의 프레임워크를 사용하여 빌드 타임에 GitHub API를 호출해 정적 페이지(Static HTML)를 미리 빌드합니다.
  - **대안 2 (클라이언트 캐싱):** 런타임 클라이언트 페칭 시 `localStorage`를 활용하거나 React Query(TanStack Query) 등을 활용해 동일한 API 호출 빈도를 대폭 낮춥니다.
  - **대안 3 (토큰 사용):** 환경 변수에 `GITHUB_TOKEN`을 설정할 수 있는 아키텍처를 마련하여 빌드 서버나 API 라우트에서 활용할 수 있게 합니다.

---

## 5. 권장 기술 스택 및 초기 설정 제안

- **추천 프레임워크:** Vite + React (클라이언트 렌더링 중심) 또는 Next.js / Astro (정적 사이트 생성 SSG 최적화)
- **마크다운 파서:** `marked` 또는 `react-markdown` + `rehype-raw`
- **스타일 라이브러리:** CSS Modules, Tailwind CSS, 혹은 Vanilla CSS 중 택일

---

## 6. 개발 프롬프트 명령 지침
> **"이제 이 명세서를 토대로 새로운 웹 어플리케이션을 작성해주세요. 메인 화면, 상세 화면, 그리고 GitHub API 연동 모듈을 순서대로 개발하고, 완성도 높은 미려한 다크 모드 UI와 반응형 디자인을 완성해주세요."**
