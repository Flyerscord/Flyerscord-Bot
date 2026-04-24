export class RequestFailedException extends Error {
  constructor(endpoint: string, statusCode: number) {
    super(`Request to ${endpoint} failed with status ${statusCode}`);
    this.name = "RequestFailedException";
  }
}
