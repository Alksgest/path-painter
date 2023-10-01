import { RequestError } from "../types";
import { Express, NextFunction, Request, Response } from "express";
import {
  bodyDataMetadataKey,
  headerDataMetadataKey,
  paramDataMetadataKey,
  queryDataMetadataKey,
} from "../types/symbols";
import {
  ConstructorType,
  RestHandler,
  UnknownFunction,
} from "../types/settings";

const defineMetadataFunctionMap: {
  [key: symbol]: (req: Request, handler: UnknownFunction<void>) => void;
} = {
  [bodyDataMetadataKey]: (req: Request, handler: UnknownFunction) => {
    Reflect.defineMetadata(bodyDataMetadataKey, req.body, handler);
  },
  [headerDataMetadataKey]: (req: Request, handler: UnknownFunction) => {
    Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
  },
  [queryDataMetadataKey]: (req: Request, handler: UnknownFunction) => {
    Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
  },
  [paramDataMetadataKey]: (req: Request, handler: UnknownFunction) => {
    Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);
  },
};

export const restHandlers: RestHandler = {
  get: addGetHandler,
  post: addPostHandler,
  put: addPutHandler,
  delete: addDeleteHandler,
};

function addGetHandler(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string,
): void {
  console.log(`[${controller.name}] registered get ${path}`);
  app.get(path, createHandlerWithoutBody(controller, functionName));
}

function addPostHandler(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string,
): void {
  console.log(`[${controller.name}] registered post ${path}`);
  app.post(path, createHandlerWithBody(controller, functionName));
}

function addPutHandler(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string,
): void {
  console.log(`[${controller.name}] registered put ${path}`);
  app.put(path, createHandlerWithBody(controller, functionName));
}

function addDeleteHandler(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string,
): void {
  console.log(`[${controller.name}] registered delete ${path}`);
  app.delete(path, createHandlerWithoutBody(controller, functionName));
}

function addMetadata(req: Request, handler: UnknownFunction, keys: symbol[]) {
  for (const key of keys) {
    defineMetadataFunctionMap[key](req, handler);
  }
}

function createHandlerWithBody(
  controller: ConstructorType,
  functionName: string,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction | undefined,
  ) => {
    try {
      // TODO: entry point for DI
      const obj = new controller();
      const handler = (obj as Record<string, unknown>)[
        functionName
      ] as UnknownFunction;

      addMetadata(req, handler, [
        bodyDataMetadataKey,
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      if (result) {
        res.json(result);
      } else {
        res.send();
      }

      if (next) {
        next();
      }
    } catch (error: any) {
      console.error(error);
      if (next) {
        if (error instanceof RequestError) {
          const err = error as RequestError;
          res.status(err.code || 500);
          res.send(err.message);
        }
      }
    }
  };
}

function createHandlerWithoutBody(
  controller: ConstructorType,
  functionName: string,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction | undefined,
  ) => {
    // TODO: entry point for DI
    try {
      const obj = new controller();
      const handler = (obj as Record<string, unknown>)[
        functionName
      ] as UnknownFunction;

      addMetadata(req, handler, [
        headerDataMetadataKey,
        queryDataMetadataKey,
        paramDataMetadataKey,
      ]);

      const bindFunc = handler.bind(obj);

      const result = await Promise.resolve(bindFunc());
      if (result) {
        res.json(result);
      } else {
        res.send();
      }

      if (next) {
        next();
      }
    } catch (error: any) {
      console.error(error);
      if (next) {
        if (error instanceof RequestError) {
          const err = error as RequestError;
          res.status(err.code || 500);
          res.send(err.message);
        }
      }
    }
  };
}
