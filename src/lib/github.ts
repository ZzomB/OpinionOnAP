import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Article {
  slug: string;
  filename: string;
  title: string;
  date: string;
  category: string;
  originalLink: string;
  summaryMd: string;
  mainMd: string;
  analysisMd: string;
  footerMd: string;
}

const GITHUB_OWNER = 'ZzomB';
const GITHUB_REPO = 'newstransmitter';
const POSTS_DIR = '_posts';

// Local posts directory path (for local development, adjacent repo)
const LOCAL_POSTS_PATH = path.join(process.cwd(), '../../07 News transmitter/_posts');

// Helper to check if we should read files locally
function isLocalEnv(): boolean {
  try {
    return fs.existsSync(LOCAL_POSTS_PATH);
  } catch {
    return false;
  }
}

// Extract sections from markdown body
function extractSections(markdown: string) {
  const content = markdown.replace(/\r\n/g, '\n');

  const summaryIndex = content.indexOf('## 📌 핵심 요약');
  const mainContentIndex = content.indexOf('## 📖 주요 내용');
  const analysisIndex = content.indexOf('## 💡 시사점 및 분석');
  const footerIndex = content.lastIndexOf('---');

  let summaryMd = '';
  let mainMd = '';
  let analysisMd = '';
  let footerMd = '';

  // Extract Summary
  if (summaryIndex !== -1) {
    const end = mainContentIndex !== -1 ? mainContentIndex : (analysisIndex !== -1 ? analysisIndex : (footerIndex !== -1 ? footerIndex : content.length));
    summaryMd = content.slice(summaryIndex + '## 📌 핵심 요약'.length, end).trim();
  }

  // Extract Main Content
  if (mainContentIndex !== -1) {
    const end = analysisIndex !== -1 ? analysisIndex : (footerIndex !== -1 ? footerIndex : content.length);
    mainMd = content.slice(mainContentIndex + '## 📖 주요 내용'.length, end).trim();
  }

  // Extract Analysis
  if (analysisIndex !== -1) {
    const end = footerIndex !== -1 ? footerIndex : content.length;
    analysisMd = content.slice(analysisIndex + '## 💡 시사점 및 분석'.length, end).trim();
  }

  // Extract Footer
  if (footerIndex !== -1 && footerIndex > Math.max(summaryIndex, mainContentIndex, analysisIndex)) {
    footerMd = content.slice(footerIndex).trim();
  }

  // Clean up leading/trailing dividers
  summaryMd = summaryMd.replace(/^---|---$/g, '').trim();
  mainMd = mainMd.replace(/^---|---$/g, '').trim();
  analysisMd = analysisMd.replace(/^---|---$/g, '').trim();

  return { summaryMd, mainMd, analysisMd, footerMd };
}

