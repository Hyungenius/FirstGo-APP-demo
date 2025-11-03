export interface Step {
  id: string;
  tutorialId: string;
  ord: number;
  title: string;
  summary?: string;
  detail?: string | null;
  completed: boolean;
  completedAt?: string | null; // ISO string
}

export interface Item {
  id: string;
  tutorialId: string;
  name: string;
  qty?: string | null;
  note?: string | null;
}

export interface TutorialInstance {
  id: string;
  userId: string;
  inputText: string;
  title?: string;
  description?: string;
  tags?: string[];
  difficulty?: string;
  progress: number; // 0..1
  completed: boolean;
  createdAt: string; // ISO
  completedAt?: string | null; // ISO
  steps?: Step[];
  items?: Item[];
}

export interface Badge {
  id: string;
  key: string;
  title: string;
  description?: string;
  iconUrl?: string;
  createdAt: string; // ISO
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string; // ISO
  sourceTutorial?: string | null;
}


