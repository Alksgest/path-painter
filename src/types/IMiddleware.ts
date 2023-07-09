import { Request, Response } from "express";

export interface IMiddleware {
  use(
    request: Request,
    response: Response,
    next: (err?: unknown) => unknown,
  ): void;
}
