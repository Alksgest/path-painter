import {
  postMetadataKey,
  getMetadataKey,
  bodyMetadataKey,
  bodyDataMetadataKey,
  headerMetadataKey,
  headerDataMetadataKey,
  queryMetadataKey,
  queryDataMetadataKey,
  paramMetadataKey,
  deleteMetadataKey,
  paramDataMetadataKey,
  paramNameMetadataKey,
  putMetadataKey,
} from "../types/symbols";
import { getFunctionArgumentsList, isNullOrUndefined } from "../util";
import { validateBodyModel } from "./field-validators";
import { UnknownFunction } from "../types/settings";

export function Post(path = ""): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, postMetadataKey);
  };
}

export function Put(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, putMetadataKey);
  };
}

export function Get(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, getMetadataKey);
  };
}

export function Delete(path = ""): MethodDecorator {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, deleteMetadataKey);
  };
}

function commonMethodImpl(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  path: string,
  method: symbol,
) {
  const funcArguments = getFunctionArgumentsList(descriptor.value);

  applyBodyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    bodyMetadataKey, // probably should be removed for get
    bodyDataMetadataKey,
  );
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
  const functionArgumentIndexes = Reflect.getOwnMetadata(
    paramMetadataKey,
    target,
    propertyKey,
  );

  if (functionArgumentIndexes) {
    descriptor.value = function (...args: unknown[]) {
      const params = Reflect.getOwnMetadata(
        paramDataMetadataKey,
        descriptor.value,
      );

      const name = Reflect.getOwnMetadata(
        paramNameMetadataKey,
        target,
        propertyKey,
      );

      for (const index of functionArgumentIndexes) {
        Object.keys(params).forEach((key) => {
          if (name !== key) {
            return;
          }
          args[index] = params[key];
        });
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
    descriptor.value = function (...args: any[]) {
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
    descriptor.value = function (...args: any[]) {
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
