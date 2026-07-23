import { AIRequest, AIResponse } from "./types";

export interface IAgent {
  readonly type: string;
  readonly name: string;
  canHandle(request: AIRequest): boolean;
  process(request: AIRequest): Promise<AIResponse>;
}
