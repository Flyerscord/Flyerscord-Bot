export class AccountDoesNotExistException extends Error {
  name: string = "AccountDoesNotExistException";
  message: string = "The account does not exist";
}
