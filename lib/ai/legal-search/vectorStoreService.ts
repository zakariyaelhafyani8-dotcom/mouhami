import fs from "fs";
import path from "path";

interface ChunkEntry {
  id: string;
  text: string;
  documentName: string;
  pageNumber: number;
  chunkIndex: number;
}

interface InvertedIndex {
  [word: string]: string[];
}

const STORAGE_DIR = path.resolve(process.cwd(), "ai_data/legal_search");

const STOP_WORDS = new Set([
  "ما", "هو", "هي", "هم", "هن", "انا", "نحن", "انتم",
  "هل", "ماذا", "كيف", "لماذا", "اين", "متى", "كم",
  "في", "من", "الى", "على", "عن", "مع", "بين", "لدى", "حتى", "دون", "غير",
  "و", "ف", "ثم", "او", "لكن", "لان", "حيث", "بينما",
  "قد", "ان", "لن", "لم", "لا",
  "هذا", "هذه", "ذلك", "تلك",
  "كان", "كانت", "ليس",
  "كل", "بعض", "نعم",
  "له", "لها", "لهم", "علي", "عليه", "عليها",
  "اذا", "اي",
  "اعطيني", "اعطنا", "اريد", "نريد", "ابحث", "بحث", "ممكن",
]);

export interface SearchResult {
  text: string;
  documentName: string;
  pageNumber: number;
  score: number;
}

export class VectorStoreService {
  private collectionPath: string;
  private indexPath: string;

  constructor() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    this.collectionPath = path.join(STORAGE_DIR, "library.json");
    this.indexPath = path.join(STORAGE_DIR, "index.json");
  }

  addChunk(
    id: string,
    text: string,
    documentName: string,
    pageNumber: number,
    chunkIndex: number
  ): void {
    const entries = this.loadAll();
    const existingIndex = entries.findIndex((e) => e.id === id);
    const entry: ChunkEntry = {
      id,
      text,
      documentName,
      pageNumber,
      chunkIndex,
    };

    if (existingIndex >= 0) {
      const oldText = entries[existingIndex].text;
      this.removeFromIndex(oldText, id);
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    this.addToIndex(text, id);
    this.saveAll(entries);
    this.saveIndex();
  }

  search(query: string, topK: number = 5): SearchResult[] {
    const queryWords = this.tokenize(query);
    if (queryWords.length === 0) return [];

    const index = this.loadIndex();
    const entries = this.loadAll();
    const docCount = entries.length;
    const entryMap = new Map(entries.map((e) => [e.id, e]));

    const rawScores: Map<string, number> = new Map();

    for (const word of queryWords) {
      const variants = this.expandWord(word);
      let maxIdf = 0;
      const matchedChunks = new Map<string, number>();

      for (const v of variants) {
        const posting = index[v] || [];
        const idf = docCount > 0
          ? Math.log((docCount + 1) / (posting.length + 1)) + 1
          : 1;
        if (idf > maxIdf) maxIdf = idf;

        for (const chunkId of posting) {
          const tf = this.termFrequency(
            entryMap.get(chunkId)?.text || "",
            word
          );
          if (tf === 0) continue;
          const existing = matchedChunks.get(chunkId) || 0;
          if (idf * tf > existing) {
            matchedChunks.set(chunkId, idf * tf);
          }
        }
      }

      for (const [chunkId, score] of matchedChunks) {
        rawScores.set(chunkId, (rawScores.get(chunkId) || 0) + score);
      }
    }

    if (rawScores.size === 0) return [];

    const sorted = Array.from(rawScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    const maxIdf = Math.log((docCount + 1) / 1) + 1;
    const maxPossible = queryWords.length * maxIdf * 10;

    return sorted.map(([id, score]) => {
      const entry = entryMap.get(id)!;
      return {
        text: entry.text,
        documentName: entry.documentName,
        pageNumber: entry.pageNumber,
        score: maxPossible > 0 ? score / maxPossible : 0,
      };
    });
  }

  private termFrequency(text: string, word: string): number {
    const normalized = this.normalizeArabic(text.toLowerCase());
    const variants = this.expandWord(word);
    let count = 0;
    const maxTf = 20;
    for (const v of variants) {
      let pos = 0;
      while ((pos = normalized.indexOf(v, pos)) !== -1 && count < maxTf) {
        count++;
        pos += v.length;
      }
    }
    return count > 0 ? 1 + Math.log2(count) : 0;
  }

  count(): number {
    return this.loadAll().length;
  }

  clear(): void {
    if (fs.existsSync(this.collectionPath)) fs.unlinkSync(this.collectionPath);
    if (fs.existsSync(this.indexPath)) fs.unlinkSync(this.indexPath);
  }

  getIndexedDocuments(): string[] {
    const entries = this.loadAll();
    const docs = new Set(entries.map((e) => e.documentName));
    return Array.from(docs);
  }

  getAllChunks(): ChunkEntry[] {
    return this.loadAll();
  }

  removeChunk(id: string): void {
    const entries = this.loadAll();
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      this.removeFromIndex(entry.text, id);
      this.saveIndex();
    }
    this.saveAll(entries.filter((e) => e.id !== id));
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\w\s\u0600-\u06FF]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && w.length < 100)
      .filter((w) => !STOP_WORDS.has(w))
      .map((w) => this.normalizeArabic(w));
  }

  private expandWord(word: string): string[] {
    const variants = [word];
    if (word.startsWith("ال") && word.length > 4) {
      variants.push(word.slice(2));
    } else if (!word.startsWith("ال") && word.length > 2) {
      variants.push("ال" + word);
    }
    return [...new Set(variants)];
  }

  private normalizeArabic(text: string): string {
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ـ/g, "")
      .split(/\s+/)
      .map((w) => {
        const chars = [...w];
        for (let i = 2; i < chars.length - 1; i++) {
          if (chars[i] === "ا" && chars[i + 1] === "ل") {
            chars[i] = "ل";
            chars[i + 1] = "ا";
          }
        }
        return chars.join("");
      })
      .join(" ");
  }

  private addToIndex(text: string, chunkId: string): void {
    const index = this.loadIndex();
    const words = new Set(this.tokenize(text));
    for (const word of words) {
      if (!index[word]) index[word] = [];
      if (!index[word].includes(chunkId)) {
        index[word].push(chunkId);
      }
    }
    this.saveIndex(index);
  }

  private removeFromIndex(text: string, chunkId: string): void {
    const index = this.loadIndex();
    const words = new Set(this.tokenize(text));
    for (const word of words) {
      if (index[word]) {
        index[word] = index[word].filter((id) => id !== chunkId);
        if (index[word].length === 0) delete index[word];
      }
    }
    this.saveIndex(index);
  }

  private loadIndex(): InvertedIndex {
    if (!fs.existsSync(this.indexPath)) return {};
    try {
      return JSON.parse(fs.readFileSync(this.indexPath, "utf-8"));
    } catch {
      return {};
    }
  }

  private saveIndex(index?: InvertedIndex): void {
    if (!index) index = this.loadIndex();
    fs.writeFileSync(this.indexPath, JSON.stringify(index));
  }

  private loadAll(): ChunkEntry[] {
    if (!fs.existsSync(this.collectionPath)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.collectionPath, "utf-8"));
    } catch {
      return [];
    }
  }

  private saveAll(entries: ChunkEntry[]): void {
    fs.writeFileSync(this.collectionPath, JSON.stringify(entries, null, 2));
  }
}

export const vectorStoreService = new VectorStoreService();
