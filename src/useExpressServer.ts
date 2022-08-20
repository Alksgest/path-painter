import cors from "cors";
import { Express, Request, Response } from "express";
import "reflect-metadata";
import {
  controllerMetadataKey,
  bodyDataMetadataKey,
  headersDataMetadataKey,
} from "./decorators";
import { ControllerBaseConfig } from "./types/settings";

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
      Reflect.defineMetadata(headersDataMetadataKey, req.headers, handler);

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
      Reflect.defineMetadata(headersDataMetadataKey, req.headers, handler);

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
    if (!keys.includes(controllerMetadataKey)) {
      return false;
    }

    return true;
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
      const keys: Symbol[] = Reflect.getOwnMetadataKeys(func);

      const basePath = Reflect.getOwnMetadata(
        controllerMetadataKey,
        controller
      );

      for (const key of keys) {
        const k = key.description!;

        const methodPath = Reflect.getOwnMetadata(key, func);

        const combinedPath = `${basePath}${methodPath}`;

        const registerEndpointMethod = switchObj[k];

        const obj = new (controller as any)();

        const objFunc: Function = obj[funcName];

        // Reflect.defineMetadata(bodyDataMetadataKey, dummyBody, objFunc);

        // const bindFunc = objFunc.bind(obj);

        registerEndpointMethod(app, combinedPath.trim(), obj, objFunc);
      }
    }
  });
}

// const callClass = new CallClass(config);
// callClass.testCallEndpoint({ method: "Post", url: "/sus/path" });

// export class CallClass {
//   constructor(private config: ControllerBaseConfig) {}

//   testCallEndpoint(req: Partial<Request>) {
//     const controllers = this.config.controllers;

//     const method = req.method;
//     const path = req.url;

//     let ctor: Function | undefined = undefined;
//     let methodToCall: Function | undefined = undefined;
//     let methodSymbol: Symbol | undefined = undefined;

//     controllers.forEach((controller) => {
//       const keys = Reflect.getOwnMetadataKeys(controller);
//       if (!keys.includes(controllerMetadataKey)) {
//         return;
//       }

//       const functions = Object.getOwnPropertyNames(controller.prototype).filter(
//         (f) => f != "constructor"
//       );

//       if (!functions?.length) {
//         return;
//       }

//       for (const funcName of functions) {
//         const func: Function = controller.prototype[funcName];

//         const keys = Reflect.getOwnMetadataKeys(func);

//         const hasMethod = keys
//           .map((el: Symbol) => el.description)
//           .includes(method);

//         if (!hasMethod) {
//           return;
//         }

//         const key = keys.find((el: Symbol) => el.description === method);

//         const basePath = Reflect.getOwnMetadata(
//           controllerMetadataKey,
//           controller
//         );
//         const methodPath = Reflect.getOwnMetadata(key, func);

//         const combinedPath = `${basePath}${methodPath}`;

//         if (path === combinedPath) {
//           // success
//           ctor = controller;
//           methodToCall = func;
//           methodSymbol = key;
//         }
//       }
//     });

//     if (!ctor) {
//       return;
//     }

//     if (!methodToCall) {
//       return;
//     }

//     const Constructor = ctor as Function;

//     const obj = (Constructor.constructor as any)();

//     const ff = methodToCall as Function;

//     Reflect.defineMetadata(bodyDataMetadataKey, dummyBody, ff);

//     ff.apply(obj);
//   }
// }
