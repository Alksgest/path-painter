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
import { getFunctionArgumentsList } from "../util";

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
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, putMetadataKey);
  };
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
  ) {
    commonMethodImpl(target, propertyKey, descriptor, path, deleteMetadataKey);
  };
}

function commonMethodImpl(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  path: string,
  method: Symbol
) {
  const funcArguments = getFunctionArgumentsList(descriptor.value);

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
  applyMetadata(
    target,
    propertyKey,
    descriptor,
    funcArguments,
    queryMetadataKey,
    queryDataMetadataKey
  );

  applyParamsMetadata(target, propertyKey, descriptor);

  Reflect.defineMetadata(method, path, descriptor.value);
}

function applyParamsMetadata(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): Function {
  let oldFunc: Function = descriptor.value;
  let functionArgumentIndexes = Reflect.getOwnMetadata(
    paramMetadataKey,
    target,
    propertyKey
  );

  if (functionArgumentIndexes) {
    descriptor.value = function (...args: any[]) {
      const params = Reflect.getOwnMetadata(
        paramDataMetadataKey,
        descriptor.value
      );

      const name = Reflect.getOwnMetadata(
        paramNameMetadataKey,
        target,
        propertyKey
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
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  funcArguments: string[],
  metadataKey: symbol,
  metadataValueKey: symbol
): Function {
  let oldFunc: Function = descriptor.value;
  let functionArgumentIndexes = Reflect.getOwnMetadata(
    metadataKey,
    target,
    propertyKey
  );

  if (functionArgumentIndexes) {
    descriptor.value = function (...args: any[]) {
      const headers = Reflect.getOwnMetadata(
        metadataValueKey,
        descriptor.value
      );

      for (const index of functionArgumentIndexes) {
        const propName = funcArguments[index];
        Object.keys(headers).forEach((key) => {
          if (propName !== key) {
            return;
          }
          args[index] = headers[key];
        });
      }

      return oldFunc.apply(this, args);
    };
  }

  return descriptor.value;
}
