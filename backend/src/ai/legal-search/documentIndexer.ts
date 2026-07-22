import fs from "fs";
import path from "path";
import { vectorStoreService } from "./vectorStoreService";
import { pdfLoaderService } from "./pdfLoaderService";

const LEGAL_LIBRARY_DIR = path.resolve(__dirname, "../../../legal_library");
const META_DIR = path.resolve(__dirname, "../../../ai_data/legal_search");
const META_FILE = path.join(META_DIR, "meta.json");
const MAX_CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

export class DocumentIndexer {
  private meta: { lastIndexedTime: number; indexedFiles: Record<string, number> };

  constructor() {
    this.meta = this.loadMeta();
  }

  private metaFilePath(): string {
    if (!fs.existsSync(META_DIR)) {
      fs.mkdirSync(META_DIR, { recursive: true });
    }
    return META_FILE;
  }

  private loadMeta(): { lastIndexedTime: number; indexedFiles: Record<string, number> } {
    try {
      const filePath = this.metaFilePath();
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch {
      // ignore
    }
    return { lastIndexedTime: 0, indexedFiles: {} };
  }

  private saveMeta(): void {
    fs.writeFileSync(this.metaFilePath(), JSON.stringify(this.meta, null, 2));
  }

  getNonEmptyPdfFiles(): string[] {
    if (!fs.existsSync(LEGAL_LIBRARY_DIR)) return [];
    return fs
      .readdirSync(LEGAL_LIBRARY_DIR)
      .filter((f) => /\.(pdf|txt)$/i.test(f))
      .filter((f) => fs.statSync(path.join(LEGAL_LIBRARY_DIR, f)).size > 0);
  }

  needsReindexing(): boolean {
    const files = this.getNonEmptyPdfFiles();
    if (files.length === 0) return false;

    if (vectorStoreService.count() === 0) return true;

    const indexedDocs = vectorStoreService.getIndexedDocuments();

    for (const file of files) {
      const inStore = indexedDocs.includes(file);
      if (!inStore) return true;

      const mtime = fs.statSync(path.join(LEGAL_LIBRARY_DIR, file)).mtimeMs;
      const lastIndexed = this.meta.indexedFiles[file] || 0;

      if (lastIndexed === 0) continue;

      if (mtime > lastIndexed) return true;
    }

    return false;
  }

  async indexAll(): Promise<{ indexed: number; errors: number }> {
    const files = this.getNonEmptyPdfFiles();
    if (files.length === 0) return { indexed: 0, errors: 0 };

    let indexed = 0;
    let errors = 0;

    for (const file of files) {
      const filePath = path.join(LEGAL_LIBRARY_DIR, file);
      const mtime = fs.statSync(filePath).mtimeMs;
      const lastIndexed = this.meta.indexedFiles[file] || 0;

      const indexedDocs = vectorStoreService.getIndexedDocuments();
      const alreadyInStore = indexedDocs.includes(file);

      if (alreadyInStore && (lastIndexed === 0 || mtime <= lastIndexed)) {
        continue;
      }

      const existingChunks = vectorStoreService.count();
      if (existingChunks > 0) {
        const chunksToRemove = vectorStoreService
          .getAllChunks()
          .filter((c) => c.documentName === file)
          .map((c) => c.id);
        for (const id of chunksToRemove) {
          vectorStoreService.removeChunk(id);
        }
      }

      try {
        const pages = await pdfLoaderService.loadWithPages(filePath);

        for (const page of pages) {
          const chunks = this.chunkText(page.text);
          for (let i = 0; i < chunks.length; i++) {
            const chunkId = `${file}_p${page.pageNumber}_c${i}`;
            vectorStoreService.addChunk(
              chunkId,
              chunks[i],
              file,
              page.pageNumber,
              i
            );
          }
        }
        this.meta.indexedFiles[file] = Date.now();
        this.saveMeta();
        indexed++;
      } catch {
        errors++;
      }
    }

    this.meta.lastIndexedTime = Date.now();
    this.saveMeta();
    return { indexed, errors };
  }

  private chunkText(text: string): string[] {
    if (!text.trim()) return [];

    const articleMarkers = /المادة\s+\d+|الفصل\s+\d+|الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|\d+)|القسم\s+(الأول|الثاني|الثالث|الرابع|\d+)/g;

    const sections: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = articleMarkers.exec(text)) !== null) {
      if (match.index > lastIndex) {
        sections.push(text.substring(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }

    if (lastIndex < text.length) {
      sections.push(text.substring(lastIndex).trim());
    }

    if (sections.length === 0) {
      sections.push(text.trim());
    }

    const chunks: string[] = [];
    let current = "";

    for (const section of sections) {
      if ((current + "\n" + section).length > MAX_CHUNK_SIZE && current) {
        chunks.push(current.trim());
        const overlapStart = Math.max(0, current.length - CHUNK_OVERLAP);
        current = current.substring(overlapStart) + "\n" + section;
      } else {
        current += (current ? "\n" : "") + section;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks;
  }

  getLibraryDir(): string {
    return LEGAL_LIBRARY_DIR;
  }

  getIndexedDocumentCount(): number {
    return vectorStoreService.getIndexedDocuments().length;
  }

  getChunkCount(): number {
    return vectorStoreService.count();
  }
}

export const documentIndexer = new DocumentIndexer();
