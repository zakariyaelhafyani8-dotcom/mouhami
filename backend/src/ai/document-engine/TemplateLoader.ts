import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.resolve(__dirname, "../../../legal_templates");

interface TemplateField {
  key: string;
  label: string;
  required: boolean;
}

interface TemplateInfo {
  type: string;
  nameAr: string;
  description: string;
  fields: TemplateField[];
}

export class TemplateLoader {
  loadInfo(templateType: string): TemplateInfo | null {
    const jsonPath = path.resolve(
      __dirname,
      "../../../document_templates",
      `${templateType}.json`
    );
    if (!fs.existsSync(jsonPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch {
      return null;
    }
  }

  loadTemplate(templateType: string): string | null {
    // 1. Try reference.docs (nouveau format officiel)
    const refPath = path.join(TEMPLATES_DIR, templateType, "reference.docs");
    if (fs.existsSync(refPath)) {
      try {
        return fs.readFileSync(refPath, "utf-8");
      } catch {
        return null;
      }
    }
    // 2. Fallback: template.md (ancien format)
    const mdPath = path.join(TEMPLATES_DIR, templateType, "template.md");
    if (!fs.existsSync(mdPath)) return null;
    try {
      return fs.readFileSync(mdPath, "utf-8");
    } catch {
      return null;
    }
  }

  loadDocxTemplate(templateType: string): Buffer | null {
    const docxPath = path.join(TEMPLATES_DIR, templateType, "reference.docx");
    if (!fs.existsSync(docxPath)) return null;
    try {
      return fs.readFileSync(docxPath);
    } catch {
      return null;
    }
  }

  fillTemplate(
    template: string,
    values: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      result = result.split(placeholder).join(value || "");
    }
    return result;
  }

  getTemplateDir(templateType: string): string {
    return path.join(TEMPLATES_DIR, templateType);
  }

  templateExists(templateType: string): boolean {
    const refPath = path.join(TEMPLATES_DIR, templateType, "reference.docs");
    if (fs.existsSync(refPath)) return true;
    const mdPath = path.join(TEMPLATES_DIR, templateType, "template.md");
    if (fs.existsSync(mdPath)) return true;
    const docxPath = path.join(TEMPLATES_DIR, templateType, "reference.docx");
    return fs.existsSync(docxPath);
  }

  hasDocxTemplate(templateType: string): boolean {
    const docxPath = path.join(TEMPLATES_DIR, templateType, "reference.docx");
    return fs.existsSync(docxPath);
  }
}

export const templateLoader = new TemplateLoader();
