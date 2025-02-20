import { IAnswer, IDBQuestion } from "../interfaces/IDBQuestion";

export default class Round {
  private readonly question: IDBQuestion;
  private readonly choices: IAnswer[];
  private readonly correctAnswerIndex: number;

  constructor(question: IDBQuestion) {
    this.question = question;

    const defChoices: IAnswer[] = [question.answer1, question.answer2, question.answer3, question.answer4];
    this.choices = defChoices.sort(() => Math.random() - 0.5);
    this.correctAnswerIndex = defChoices.findIndex((choice) => choice.correct);
  }
}
