
export interface BuildingInfo {
  id: string;
  name: string;
  details: string[];
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}
