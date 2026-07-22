import { templateLoader } from "./TemplateLoader";
import { ollamaDocumentService } from "./OllamaDocumentService";
import { docxBuilder } from "./DocxBuilder";
import { docxTemplateEngine } from "./DocxTemplateEngine";

interface GeneratedDocument {
  docxBase64: string;
  fileName: string;
  preview: string;
}

const FIELD_MAP: Record<string, string> = {
  plaintiffName: "PLAINTIFF_NAME",
  cin: "PLAINTIFF_CIN",
  plaintiffCIN: "PLAINTIFF_CIN",
  plaintiffProfession: "PLAINTIFF_PROFESSION",
  plaintiffAddress: "PLAINTIFF_ADDRESS",
  clientName: "PLAINTIFF_NAME",
  clientAddress: "PLAINTIFF_ADDRESS",
  defendantName: "DEFENDANT_NAME",
  defendantCapacity: "DEFENDANT_CAPACITY",
  defendantAddress: "DEFENDANT_ADDRESS",
  lawyerName: "LAWYER_NAME",
  lawyerBar: "LAWYER_BAR",
  plaintiffPhone: "PLAINTIFF_PHONE",
  defendantPhone: "DEFENDANT_PHONE",
  lawyerLicense: "LAWYER_LICENSE",
  tribunal: "TRIBUNAL",
  appealCourt: "APPEAL_COURT",
  subject: "SUBJECT",
  date: "DATE",
  attachments: "ATTACHMENTS",
  legalArguments: "LEGAL_ARGUMENTS",
};

const LLM_PRODUCED = new Set(["facts", "requests", "conclusion", "legalArguments"]);

const STATIC_DEFAULTS: Record<string, string> = {
  PLAINTIFF_PROFESSION: "..........",
  PLAINTIFF_ADDRESS: "..........",
  LAWYER_NAME: "..........",
  LAWYER_BAR: "..........",
  DEFENDANT_CAPACITY: "..........",
  DEFENDANT_ADDRESS: "..........",
  DEFENDANT_PHONE: "..........",
  PLAINTIFF_PHONE: "..........",
  LAWYER_LICENSE: "..........",
  ATTACHMENTS: "..........",
  DATE: new Date().toLocaleDateString("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

export class DocumentGenerator {
  async generate(
    templateType: string,
    fields: Record<string, string>
  ): Promise<GeneratedDocument> {
    let llmParts = { facts: "", requests: "", conclusion: "", legalArguments: "" };
    try {
      llmParts = await ollamaDocumentService.generateDocumentParts(
        templateType,
        fields
      );
    } catch {
      // LLM indisponible → valeurs brutes du formulaire utilisées
    }

    const templateVars: Record<string, string> = {};

    for (const [incomingKey, value] of Object.entries(fields)) {
      const mappedKey = FIELD_MAP[incomingKey] || incomingKey.toUpperCase();
      templateVars[mappedKey] = value || "";
    }

    for (const [key, defaultValue] of Object.entries(STATIC_DEFAULTS)) {
      if (!templateVars[key]) {
        templateVars[key] = defaultValue;
      }
    }

    templateVars["FACTS"] = llmParts.facts || fields.facts || "..........";
    templateVars["REQUESTS"] = llmParts.requests || fields.requests || "..........";
    templateVars["CONCLUSION"] = llmParts.conclusion || "..........";
    templateVars["LEGAL_ARGUMENTS"] = llmParts.legalArguments || fields.legalArguments || "..........";

    let docxBuffer: Buffer;

    if (templateLoader.hasDocxTemplate(templateType)) {
      docxBuffer = await docxTemplateEngine.buildFromDocx(templateType, templateVars);
    } else {
      const templateContent = templateLoader.loadTemplate(templateType);
      if (!templateContent) {
        throw new Error("Modèle introuvable pour le type: " + templateType);
      }

      const filledTemplate = templateLoader.fillTemplate(templateContent, templateVars);
      docxBuffer = await docxBuilder.buildFromTemplate(
        filledTemplate,
        templateType
      );
    }

    const fileName = `${templateType}_${Date.now()}.docx`;

    return {
      docxBase64: docxBuffer.toString("base64"),
      fileName,
      preview: Object.entries(templateVars)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    };
  }

  canHandle(templateType: string): boolean {
    return templateLoader.templateExists(templateType);
  }
}

export const documentGenerator = new DocumentGenerator();
