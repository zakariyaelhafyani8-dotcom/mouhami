import { IAgent } from "@/lib/ai/models/agent.interface";
import { AIRequest, AIResponse, AgentType } from "@/lib/ai/models/types";
import { documentGeneratorAgent } from "@/lib/ai/agents/documentGenerator.agent";
import { legalSearchAgent } from "@/lib/ai/legal-search/legalSearch.agent";

class AIOrchestrator {
  private agents: Map<AgentType, IAgent> = new Map();

  constructor() {
    this.registerAgent(documentGeneratorAgent);
    this.registerAgent(legalSearchAgent);
  }

  registerAgent(agent: IAgent): void {
    this.agents.set(agent.type as AgentType, agent);

  }

  getAgent(type: AgentType): IAgent | undefined {
    return this.agents.get(type);
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    const agent = this.agents.get(request.type);
    if (!agent) {
      return {
        success: false,
        error: `Aucun agent trouvé pour le type: ${request.type}`,
      };
    }
    return agent.process(request);
  }

  listAgents(): { type: AgentType; name: string }[] {
    return Array.from(this.agents.values()).map((a) => ({
      type: a.type as AgentType,
      name: a.name,
    }));
  }
}

export const aiOrchestrator = new AIOrchestrator();
