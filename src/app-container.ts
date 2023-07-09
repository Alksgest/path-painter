import express, { Express, Request, Response } from "express";
import {
  ConstructorType,
  ControllerBaseConfig,
  UnknownFunction,
} from "./types/settings";
import cors from "cors";
import { controllerMetadataKey, emptySymbol } from "./types/symbols";
import { getRestKey, getUseAfterKey, getUseBeforeKey } from "./util";
import { ExpressUse } from "./types/web";
import { restHandlers } from "./core/rest-handlers";

export class AppContainer {
  private readonly app: Express;

  constructor() {
    this.app = express();
  }

  public listen(port: number, callback: () => void): void {
    this.app.listen(port, callback);
  }

  public build(config: ControllerBaseConfig): void {
    this.setupCors(config, this.app);

    const controllers = config.controllers || [];

    controllers.forEach((controller) =>
      this.registerController(controller, this.app),
    );
  }

  private setupCors(config: ControllerBaseConfig, app: Express) {
    // TODO: add another settings for cors
    if (config.cors) {
      if (config.cors === true) {
        app.use(cors());
      }
    }
  }

  private registerController(controller: ConstructorType, app: Express): void {
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
      this.registerMiddlewares(
        useBeforeControllerKey,
        controller,
        basePath,
        app,
      );
    }

    for (const funcName of functions) {
      this.registerEndpointWithMiddlewares(controller, funcName, basePath, app);
    }

    const useAfterControllerKey = getUseAfterKey(controllerKeys);

    if (useAfterControllerKey !== emptySymbol) {
      this.registerMiddlewares(
        useAfterControllerKey,
        controller,
        basePath,
        app,
      );
    }
  }

  private registerEndpointWithMiddlewares(
    controller: ConstructorType,
    funcName: string,
    controllerPath: string,
    app: Express,
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
      this.registerMiddlewares(
        useBeforeKey,
        controllerMethod,
        combinedPath,
        app,
      );
    }

    this.registerEndpoint(restKey, combinedPath, app, controller, funcName);

    if (useAfterKey != emptySymbol) {
      this.registerMiddlewares(
        useAfterKey,
        controllerMethod,
        combinedPath,
        app,
      );
    }

    return true;
  }

  private registerMiddlewares(
    middlewareKey: symbol,
    controllerOrControllerMethod: ConstructorType | UnknownFunction,
    combinedPath: string,
    app: Express,
  ): void {
    const middlewaresClasses = Reflect.getMetadata(
      middlewareKey,
      controllerOrControllerMethod,
    ) as ConstructorType[];

    for (const middleware of middlewaresClasses) {
      // TODO: get from DI
      const obj = new middleware();
      const handler = obj.use as ExpressUse;

      if (!handler) {
        console.log(
          `Class ${middleware.name} does not implement IMiddleware interface`,
        );
        return;
      }

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

  private registerEndpoint(
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
}
