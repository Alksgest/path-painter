import express, { Express, Request, Response } from "express";
import { ConstructorType, UnknownFunction } from "../types/settings";
import cors from "cors";
import { controllerMetadataKey, emptySymbol } from "../types/symbols";
import { getRestKey, getUseAfterKey, getUseBeforeKey } from "../util";
import { ExpressUse } from "../types/web";
import { restHandlers } from "./rest-handlers";
import { AppConfig } from "../types";

export class AppContainer {
  private readonly app: Express;

  private config?: AppConfig;

  constructor() {
    this.app = express();
  }

  public start(port: number, callback: () => void): void {
    this.app.listen(port, callback);
  }

  public build(config: AppConfig): void {
    this.config = config;
    this.setupCors(config, this.app);

    const controllers = config.controllers || [];

    controllers.forEach((controller) =>
      this.registerController(controller as ConstructorType),
    );
  }

  private setupCors(config: AppConfig, app: Express) {
    // TODO: add another settings for cors
    if (config.cors) {
      if (config.cors === true) {
        app.use(cors());
      }
    }
  }

  private registerController(controller: ConstructorType): void {
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

    const globalPrefix = this.config?.globalPrefix;

    const controllerPath: string = Reflect.getOwnMetadata(
      controllerMetadataKey,
      controller,
    );

    const basePath = `${globalPrefix}${controllerPath}`;

    const useBeforeControllerKey = getUseBeforeKey(controllerKeys);

    if (useBeforeControllerKey !== emptySymbol) {
      this.registerMiddlewares(useBeforeControllerKey, controller, basePath);
    }

    for (const funcName of functions) {
      this.registerEndpointWithMiddlewares(controller, funcName, basePath);
    }

    const useAfterControllerKey = getUseAfterKey(controllerKeys);

    if (useAfterControllerKey !== emptySymbol) {
      this.registerMiddlewares(useAfterControllerKey, controller, basePath);
    }
  }

  private registerEndpointWithMiddlewares(
    controller: ConstructorType,
    funcName: string,
    controllerPath: string,
  ): boolean {
    const controllerMethod = controller.prototype[funcName] as UnknownFunction;
    const funcMetadataKeys: symbol[] =
      Reflect.getOwnMetadataKeys(controllerMethod);

    const restKey = getRestKey(funcMetadataKeys);
    const useBeforeKey = getUseBeforeKey(funcMetadataKeys);
    const useAfterKey = getUseAfterKey(funcMetadataKeys);

    if (restKey == emptySymbol) {
      return false;
    }

    const methodPath = Reflect.getOwnMetadata(restKey, controllerMethod);

    const combinedPath = `${controllerPath}${methodPath}`;

    if (useBeforeKey != emptySymbol) {
      this.registerMiddlewares(useBeforeKey, controllerMethod, combinedPath);
    }

    this.registerEndpoint(restKey, combinedPath, controller, funcName);

    if (useAfterKey != emptySymbol) {
      this.registerMiddlewares(useAfterKey, controllerMethod, combinedPath);
    }

    return true;
  }

  private registerMiddlewares(
    middlewareKey: symbol,
    controllerOrControllerMethod: ConstructorType | UnknownFunction,
    combinedPath: string,
  ): void {
    const middlewaresClasses = Reflect.getMetadata(
      middlewareKey,
      controllerOrControllerMethod,
    ) as ConstructorType[];

    for (const middleware of middlewaresClasses) {
      // TODO: get from DI
      const obj = new middleware();
      const handler = (obj as Record<string, unknown>).use as ExpressUse;

      if (!handler) {
        console.log(
          `Class ${middleware.name} does not implement IMiddleware interface`,
        );
        return;
      }

      this.app.use(
        combinedPath,
        async (
          request: Request,
          response: Response,
          next: (err?: any) => any,
        ) => {
          return handler(request, response, next);
        },
      );
    }
  }

  private registerEndpoint(
    restKey: symbol,
    combinedPath: string,
    controller: ConstructorType,
    funcName: string,
  ): void {
    const stringKey = restKey.description;

    if (!stringKey) {
      return;
    }

    const registerEndpointMethod = restHandlers[stringKey];

    registerEndpointMethod(this.app, combinedPath, controller, funcName);
  }
}
