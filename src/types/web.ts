import { Request, Response } from "express";

export interface IExpressMiddleware {
  use(request: Request, response: Response, next: (err?: any) => any): any;
}
