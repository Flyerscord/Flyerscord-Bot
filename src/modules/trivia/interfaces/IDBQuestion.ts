import { CATEGORY, DIFFICULTY } from "./IImportQuestion";

export interface IDBQuestion {
  question: string;
  answer1: IAnswer;
  answer2: IAnswer;
  answer3: IAnswer;
  answer4: IAnswer;
  category: CATEGORY;
  difficulty: DIFFICULTY;
  addedOn: Date;
  addedBy: string;
  id: number;
  used: boolean;
}

export interface IAnswer {
  answer: string;
  correct: boolean;
}
