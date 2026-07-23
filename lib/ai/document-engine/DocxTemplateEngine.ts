import AdmZip from "adm-zip";
import path from "path";

const TEMPLATES_DIR = path.resolve(process.cwd(), "legal_templates");

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

      // Passe 1: normaliser les placeholders splittés sur plusieurs <w:r>
      // Format: <w:r>...<w:t>{{</w:t></w:r>...<w:t>NAME</w:t>...<w:t>}}</w:t></w:r>
      const knownKeys = Object.keys(values);
      const keysPattern = knownKeys.join("|");
      const splitRegex = new RegExp(
        "(<w:r\\b[^>]*>(?:\\s*<w:rPr>[\\s\\S]*?<\\/w:rPr>\\s*)?<w:t[^>]*>\\{\\{<\\/w:t>\\s*<\\/w>r>\\s*)" +
        "<w:r\\b[^>]*>(?:\\s*<w:rPr>[\\s\\S]*?<\\/w:rPr>\\s*)?<w:t[^>]*>(" + keysPattern + ")<\\/w:t>\\s*<\\/w:r>\\s*" +
        "(<w:r\\b[^>]*>(?:\\s*<w:rPr>[\\s\\S]*?<\\/w:rPr>\\s*)?<w:t[^>]*>\\}\\}<\\/w:t>\\s*<\\/w:r>)",
        "g"
      );

      xml = xml.replace(splitRegex, (_, openRun, name, closeRun) => {
        return openRun.replace("<w:t>{{</w:t>", `<w:t>{{${name}}}</w:t>`);
      });

      // Passe 2: remplacer les {{PLACEHOLDER}} par les valeurs
      for (const [key, value] of Object.entries(values)) {
        const placeholder = `{{${key}}}`;
        if (xml.includes(placeholder)) {
          const escaped = this.escapeXml(value || "");
          xml = xml.split(placeholder).join(escaped);
        }
      }

      zip.updateFile(entryName, Buffer.from(xml, "utf-8"));
    }

    return zip.toBuffer();
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
