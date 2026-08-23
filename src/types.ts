export type ProjectCategory =
  | 'AI & ML'
  | 'SaaS'
  | 'DevTool'
  | 'Agritech & Food'
  | 'EdTech & Health'
  | 'FinTech'
  | 'Open Source';

export interface Project {
  id: string;
  name: string;
  url: string;
  handle: string;
  tagline: string;
  category: ProjectCategory;
  bestScore: number;
  dailyBestScore: number;
  runsCount: number;
  clicksCount: number;
  createdAt: number;
  updatedAt: number;
  verified: boolean;
  lastPlayer?: string;
  badge?: string;
}

export interface GameStats {
  score: number;
  traysStacked: number;
  combo: number;
  maxCombo: number;
  perfectDrops: number;
  heightMeters: number;
  isNewDailyBest: boolean;
  isNewAllTimeBest: boolean;
  isOvertakenRank1: boolean;
  previousRank1Score: number;
}

export interface StackingScoreSubmission {
  projectId: string;
  score: number;
  playerHandle: string;
}
