import "reflect-metadata";
import { useBeforeMetadataKey, useAfterMetadataKey } from "../types/symbols";
import { ConstructorType, UnknownFunction } from "../types/settings";

// export function UseBefore(
//   ...middlewares: (UnknownFunction | ConstructorType)[]
// ): MethodDecorator | ClassDecorator {
//   return registerMetadataAndReturnDecorator(middlewares, useBeforeMetadataKey);
// }

export function UseBefore(
  ...middlewares: (UnknownFunction | ConstructorType)[]
): any {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (propertyKey && descriptor) {
      return registerMethodMetadataAndReturnDecorator(
        middlewares,
        useBeforeMetadataKey,
      )(target, propertyKey, descriptor);
    } else {
      return registerClassMetadataAndReturnDecorator(
        middlewares,
        useBeforeMetadataKey,
      )(target);
    }
  };
}

export function UseAfter(
  ...middlewares: (UnknownFunction | ConstructorType)[]
): any {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (propertyKey && descriptor) {
      return registerMethodMetadataAndReturnDecorator(
        middlewares,
        useAfterMetadataKey,
      )(target, propertyKey, descriptor);
    } else {
      return registerClassMetadataAndReturnDecorator(
        middlewares,
        useAfterMetadataKey,
      )(target);
    }
  };
}

function registerMethodMetadataAndReturnDecorator(
  middlewares: (UnknownFunction | ConstructorType)[],
  middlewareKey: symbol,
): MethodDecorator {
  return function (
    target: object,
    _: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (middlewares.length === 0) {
      return;
    }

    Reflect.defineMetadata(middlewareKey, middlewares, descriptor.value);
  };
}

function registerClassMetadataAndReturnDecorator(
  middlewares: (UnknownFunction | ConstructorType)[],
  middlewareKey: symbol,
): ClassDecorator {
  return function (target: object) {
    if (middlewares.length === 0) {
      return;
    }

    Reflect.defineMetadata(middlewareKey, middlewares, target);
  };
}
