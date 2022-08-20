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
} from "./types/symbols";
import { getRestKeys } from "./util";

const registerMiddlewares = (
  app: Express,
  controller: Function,
  functionName: string
) => {
  console.log("functionName: ", functionName);
  console.log("controller: ", controller);

  const controllerKeys = Reflect.getMetadataKeys(controller);
  console.log("controllerKeys: ", controllerKeys);

  const func = controller.prototype[functionName];
  console.log("func: ", func);

  const funcKeys = Reflect.getMetadataKeys(func);
  console.log("funcKeys: ", funcKeys);
};

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
    app.post(path, (req: Request, res: Response) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      Reflect.defineMetadata(bodyDataMetadataKey, req.body, handler);
      Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
      Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
      Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);

      const bindFunc = handler.bind(obj);

      const result = bindFunc();
      if (result) {
        res.json(result);
      } else {
        return res.send();
      }
    });
  },
  get: (
    app: Express,
    path: string,
    controller: Function,
    functionName: string
  ) => {
    app.get(path, (req: Request, res: Response) => {
      // TODO: entry point for DI
      const obj = new (controller as any)();
      const handler: Function = obj[functionName];

      Reflect.defineMetadata(headerDataMetadataKey, req.headers, handler);
      Reflect.defineMetadata(queryDataMetadataKey, req.query, handler);
      Reflect.defineMetadata(paramDataMetadataKey, req.params, handler);

      const bindFunc = handler.bind(obj);

      const result = bindFunc();
      if (result) {
        res.json(result);
      } else {
        return res.send();
      }
    });
  },
};

export function useExpressServer(app: Express, config: ControllerBaseConfig) {
  if (config.cors) {
    if (config.cors === true) {
      app.use(cors());
    }
  }

  const controllers = (config.controllers || []).filter((c) => {
    const keys = Reflect.getOwnMetadataKeys(c);
    return keys.includes(controllerMetadataKey);
  });

  controllers.forEach((controller) => {
    const functions = Object.getOwnPropertyNames(controller.prototype).filter(
      (f) => f != "constructor"
    );

    if (!functions?.length) {
      return;
    }

    for (const funcName of functions) {
      const func: Function = controller.prototype[funcName];
      const funcMetadataKeys: symbol[] = Reflect.getOwnMetadataKeys(func);

      const basePath = Reflect.getOwnMetadata(
        controllerMetadataKey,
        controller
      );

      const filteredKeys = getRestKeys(funcMetadataKeys);

      for (const key of filteredKeys) {
        const stringKey = key.description!;

        const methodPath = Reflect.getOwnMetadata(key, func);

        const combinedPath = `${basePath}${methodPath}`;

        const registerEndpointMethod = registerMethodSwitchObj[stringKey];

        registerEndpointMethod(app, combinedPath, controller, funcName);
        registerMiddlewares(app, controller, funcName);
      }
    }
  });
}
