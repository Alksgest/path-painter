export class RequestError extends Error {
  code?: number;

  constructor(code?: number, message?: string) {
    super(message);
    this.code = code;
  }
}

export class DependencyInjectionError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
