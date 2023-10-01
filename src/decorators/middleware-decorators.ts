import "reflect-metadata";
import {
  transientMetadataKey,
  useAfterMetadataKey,
  useBeforeMetadataKey,
} from "../types/symbols";
import { ConstructorType, UnknownFunction } from "../types/settings";

export function Middleware(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(transientMetadataKey, "", target);
    return target;
  };
}

export function UseBefore(...middlewares: ConstructorType[]): any {
  return registerMetadataAndReturnDecorator(middlewares, useBeforeMetadataKey);
}

export function UseAfter(...middlewares: ConstructorType[]): any {
  return registerMetadataAndReturnDecorator(middlewares, useAfterMetadataKey);
}

function registerMetadataAndReturnDecorator(
  middlewares: ConstructorType[],
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
  middlewares: ConstructorType[],
  middlewareKey: symbol,
): MethodDecorator {
  return function (
    _: object,
    __: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (middlewares.length === 0) {
      return;
    }
    Reflect.defineMetadata(middlewareKey, middlewares, descriptor.value);
  };
}

function registerClassMetadataAndReturnDecorator(
  middlewares: ConstructorType[],
  middlewareKey: symbol,
): ClassDecorator {
  return function (target: object) {
    if (middlewares.length === 0) {
      return;
    }
    Reflect.defineMetadata(middlewareKey, middlewares, target);
  };
}
