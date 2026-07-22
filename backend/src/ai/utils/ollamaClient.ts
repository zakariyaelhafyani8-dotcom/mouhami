import ollama from "ollama";

const DEFAULT_MODEL = "qwen2.5:3b";

export const ollamaClient = {
  async generate(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<string> {
    const model = options.model || DEFAULT_MODEL;
    const response = (await ollama.chat({
      model,
      messages: [{ role: "user", content: prompt }],
      options: {
        temperature: options.temperature ?? 0.3,
      },
    })) as { message: { content: string } };
    return response.message.content;
  },

  async generateEmbedding(text: string): Promise<number[]> {
    const response = (await ollama.embeddings({
      model: "qwen2.5:3b",
      prompt: text,
    })) as { embedding: number[] };
    return response.embedding;
  },

  async isAvailable(): Promise<boolean> {
    try {
      await ollama.list();
      return true;
    } catch {
      return false;
    }
  },

  async listModels() {
    const response = (await ollama.list()) as { models: Array<{ name: string }> };
    return response.models;
  },
};
