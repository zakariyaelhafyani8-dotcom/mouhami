import { IAgent } from "@/lib/ai/models/agent.interface";
import { AIRequest, AIResponse } from "@/lib/ai/models/types";
import { legalSearchService } from "@/lib/ai/legal-search/legalSearch.service";

export const legalSearchAgent: IAgent = {
  type: "legal-search",
  name: "المكتبة القانونية",

  canHandle(request: AIRequest): boolean {
    return request.type === "legal-search";
  },

  async process(request: AIRequest): Promise<AIResponse> {
    try {
      const { question } = request.data as { question: string };

      if (!question || !question.trim()) {
        return {
          success: false,
          error: "يرجى كتابة سؤال للبحث في المكتبة القانونية",
        };
      }

      const { sources, fullPrompt } = await legalSearchService.searchSources(question.trim());
      const answer = fullPrompt ? await legalSearchService.generateAnswer(fullPrompt) : "";

      return {
        success: true,
        result: { sources, answer },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "حدث خطأ أثناء البحث في المكتبة القانونية",
      };
    }
  },
};
