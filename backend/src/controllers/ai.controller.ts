import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { aiOrchestrator } from "../ai/services/orchestrator.service";
import { ollamaClient } from "../ai/utils/ollamaClient";

export const aiController = {
  async legalSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          error: "يرجى كتابة سؤال للبحث في المكتبة القانونية",
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const { legalSearchService } = await import("../ai/legal-search/legalSearch.service");
      const { sources, fullPrompt } = await legalSearchService.searchSources(question.trim());

      if (sources.length === 0) {
        res.write(`data: ${JSON.stringify({ sources: [], answer: "لم يتم العثور على أي نص قانوني مطابق داخل قاعدة المعرفة." })}\n\n`);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({ sources })}\n\n`);

      let fullAnswer = "";
      try {
        const ollama = (await import("ollama")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const streamRes: any = await ollama.chat({
          model: "qwen2.5:3b",
          messages: [{ role: "user", content: fullPrompt }],
          options: { temperature: 0.1 },
          stream: true,
        });

        for await (const chunk of streamRes.itr) {
          const token = chunk.message?.content || "";
          fullAnswer += token;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      } catch {
        fullAnswer = "تعذر الاتصال بالمساعد.";
      }

      res.write(`data: ${JSON.stringify({ done: true, answer: fullAnswer })}\n\n`);
      res.end();
    } catch (error) {
      next(error);
    }
  },

  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, data } = req.body;
      const result = await aiOrchestrator.processRequest({
        type,
        userId: req.user!.userId,
        data,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async checkOllama(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const available = await ollamaClient.isAvailable();
      const models = available ? await ollamaClient.listModels() : [];
      res.json({
        success: true,
        available,
        models: models.map((m) => m.name),
      });
    } catch (error) {
      next(error);
    }
  },

  async listAgents(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agents = aiOrchestrator.listAgents();
      res.json({ success: true, agents });
    } catch (error) {
      next(error);
    }
  },
};
