import cors from "cors";
import { Express, Request, Response } from "express";
import "reflect-metadata";
import { ControllerBaseConfig } from "./types/settings";
import {
  bodyDataMetadataKey,
  headerDataMetadataKey,
  controllerMetadataKey,
  queryDataMetadataKey,
  paramDataMetadataKey,
} from "./types/symbols";

const switchObj: {
  [key: string]: (
    app: Express,
    path: string,
    obj: any,
    handler: Function
  ) => void;
} = {
  post: (app: Express, path: string, obj: any, handler: Function) => {
    app.post(path, (req: Request, res: Response) => {
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
  get: (app: Express, path: string, obj: any, handler: Function) => {
    app.get(path, (req: Request, res: Response) => {
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
      const funcMetadataKeys: Symbol[] = Reflect.getOwnMetadataKeys(func);

      const basePath = Reflect.getOwnMetadata(
        controllerMetadataKey,
        controller
      );

      for (const key of funcMetadataKeys) {
        const k = key.description!;

        const methodPath = Reflect.getOwnMetadata(key, func);

        const combinedPath = `${basePath}${methodPath}`;

        console.log("combinedPath: ", combinedPath);

        const registerEndpointMethod = switchObj[k];

        const obj = new (controller as any)();

        const objFunc: Function = obj[funcName];

        registerEndpointMethod(app, combinedPath, obj, objFunc);
      }
    }
  });
}