// Fetch all articles
export async function getArticles(): Promise<Article[]> {
  const articles: Article[] = [];

  if (isLocalEnv()) {
    console.log('Reading articles from local directory...');
    try {
      const files = fs.readdirSync(LOCAL_POSTS_PATH);
      for (const filename of files) {
        if (filename.endsWith('.md') && filename !== '.gitkeep') {
          const filePath = path.join(LOCAL_POSTS_PATH, filename);
          const rawContent = fs.readFileSync(filePath, 'utf8');
          const slug = filename.replace('.md', '');
          
          const article = parseArticle(slug, filename, rawContent);
          if (article) articles.push(article);
        }
      }
    } catch (error) {
      console.error('Error reading local files:', error);
    }
  } else {
    console.log('Fetching articles from GitHub API...');
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpinionOnAP-NextJS',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_DIR}`,
        { headers, next: { revalidate: 3600 } } // Cache for 1 hour in Next.js
      );

      if (!response.ok) {
        throw new Error(`GitHub API request failed with status: ${response.status}`);
      }

      const files = await response.json();
      if (Array.isArray(files)) {
        for (const file of files) {
          if (file.name.endsWith('.md') && file.name !== '.gitkeep') {
            const rawResponse = await fetch(file.download_url, { headers });
            if (rawResponse.ok) {
              const rawContent = await rawResponse.text();
              const slug = file.name.replace('.md', '');
              const article = parseArticle(slug, file.name, rawContent);
              if (article) articles.push(article);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching articles from GitHub:', error);
    }
  }

  // Sort articles by date (newest first)
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

// Fetch single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const filename = `${slug}.md`;

  if (isLocalEnv()) {
    try {
      const filePath = path.join(LOCAL_POSTS_PATH, filename);
      if (fs.existsSync(filePath)) {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        return parseArticle(slug, filename, rawContent);
      }
    } catch (error) {
      console.error(`Error reading local article ${slug}:`, error);
    }
  } else {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpinionOnAP-NextJS',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${POSTS_DIR}/${filename}`;
      const response = await fetch(downloadUrl, { headers, next: { revalidate: 3600 } });
      if (response.ok) {
        const rawContent = await response.text();
        return parseArticle(slug, filename, rawContent);
      }
    } catch (error) {
      console.error(`Error fetching article ${slug} from GitHub:`, error);
    }
  }

  return null;
}

// Parse raw file content to Article object
function parseArticle(slug: string, filename: string, rawContent: string): Article | null {
  try {
    const { data, content } = matter(rawContent);
    const { summaryMd, mainMd, analysisMd, footerMd } = extractSections(content);

    // Default metadata values if YAML parsing fails
    const title = data.title || '제목 없음';
    const date = data.date || slug.slice(0, 10) || new Date().toISOString().slice(0, 10);
    
    // Extract category from filename (e.g. YYYY-MM-DD-ap-business-1)
    // or use front matter category
    let category = data.category || '기타';
    if (!data.category) {
      const parts = slug.split('-');
      if (parts.length >= 5) {
        category = parts[3].charAt(0).toUpperCase() + parts[3].slice(1); // capitalize category
      }
    }

    const originalLink = data.original_link || '';

    return {
      slug,
      filename,
      title,
      date,
      category,
      originalLink,
      summaryMd,
      mainMd,
      analysisMd,
      footerMd,
    };
  } catch (error) {
    console.error(`Error parsing article ${filename}:`, error);
    return null;
  }
}

// Fetch the latest articles from index.json (Zero API overhead caching strategy)
export async function getLatestArticles(): Promise<Article[]> {
  if (isLocalEnv()) {
    console.log('Reading latest articles from local index.json...');
    try {
      const indexPath = path.join(LOCAL_POSTS_PATH, 'index.json');
      if (fs.existsSync(indexPath)) {
        const rawContent = fs.readFileSync(indexPath, 'utf-8');
        const indexData = JSON.parse(rawContent);
        return indexData.map((item: any) => ({
          slug: item.slug,
          filename: `${item.slug}.md`,
          title: item.title,
          date: item.date,
          category: item.category,
          originalLink: item.originalLink || '',
          summaryMd: item.summaryMd || '',
          mainMd: '',
          analysisMd: '',
          footerMd: ''
        }));
      }
    } catch (error) {
      console.error('Error reading local index.json:', error);
    }
  }

  console.log('Fetching latest articles from GitHub index.json...');
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'OpinionOnAP-NextJS',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const indexUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${POSTS_DIR}/index.json`;
    const response = await fetch(indexUrl, { headers, next: { revalidate: 3600 } });
    if (response.ok) {
      const indexData = await response.json();
      return indexData.map((item: any) => ({
        slug: item.slug,
        filename: `${item.slug}.md`,
        title: item.title,
        date: item.date,
        category: item.category,
        originalLink: item.originalLink || '',
        summaryMd: item.summaryMd || '',
        mainMd: '',
        analysisMd: '',
        footerMd: ''
      }));
    }
  } catch (error) {
    console.error('Error fetching latest articles from GitHub:', error);
  }

  return [];
}
