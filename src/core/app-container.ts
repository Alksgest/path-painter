import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import {
  ConstructorType,
  RestHandler,
  RestMethod,
  UnknownFunction,
} from "../types/settings";
import {
  bodyDataMetadataKey,
  controllerMetadataKey,
  emptySymbol,
  headerDataMetadataKey,
  paramDataMetadataKey,
  queryDataMetadataKey,
} from "../types/symbols";
import { getRestKey, getUseAfterKey, getUseBeforeKey } from "../util";
import { ExpressUse } from "../types/web";
import { AppConfig, RequestError } from "../types";
import { DiContainer } from "./di-container";

export class AppContainer {
  private readonly app: Express;
  private readonly diContainer: DiContainer;

  private config?: AppConfig;

  private readonly restHandlers: RestHandler = {
    get: this.addHandler("get").bind(this),
    post: this.addHandler("post").bind(this),
    put: this.addHandler("put").bind(this),
    delete: this.addHandler("delete").bind(this),
  };

  constructor() {
    this.app = express();
    this.diContainer = new DiContainer();
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
      (f) => f !== "constructor",
    );

    if (!functions?.length) {
      return;
    }

    const globalPrefix = this.config?.globalPrefix;

    const controllerPath: string = Reflect.getOwnMetadata(
      controllerMetadataKey,
      controller,
    );

    const basePath = `/${globalPrefix}${controllerPath}`;

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

    for (const middlewareType of middlewaresClasses) {
      this.app.use(
        combinedPath,
        async (
          request: Request,
          response: Response,
          next: (err?: any) => any,
        ) => {
          const middleware = this.diContainer.get(middlewareType);
          const handler = (middleware as any).use.bind(
            middleware,
          ) as ExpressUse;

          if (!handler) {
            console.log(
              `Class ${middlewareType.name} does not implement IMiddleware interface`,
            );
            return;
          }

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
    const stringKey = restKey.description as RestMethod;

    if (!stringKey) {
      return;
    }

    const registerEndpointMethod = this.restHandlers[stringKey];

    registerEndpointMethod(combinedPath, controller, funcName);
  }

  private addHandler(method: RestMethod) {
    return (
      path: string,
      controller: ConstructorType,
      functionName: string,
    ) => {
      console.log(`[${controller.name}] registered ${method} ${path}`);

      this.app[method](path, (req, res, next) => {
        const handler = this.createHandler(
          controller,
          functionName,
          method === "get" || method === "delete",
        );

        return handler(req, res, next);
      });
    };
  }

  private createHandler(
    controllerCtor: ConstructorType,
    functionName: string,
    noBody = false,
  ) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction | undefined,
    ) => {
      try {
        const controller = this.diContainer.get(controllerCtor);
        const handler = (controller as Record<string, unknown>)[
          functionName
        ] as UnknownFunction;

        if (!noBody) {
          Reflect.defineMetadata(bodyDataMetadataKey, req.body, handler);
        }

        Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
        Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
        Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);

        const bindFunc = handler.bind(controller);

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
          } else {
            res.status(500);
            res.send("Internal server error");
          }
        }
      }
    };
  }
}
