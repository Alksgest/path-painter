import "reflect-metadata";
import { useBeforeMetadataKey, useAfterMetadataKey } from "../types/symbols";

export function UseBefore(...middlewares: Function[]): Function {
  return registerMetadataAndReturnDecorator(middlewares, useBeforeMetadataKey);
}

export function UseAfter(...middlewares: Function[]): Function {
  return registerMetadataAndReturnDecorator(middlewares, useAfterMetadataKey);
}

function registerMetadataAndReturnDecorator(
  middlewares: Function[],
  middlewareKey: symbol
): Function {
  return function (
    target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    if (middlewares.length === 0) {
      return;
    }

    // if descriptor is not undefined it is mean, that it is a function, not a class
    const obj = descriptor ? descriptor.value : target;
    Reflect.defineMetadata(middlewareKey, middlewares, obj);
  };
}
