import "reflect-metadata";
import cors from "cors";
import { Express, Request, Response } from "express";
import {
  ConstructorType,
  ControllerBaseConfig,
  UnknownFunction,
} from "../types/settings";
import { controllerMetadataKey, emptySymbol } from "../types/symbols";
import { getRestKey, getUseAfterKey, getUseBeforeKey } from "../util";
import { IExpressMiddleware } from "../types/web";
import { restHandlers } from "./rest-handlers";

export function useExpressServer(
  app: Express,
  config: ControllerBaseConfig,
): void {
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

function registerController(controller: ConstructorType, app: Express): void {
  const controllerKeys = Reflect.getOwnMetadataKeys(controller);

  // wrong class registered as controller
  if (!controllerKeys.includes(controllerMetadataKey)) {
    return;
  }

  const functions = Object.getOwnPropertyNames(controller.prototype).filter(
    (f) => f != "constructor",
  );

  if (!functions?.length) {
    return;
  }

  const basePath: string = Reflect.getOwnMetadata(
    controllerMetadataKey,
    controller,
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
  controller: ConstructorType,
  funcName: string,
  controllerPath: string,
  app: Express,
): boolean {
  const func = controller.prototype[funcName] as UnknownFunction;
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

  registerEndpoint(restKey, combinedPath, app, controller, funcName);

  if (useAfterKey != emptySymbol) {
    registerMiddlewares(useAfterKey, func, combinedPath, app);
  }

  return true;
}

function registerMiddlewares(
  middlewareKey: symbol,
  func: UnknownFunction | ConstructorType,
  combinedPath: string,
  app: Express,
): void {
  const middlewaresClasses = Reflect.getMetadata(
    middlewareKey,
    func,
  ) as UnknownFunction[];

  for (const middleware of middlewaresClasses) {
    // TODO: get from DI
    const obj: IExpressMiddleware = new (middleware as any)();
    const handler = obj.use;

    app.use(
      combinedPath,
      async (
        request: Request,
        response: Response,
        next: (err?: any) => any,
      ) => {
        return await Promise.resolve(handler(request, response, next));
      },
    );
  }
}

function registerEndpoint(
  restKey: symbol,
  combinedPath: string,
  app: Express,
  controller: ConstructorType,
  funcName: string,
): void {
  const stringKey = restKey.description;

  if (!stringKey) {
    return;
  }

  const registerEndpointMethod = restHandlers[stringKey];

  registerEndpointMethod(app, combinedPath, controller, funcName);
}
