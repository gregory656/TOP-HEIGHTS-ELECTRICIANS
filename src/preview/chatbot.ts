import { getLocalAssistantFallback } from '../services/localKnowledgeService';
export const askTopHeightsAssistant = async (message: string) => getLocalAssistantFallback(message);
