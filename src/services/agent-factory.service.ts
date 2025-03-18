import { Agent } from './agent.service';
import { TemplateService } from './template-service.service';

export class AgentFromTemplate {
  private static instance: AgentFromTemplate;
  private agentRegistry: Map<string, Agent> = new Map();
  private templateService: TemplateService;

  private constructor() {
    this.templateService = new TemplateService();
  }

  public static getInstance(): AgentFromTemplate {
    if (!AgentFromTemplate.instance) {
      AgentFromTemplate.instance = new AgentFromTemplate();
    }
    return AgentFromTemplate.instance;
  }
}
