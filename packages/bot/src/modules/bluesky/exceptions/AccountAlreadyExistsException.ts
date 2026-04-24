export class AccountAlreadyExistsException extends Error {
  name: string = "AccountAlreadyExistsException";
  message: string = "The account already exists";
}
