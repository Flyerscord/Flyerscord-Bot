import { CATEGORY, DIFFICULTY } from "./IImportQuestion";

export interface IUserStats {
  overallCorrectAnswers: number;
  overallIncorrectAnswers: number;
  userId: string;
  firstParticipation: Date;
  lastParticipation: Date;
  totalReactionTime: number;
  fastestReactionTime: number;
  categoryStats: ICategoryStats[];
  difficultyStats: IDifficultyStats[];
}

export interface ICategoryStats {
  category: CATEGORY;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface IDifficultyStats {
  difficulty: DIFFICULTY;
  correctAnswers: number;
  incorrectAnswers: number;
}
