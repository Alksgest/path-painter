import "reflect-metadata";
import { useBeforeMetadataKey, useAfterMetadataKey } from "../types/symbols";

export function UseBefore(...middlewares: Function[]): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(useBeforeMetadataKey, middlewares, descriptor.value);
  };
}

export function UseAfter(...middlewares: Function[]): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(useAfterMetadataKey, middlewares, descriptor.value);
  };
}
