import { TmpBodyModel } from "../types/web";
import { getFunctionArgumentsList } from "../util";
import { bodyDataMetadataKey, bodyMetadataKey } from "./parameter-decorators";

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

function applyBodyParams(
  descriptor: PropertyDescriptor,
  bodyParams: any,
  funcArguments: string[],
  oldFunc: Function
): Function {
  descriptor.value = function (...args: any[]) {
    const requestBody = Reflect.getOwnMetadata(
      bodyDataMetadataKey,
      descriptor.value
    );

    console.log("requestBody: ", requestBody);

    for (const paramIndex of bodyParams) {
      const propName = funcArguments[paramIndex];
      console.log("propName: ", propName);
      Object.keys(requestBody).forEach((key) => {
        if (propName !== key) {
          return;
        }
        args[paramIndex] = requestBody[key];
      });
    }

    return oldFunc.apply(this, args);
  };

  return descriptor.value;
}

function commonMethodImpl(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  path: string,
  method: Symbol
) {
  let bodyParams = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey);

  let oldFunc: Function = descriptor.value;

  const funcArguments = getFunctionArgumentsList(descriptor.value);

  /**
   * Handle body params and return new version of "old func"
   */
  console.log("funcArguments: ", funcArguments);
  console.log("bodyParams: ", bodyParams);
  if (bodyParams) {
    oldFunc = applyBodyParams(descriptor, bodyParams, funcArguments, oldFunc);
  }

  Reflect.defineMetadata(method, path, descriptor.value);
}
