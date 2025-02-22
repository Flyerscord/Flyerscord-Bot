export class AccountDoesNotExistException extends Error {
  constructor(account: string) {
    super(`Account ${account} does not exist`);
    this.name = "AccountDoesNotExistException";
  }
}
