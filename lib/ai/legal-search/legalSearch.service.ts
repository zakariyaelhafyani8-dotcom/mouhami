import { vectorStoreService, type SearchResult } from "@/lib/ai/legal-search/vectorStoreService";
import { promptBuilder } from "@/lib/ai/legal-search/promptBuilder";
import { ollamaClient } from "@/lib/ai/utils/ollamaClient";

export interface ArticleRef {
  number: string;
  text: string;
  chapter: string;
  section: string;
  subsection: string;
}

export interface SourceOutput {
  documentName: string;
  pageNumber: number;
  text: string;
  articles: ArticleRef[];
}

export class LegalSearchService {
  searchSources(question: string): {
    sources: SourceOutput[];
    fullPrompt: string;
  } {
    const results = vectorStoreService.search(question, 5);

    if (results.length === 0) {
      return { sources: [], fullPrompt: "" };
    }

    const merged = LegalSearchService.mergeChunksByPage(results);

    const sources = merged.map((r) => ({
      documentName: r.documentName,
      pageNumber: r.pageNumber,
      text: r.text,
      articles: LegalSearchService.parseArticles(r.text),
    }));

    const systemPrompt = promptBuilder.buildSystemPrompt();
    const userPrompt = promptBuilder.buildUserPrompt(question, merged);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    return { sources, fullPrompt };
  }

  async generateAnswer(fullPrompt: string): Promise<string> {
    try {
      return await ollamaClient.generate(fullPrompt, {
        temperature: 0.1,
      });
    } catch {
      return "";
    }
  }

  private static parseArticles(text: string): ArticleRef[] {
    const headerRegex = /^(الكتاب\s+\S[\s\S]{0,100}?)$|^(القسم\s+\S[\s\S]{0,100}?)$|^(الباب\s+\S[\s\S]{0,100}?)$|^(الفرع\s+\S[\s\S]{0,100}?)$/gm;
    const articleRegex = /^(المادة\s+(\d+[\w\-]*))\s*([\s\S]*?)(?=^(?:المادة\s+\d+|الكتاب\s+|القسم\s+|الباب\s+|الفرع\s+|\-\s*\d+\s*\-)\s*$|^(?:مادة\s+|فصل\s+))/gm;

    let chapter = "";
    let section = "";
    let subsection = "";
    const articles: ArticleRef[] = [];

    const lines = text.split("\n");
    let currentArticle: { number: string; text: string[] } | null = null;

    const flushArticle = () => {
      if (currentArticle) {
        const articleText = currentArticle.text
          .join(" ")
          .replace(/\s+/g, " ")
          .replace(/\s*-\s*\d+\s*-\s*/g, "")
          .trim();
        if (articleText.length > 5) {
          articles.push({
            number: currentArticle.number,
            text: articleText,
            chapter,
            section,
            subsection,
          });
        }
        currentArticle = null;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const bookMatch = trimmed.match(/^الكتاب\s+(.+)/);
      if (bookMatch) { flushArticle(); section = `الكتاب ${bookMatch[1].trim()}`; continue; }

      const secMatch = trimmed.match(/^القسم\s+(.+)/);
      if (secMatch) { flushArticle(); section = `القسم ${secMatch[1].trim()}`; continue; }

      const chapMatch = trimmed.match(/^الباب\s+(.+)/);
      if (chapMatch) { flushArticle(); chapter = `الباب ${chapMatch[1].trim()}`; continue; }

      const subMatch = trimmed.match(/^الفرع\s+(.+)/);
      if (subMatch) { flushArticle(); subsection = `الفرع ${subMatch[1].trim()}`; continue; }

      const isArticle = /^(?:المادة|الفصل)\s+(\d+[\w\-]*)\s*/.test(trimmed);
      if (isArticle) {
        const numMatch = trimmed.match(/^(?:المادة|الفصل)\s+(\d+[\w\-]*)/);
        if (!numMatch) continue;
        const rest = trimmed.slice(numMatch[0].length).trim();
        if (rest && /^(من|رقم|المادة|الفصل)/.test(rest)) {
          if (currentArticle) currentArticle.text.push(trimmed);
          continue;
        }
        flushArticle();
        currentArticle = { number: numMatch[1], text: rest ? [rest] : [] };
        continue;
      }

      if (currentArticle && !trimmed.match(/^-\s*\d+\s*-$/)) {
        currentArticle.text.push(trimmed);
      }
    }

    flushArticle();
    return articles;
  }

  private static mergeChunksByPage(results: SearchResult[]): SearchResult[] {
    const pageMap = new Map<string, SearchResult>();

    for (const r of results) {
      const key = `${r.documentName}_p${r.pageNumber}`;
      const existing = pageMap.get(key);
      if (existing) {
        if (existing.text.length < r.text.length) {
          pageMap.set(key, r);
        }
      } else {
        pageMap.set(key, r);
      }
    }

    return Array.from(pageMap.values());
  }
}

export const legalSearchService = new LegalSearchService();
