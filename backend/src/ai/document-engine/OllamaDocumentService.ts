import { ollamaClient } from "../utils/ollamaClient";
import { documentPromptBuilder } from "./DocumentPromptBuilder";

export class OllamaDocumentService {
  async generateDocumentParts(
    templateType: string,
    fields: Record<string, string>
  ): Promise<{ facts: string; requests: string; conclusion: string; legalArguments: string }> {
    const prompt = documentPromptBuilder.buildPrompt(templateType, fields);

    const rawResponse = await ollamaClient.generate(prompt, {
      temperature: 0.1,
    });

    return documentPromptBuilder.extractJsonFromResponse(rawResponse);
  }
}

export const ollamaDocumentService = new OllamaDocumentService();
