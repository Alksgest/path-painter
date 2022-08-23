import { DataType, TypeDecoratorParams } from "../types/enums";

export function IsTypeOf(ctor: Function) {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, ctor.name, target);
  };
}

export function IsString(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, DataType.String, target);
  };
}

export function IsNumber(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, DataType.Number, target);
  };
}

export function IsBoolean(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, DataType.Boolean, target);
  };
}
