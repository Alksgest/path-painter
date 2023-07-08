import { DataType, TypeDecoratorParams } from "../types/enums";
import { PropertyMetadata } from "../types/metadata";
import { ConstructorType } from "../types/settings";

export function IsTypeOf(ctor: ConstructorType) {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, ctor.name, target);
  };
}

export function IsString(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.String,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsNumber(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Number,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsBoolean(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Boolean,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}
