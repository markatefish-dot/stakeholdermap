export type PowerBase = 'legitimate' | 'reward' | 'coercive' | 'expert' | 'referent' | 'information';

export type InfluenceTactic = 
  | 'Rational Persuasion'
  | 'Inspirational Appeals'
  | 'Consultation'
  | 'Ingratiation'
  | 'Personal Appeals'
  | 'Coalition Tactics';

export interface PowerScores {
  legitimate: number;
  reward: number;
  coercive: number;
  expert: number;
  referent: number;
  information: number;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  team: string;
  notes: string;
  powerScores: PowerScores;
  tactics: InfluenceTactic[];
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 1-5
  type: 'formal' | 'informal' | 'both';
}

export interface SessionData {
  projectName: string;
  stakeholders: Stakeholder[];
  relationships: Relationship[];
}
