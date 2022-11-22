import { RequestError } from "./../types/errors";
import { Express, NextFunction, Request, Response } from "express";
import {
  bodyDataMetadataKey,
  headerDataMetadataKey,
  queryDataMetadataKey,
  paramDataMetadataKey,
} from "../types/symbols";
import { ConstructorType } from "../types/settings";

type RestHandler = {
  [key: string]: (
    app: Express,
    path: string,
    controller: ConstructorType,
    functionName: string
  ) => void;
};

export const restHandlers: RestHandler = {
  get: getFunc,
  post: postFunc,
  put: putFunc,
  delete: deleteFunc,
};

function getFunc(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string
): void {
  app.get(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      // TODO: entry point for DI
      try {
        const obj = new controller();
        const handler: Function = obj[functionName];

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
    }
  );
}

function postFunc(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string
): void {
  app.post(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      try {
        // TODO: entry point for DI
        const obj = new controller();
        const handler: Function = obj[functionName];

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
    }
  );
}

function putFunc(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string
): void {
  app.put(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      try {
        // TODO: entry point for DI
        const obj = new controller();
        const handler: Function = obj[functionName];

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
    }
  );
}

function deleteFunc(
  app: Express,
  path: string,
  controller: ConstructorType,
  functionName: string
): void {
  app.delete(
    path,
    async (req: Request, res: Response, next: NextFunction | undefined) => {
      try {
        // TODO: entry point for DI
        const obj = new controller();
        const handler: Function = obj[functionName];

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
    }
  );
}

const keyToDataMap: {
  [key: symbol]: (req: Request, handler: Function) => void;
} = {
  [bodyDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(bodyDataMetadataKey, req.body, handler);
  },
  [headerDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
  },
  [queryDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
  },
  [paramDataMetadataKey]: (req: Request, handler: Function) => {
    Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);
  },
};

// function handleResult(
//   result: any,
//   res: Response<any, Record<string, any>>,
//   next: NextFunction | undefined
// ) {
//   if (result) {
//     res.json(result);
//   } else {
//     res.send();
//   }

//   if (next) {
//     next();
//   }
// }

function addMetadata(req: Request, handler: Function, keys: symbol[]) {
  for (const key of keys) {
    keyToDataMap[key](req, handler);
  }
}
