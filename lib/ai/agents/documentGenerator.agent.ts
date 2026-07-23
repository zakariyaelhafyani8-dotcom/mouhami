import { IAgent } from "@/lib/ai/models/agent.interface";
import { AIRequest, AIResponse, DocumentGeneratorRequest } from "@/lib/ai/models/types";
import { documentGenerator as newEngine } from "@/lib/ai/document-engine/DocumentGenerator";

export const documentGeneratorAgent: IAgent = {
  type: "document-generator",
  name: "منشئ المستندات",

  canHandle(request: AIRequest): boolean {
    return request.type === "document-generator";
  },

  async process(request: AIRequest): Promise<AIResponse> {
    try {
      const reqData = request.data as DocumentGeneratorRequest;
      const { templateType, fields } = reqData;

      const result = await newEngine.generate(templateType, fields);
      return {
        success: true,
        result: {
          docxBase64: result.docxBase64,
          fileName: result.fileName,
          text: result.preview,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erreur lors de la génération du document",
      };
    }
  },
};
