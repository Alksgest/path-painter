import { getFunctionArgumentsList } from "../util";
import { bodyMetadataKey, headerMetadataKey } from "./parameter-decorators";

export const bodyDataMetadataKey = Symbol("bodyData");
export const headerDataMetadataKey = Symbol("headersData");
export const queryDataMetadataKey = Symbol("queryData");

export const postMetadataKey = Symbol("post");
export const getMetadataKey = Symbol("get");

export function Post(path: string = ""): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, postMetadataKey);
  };
}

export function Put(path: string = ""): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {};
}

export function Get(path: string = ""): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, getMetadataKey);
  };
}

export function Delete(path: string = ""): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {};
}

function commonMethodImpl(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  path: string,
  method: Symbol
) {
  const funcArguments = getFunctionArgumentsList(descriptor.value);

  // applyBodyParams(target, propertyKey, descriptor, funcArguments);
  // applyHeadersParams(target, propertyKey, descriptor, funcArguments);

  applyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    bodyMetadataKey,
    bodyDataMetadataKey
  );
  applyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    headerMetadataKey,
    headerDataMetadataKey
  );

  Reflect.defineMetadata(method, path, descriptor.value);
}

function applyMetadata(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[],
  metadataKey: symbol,
  metadataValueKey: symbol
): Function {
  let oldFunc: Function = descriptor.value;
  let bodyParams = Reflect.getOwnMetadata(metadataKey, target, propertyKey);

  if (bodyParams) {
    descriptor.value = function (...args: any[]) {
      const headers = Reflect.getOwnMetadata(
        metadataValueKey,
        descriptor.value
      );

      for (const paramIndex of bodyParams) {
        const propName = funcArguments[paramIndex];
        Object.keys(headers).forEach((key) => {
          if (propName !== key) {
            return;
          }
          args[paramIndex] = headers[key];
        });
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}

function applyHeadersParams(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[]
): Function {
  let oldFunc: Function = descriptor.value;
  let bodyParams = Reflect.getOwnMetadata(
    headerMetadataKey,
    target,
    propertyKey
  );

  if (bodyParams) {
    descriptor.value = function (...args: any[]) {
      const headers = Reflect.getOwnMetadata(
        headerDataMetadataKey,
        descriptor.value
      );

      for (const paramIndex of bodyParams) {
        const propName = funcArguments[paramIndex];
        Object.keys(headers).forEach((key) => {
          if (propName !== key) {
            return;
          }
          args[paramIndex] = headers[key];
        });
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}

function applyBodyParams(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[]
): Function {
  let oldFunc: Function = descriptor.value;
  let bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey);

  if (bodyParams) {
    descriptor.value = function (...args: any[]) {
      const requestBody = Reflect.getOwnMetadata(
        bodyDataMetadataKey,
        descriptor.value
      );

      for (const paramIndex of bodyParams) {
        const propName = funcArguments[paramIndex];
        Object.keys(requestBody).forEach((key) => {
          if (propName !== key) {
            return;
          }
          args[paramIndex] = requestBody[key];
        });
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}

/**
 * Handle body params and return new version of "old func"
 */
// let bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey);
// let oldFunc: Function = descriptor.value;

// if (bodyParams) {
//   oldFunc = applyBodyParams(descriptor, bodyParams, funcArguments, oldFunc);
// }

// function applyBodyParams(
//   descriptor: PropertyDescriptor,
//   bodyParams: any,
//   funcArguments: string[],
//   oldFunc: Function
// ): Function {
//   descriptor.value = function (...args: any[]) {
//     const requestBody = Reflect.getOwnMetadata(
//       bodyDataMetadataKey,
//       descriptor.value
//     );

//     for (const paramIndex of bodyParams) {
//       const propName = funcArguments[paramIndex];
//       Object.keys(requestBody).forEach((key) => {
//         if (propName !== key) {
//           return;
//         }
//         args[paramIndex] = requestBody[key];
//       });
//     }

//     return oldFunc.apply(this, args);
//   };

//   return descriptor.value;
// }
