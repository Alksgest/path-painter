import { Request, Response } from "express";

export type ExpressUse = (
  request: Request,
  response: Response,
  next: (err?: unknown) => unknown,
) => void;

export interface IMiddleware {
  use: ExpressUse;
}
