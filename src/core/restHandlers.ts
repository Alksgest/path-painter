import { Express, NextFunction, Request, Response } from "express";
import {
  bodyDataMetadataKey,
  headerDataMetadataKey,
  queryDataMetadataKey,
  paramDataMetadataKey,
} from "../types/symbols";

export const restHandlers: {
  [key: string]: (
    app: Express,
    path: string,
    controller: Function,
    functionName: string
  ) => void;
} = {
  get: getFunc,
  post: postFunc,
  put: putFunc,
  delete: deleteFunc,
};

function getFunc(
  app: Express,
  path: string,
  controller: Function,
  functionName: string
) {
  app.get(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      addMetadata(req, handler, [
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      handleResult(result, res, next);
    }
  );
}

function postFunc(
  app: Express,
  path: string,
  controller: Function,
  functionName: string
) {
  app.post(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      addMetadata(req, handler, [
        bodyDataMetadataKey,
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      handleResult(result, res, next);
    }
  );
}

function putFunc(
  app: Express,
  path: string,
  controller: Function,
  functionName: string
) {
  app.post(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      addMetadata(req, handler, [
        bodyDataMetadataKey,
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      handleResult(result, res, next);
    }
  );
}

function deleteFunc(
  app: Express,
  path: string,
  controller: Function,
  functionName: string
) {
  app.post(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      addMetadata(req, handler, [
        bodyDataMetadataKey,
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      handleResult(result, res, next);
    }
  );
}

const keyToDataMap: {
  [key: symbol]: (req: Request, handler: Function) => void;
} = {
  [bodyDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(bodyDataMetadataKey, req.headers, handler);
  },
  [headerDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
  },
  [queryDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(queryDataMetadataKey, req.headers, handler);
  },
  [paramDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(paramDataMetadataKey, req.headers, handler);
  },
};

function handleResult(
  result: any,
  res: Response<any, Record<string, any>>,
  next: NextFunction | undefined
) {
  if (result) {
    res.json(result);
  } else {
    res.send();
  }

  if (next) {
    next();
  }
}

function addMetadata(req: Request, handler: Function, keys: symbol[]) {
  for (const key of keys) {
    keyToDataMap[key](req, handler);
  }
}
