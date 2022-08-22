import "reflect-metadata";
import cors from "cors";
import { Express, Request, Response } from "express";
import { ControllerBaseConfig } from "./types/settings";
import {
  bodyDataMetadataKey,
  headerDataMetadataKey,
  controllerMetadataKey,
  queryDataMetadataKey,
  paramDataMetadataKey,
  emptySymbol,
} from "./types/symbols";
import { getRestKey, getUseAfterKey, getUseBeforeKey } from "./util";
import { IExpressMiddleware } from "./types/web";

// TODO: handle other REST methods
const registerMethodSwitchObj: {
  [key: string]: (
    app: Express,
    path: string,
    controller: Function,
    functionName: string
  ) => void;
} = {
  post: (
    app: Express,
    path: string,
    controller: Function,
    functionName: string
  ) => {
    app.post(path, async (req: Request, res: Response, next: any) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      Reflect.defineMetadata(bodyDataMetadataKey, req.body, handler);
      Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
      Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
      Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);

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
    });
  },
  get: (
    app: Express,
    path: string,
    controller: Function,
    functionName: string
  ) => {
    app.get(path, async (req: Request, res: Response, next: any) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
      Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
      Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);

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
    });
  },
};

export function useExpressServer(app: Express, config: ControllerBaseConfig) {
  setupCors(config, app);

  const controllers = config.controllers || [];

  controllers.forEach((controller) => registerController(controller, app));
}

function setupCors(config: ControllerBaseConfig, app: Express) {
  // TODO: add another settings for cors
  if (config.cors) {
    if (config.cors === true) {
      app.use(cors());
    }
  }
}

function registerController(controller: Function, app: Express) {
  const controllerKeys = Reflect.getOwnMetadataKeys(controller);

  // wrong class registered as controller
  if (!controllerKeys.includes(controllerMetadataKey)) {
    return;
  }

  const functions = Object.getOwnPropertyNames(controller.prototype).filter(
    (f) => f != "constructor"
  );

  if (!functions?.length) {
    return;
  }

  const basePath: string = Reflect.getOwnMetadata(
    controllerMetadataKey,
    controller
  );

  const useBeforeControllerKey = getUseBeforeKey(controllerKeys);

  if (useBeforeControllerKey !== emptySymbol) {
    registerMiddlewares(useBeforeControllerKey, controller, basePath, app);
  }

  for (const funcName of functions) {
    registerEndpointWithMiddlewares(controller, funcName, basePath, app);
  }

  const useAfterControllerKey = getUseAfterKey(controllerKeys);

  if (useAfterControllerKey !== emptySymbol) {
    registerMiddlewares(useAfterControllerKey, controller, basePath, app);
  }
}

function registerEndpointWithMiddlewares(
  controller: Function,
  funcName: string,
  controllerPath: string,
  app: Express
): boolean {
  const func: Function = controller.prototype[funcName];
  const funcMetadataKeys: symbol[] = Reflect.getOwnMetadataKeys(func);

  const restKey = getRestKey(funcMetadataKeys);
  const useBeforeKey = getUseBeforeKey(funcMetadataKeys);
  const useAfterKey = getUseAfterKey(funcMetadataKeys);

  if (restKey == emptySymbol) {
    return false;
  }

  const methodPath = Reflect.getOwnMetadata(restKey, func);

  const combinedPath = `${controllerPath}${methodPath}`;

  if (useBeforeKey != emptySymbol) {
    registerMiddlewares(useBeforeKey, func, combinedPath, app);
  }

  registerEndpoints(restKey, combinedPath, app, controller, funcName);

  if (useAfterKey != emptySymbol) {
    registerMiddlewares(useAfterKey, func, combinedPath, app);
  }

  return true;
}

const registerMiddlewares = (
  middlewareKey: symbol,
  func: Function,
  combinedPath: string,
  app: Express
) => {
  const middlewaresClasses: Function[] = Reflect.getMetadata(
    middlewareKey,
    func
  );

  for (const middleware of middlewaresClasses) {
    // TODO: get from DI
    const obj: IExpressMiddleware = new (middleware as any)();
    const handler = obj.use;

    app.use(
      combinedPath,
      async (
        request: Request,
        response: Response,
        next: (err?: any) => any
      ) => {
        return await Promise.resolve(handler(request, response, next));
      }
    );
  }
};

function registerEndpoints(
  restKey: symbol,
  combinedPath: string,
  app: Express,
  controller: Function,
  funcName: string
) {
  const stringKey = restKey.description!;

  const registerEndpointMethod = registerMethodSwitchObj[stringKey];

  registerEndpointMethod(app, combinedPath, controller, funcName);
}
