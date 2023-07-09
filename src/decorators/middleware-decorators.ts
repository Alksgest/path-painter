import "reflect-metadata";
import { useBeforeMetadataKey, useAfterMetadataKey } from "../types/symbols";
import { ConstructorType, UnknownFunction } from "../types/settings";

export function UseBefore(...middlewares: object[]): any {
  return registerMetadataAndReturnDecorator(middlewares, useBeforeMetadataKey);
}

export function UseAfter(...middlewares: object[]): any {
  return registerMetadataAndReturnDecorator(middlewares, useAfterMetadataKey);
}

function registerMetadataAndReturnDecorator(
  middlewares: object[],
  metadataKey: symbol,
) {
  return (
    target: unknown,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<unknown>,
  ) => {
    if (propertyKey && descriptor) {
      return registerMethodMetadataAndReturnDecorator(middlewares, metadataKey)(
        target as object,
        propertyKey,
        descriptor,
      );
    } else {
      return registerClassMetadataAndReturnDecorator(
        middlewares,
        metadataKey,
      )(target as UnknownFunction);
    }
  };
}

function registerMethodMetadataAndReturnDecorator(
  middlewares: object[],
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
  middlewares: object[],
  middlewareKey: symbol,
): ClassDecorator {
  return function (target: object) {
    if (middlewares.length === 0) {
      return;
    }

    Reflect.defineMetadata(middlewareKey, middlewares, target);
  };
}
