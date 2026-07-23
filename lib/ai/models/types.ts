export interface AIRequest {
  type: AgentType;
  userId: string;
  data: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface DocumentGeneratorRequest {
  templateType: string;
  fields: Record<string, string>;
}

export interface DocumentGeneratorResponse {
  docxBase64: string;
  fileName: string;
}

export type AgentType = "document-generator" | "legal-search";

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  model: string;
  temperature: number;
}
