import fs from "fs";
import path from "path";

export interface PageContent {
  pageNumber: number;
  text: string;
}

export class PdfLoaderService {
  async loadWithPages(filePath: string): Promise<PageContent[]> {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
      return this.extractPdfPages(filePath);
    }

    if (ext === ".txt") {
      const text = fs.readFileSync(filePath, "utf-8");
      return [{ pageNumber: 1, text }];
    }

    return [];
  }

  private async extractPdfPages(filePath: string): Promise<PageContent[]> {
    try {
      const { PDFParse } = require("pdf-parse");
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText({
        cellSeparator: " ",
        pageJoiner: "\n",
        lineEnforce: true,
      });

      const pages: PageContent[] = (result.pages || []).map((page: { num: number; text: string }) => ({
        pageNumber: page.num,
        text: page.text,
      }));

      if (pages.length === 0 && result.text) {
        pages.push({ pageNumber: 1, text: result.text });
      }

      await parser.destroy();
      return pages;
    } catch {
      return [];
    }
  }
}

export const pdfLoaderService = new PdfLoaderService();
