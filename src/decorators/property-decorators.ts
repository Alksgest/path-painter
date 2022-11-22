import { DataType, TypeDecoratorParams } from "../types/enums";
import { PropertyMetadata } from "../types/metadata";
import { validationParamsMetadataKey } from "../types/symbols";

export function IsTypeOf(ctor: Function) {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, ctor.name, target);
  };
}

export function IsString(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.String,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsNumber(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Number,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsBoolean(params?: TypeDecoratorParams): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Boolean,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}
