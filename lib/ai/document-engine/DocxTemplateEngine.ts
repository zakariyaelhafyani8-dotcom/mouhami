import AdmZip from "adm-zip";
import path from "path";

const TEMPLATES_DIR = path.resolve(process.cwd(), "legal_templates");

interface WtMatch {
  fullMatch: string;
  index: number;
  length: number;
  text: string;
}

export class DocxTemplateEngine {
  canHandle(templateType: string): boolean {
    const docxPath = path.join(TEMPLATES_DIR, templateType, "reference.docx");
    const fs = require("fs");
    return fs.existsSync(docxPath);
  }

  async buildFromDocx(
    templateType: string,
    values: Record<string, string>
  ): Promise<Buffer> {
    const docxPath = path.join(TEMPLATES_DIR, templateType, "reference.docx");

    const zip = new AdmZip(docxPath);

    for (const entryName of ["word/document.xml", "word/header1.xml", "word/footer1.xml"]) {
      const entry = zip.getEntry(entryName);
      if (!entry) continue;

      let xml = entry.getData().toString("utf-8");

      xml = this.mergeSplitPlaceholders(xml, Object.keys(values));
      xml = this.replacePlaceholders(xml, values);

      zip.updateFile(entryName, Buffer.from(xml, "utf-8"));
    }

    return zip.toBuffer();
  }

  private mergeSplitPlaceholders(xml: string, knownKeys: string[]): string {
    const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const wtMatches: WtMatch[] = [];
    let m: RegExpExecArray | null;

    while ((m = wtRegex.exec(xml)) !== null) {
      wtMatches.push({
        fullMatch: m[0],
        index: m.index,
        length: m[0].length,
        text: m[1],
      });
    }

    const keySet = new Set(knownKeys);
    let offset = 0;

    for (let i = 0; i < wtMatches.length; i++) {
      const trimmed = wtMatches[i].text.trim();
      if (trimmed !== "{{") continue;

      const keyText = i + 1 < wtMatches.length ? wtMatches[i + 1].text.trim() : "";
      const closeText = i + 2 < wtMatches.length ? wtMatches[i + 2].text.trim() : "";

      if (!keySet.has(keyText)) continue;

      const isOpenBrace = true;
      const isCloseBrace = closeText === "}}" || closeText === "} }";
      if (!isOpenBrace || !isCloseBrace) continue;

      const placeholderText = `{{${keyText}}}`;
      const openRun = wtMatches[i];
      const closeRun = wtMatches[i + 2];

      const insertPos = openRun.index + offset;
      const insertLen = openRun.length;

      const replacement = openRun.fullMatch.replace(
        /<w:t[^>]*>[^<]*<\/w:t>/,
        `<w:t>${this.escapeXml(placeholderText)}</w:t>`
      );

      xml =
        xml.substring(0, insertPos) +
        replacement +
        xml.substring(insertPos + insertLen);

      offset += replacement.length - insertLen;

      const keyRun = wtMatches[i + 1];
      const keyPos = keyRun.index + offset;
      xml =
        xml.substring(0, keyPos) +
        xml.substring(keyPos + keyRun.length);
      offset -= keyRun.length;

      const closePos = closeRun.index + offset;
      xml =
        xml.substring(0, closePos) +
        xml.substring(closePos + closeRun.length);
      offset -= closeRun.length;

      i += 2;
    }

    return xml;
  }

  private replacePlaceholders(xml: string, values: Record<string, string>): string {
    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      if (xml.includes(placeholder)) {
        const escaped = this.escapeXml(value || "");
        xml = xml.split(placeholder).join(escaped);
      }
    }
    return xml;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  getTemplatePath(templateType: string): string {
    return path.join(TEMPLATES_DIR, templateType, "reference.docx");
  }
}

export const docxTemplateEngine = new DocxTemplateEngine();
