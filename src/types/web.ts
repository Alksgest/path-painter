import { Request, Response } from "express";

export interface TmpBodyModel {
  data: {
    [key: string]: any;
  };
}

export interface IExpressMiddleware {
  use(request: Request, response: Response, next: (err?: any) => any): any;
}
