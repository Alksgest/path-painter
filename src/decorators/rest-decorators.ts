import {
  postMetadataKey,
  getMetadataKey,
  bodyMetadataKey,
  bodyDataMetadataKey,
  headerMetadataKey,
  headerDataMetadataKey,
  queryMetadataKey,
  queryDataMetadataKey,
  deleteMetadataKey,
  putMetadataKey,
} from "../types/symbols";
import {
  getFunctionArgumentsList,
  getParamMetadata,
  getParamValues,
  isNullOrUndefined,
} from "../util";
import { validateBodyModel } from "./field-validators";
import { UnknownFunction } from "../types/settings";

export function Post(path = ""): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    registerRestAction(
      target,
      propertyKey,
      descriptor,
      path,
      postMetadataKey,
      true,
    );
  };
}

export function Put(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    registerRestAction(
      target,
      propertyKey,
      descriptor,
      path,
      putMetadataKey,
      true,
    );
  };
}

export function Get(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    registerRestAction(target, propertyKey, descriptor, path, getMetadataKey);
  };
}

export function Delete(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    registerRestAction(
      target,
      propertyKey,
      descriptor,
      path,
      deleteMetadataKey,
    );
  };
}

function registerRestAction(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  path: string,
  method: symbol,
  includeBody?: boolean,
) {
  const funcArguments = getFunctionArgumentsList(descriptor.value);

  if (includeBody) {
    applyBodyMetadata(
      target,
      propertyKey,
      descriptor,
      funcArguments,
      bodyMetadataKey,
      bodyDataMetadataKey,
    );
  }

  applyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    headerMetadataKey,
    headerDataMetadataKey,
  );
  applyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    queryMetadataKey,
    queryDataMetadataKey,
  );

  applyParamsMetadata(target, propertyKey, descriptor);

  Reflect.defineMetadata(method, path, descriptor.value);
}

function applyParamsMetadata(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
): UnknownFunction {
  const oldFunc = descriptor.value as UnknownFunction;
  // TODO: create typed wrapper under getting metadata bonded by key
  const paramsList = getParamMetadata(target, propertyKey);

  if (!isNullOrUndefined(paramsList)) {
    descriptor.value = function (...args: unknown[]) {
      const paramValues = getParamValues(oldFunc);

      for (const obj of paramsList) {
        const value = paramValues[obj.name];
        const position = obj.position;

        args[position] = value;
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}

function applyMetadata(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[],
  metadataKey: symbol,
  metadataValueKey: symbol,
): UnknownFunction {
  const oldFunc = descriptor.value as UnknownFunction;
  const functionArgumentIndexes = Reflect.getOwnMetadata(
    metadataKey,
    target,
    propertyKey,
  );

  if (functionArgumentIndexes) {
    descriptor.value = function (...args: unknown[]) {
      const data = Reflect.getOwnMetadata(metadataValueKey, descriptor.value);

      for (const index of functionArgumentIndexes) {
        const propName = funcArguments[index];
        Object.keys(data).forEach((key) => {
          if (propName !== key) {
            return;
          }
          args[index] = data[key];
        });
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}

function applyBodyMetadata(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[],
  metadataKey: symbol,
  metadataValueKey: symbol,
): UnknownFunction {
  const oldFunc = descriptor.value as UnknownFunction;
  const index = Reflect.getOwnMetadata(metadataKey, target, propertyKey);

  if (!isNullOrUndefined(index)) {
    descriptor.value = function (...args: unknown[]) {
      const body = Reflect.getOwnMetadata(metadataValueKey, descriptor.value);

      const propName = funcArguments[index];
      Object.keys(body).forEach((key) => {
        if (propName !== key) {
          return;
        }

        let model = body[key];

        // const shouldBeValidated = Reflect.getOwnMetadataKeys(
        //   target,
        //   propertyKey,
        // ).includes(validationMetadataKey);

        // if (shouldBeValidated) {
        let paramType = Reflect.getOwnMetadata(
          "design:paramtypes",
          target,
          propertyKey,
        );

        paramType = paramType?.length !== undefined ? paramType[0] : paramType;

        model = validateBodyModel(model, paramType);
        // }

        args[index] = model;
      });

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}
