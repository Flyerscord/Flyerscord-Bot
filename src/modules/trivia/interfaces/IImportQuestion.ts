export interface IImportQuestion {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: number;
  category: CATEGORY;
  difficulty: DIFFICULTY;
}

export enum DIFFICULTY {
  UNKNOWN = "unknown",
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum CATEGORY {
  NONE = "none",
  GENERAL = "general",
  FLYERS = "flyers",
  HOCKEY = "hockey",
}
