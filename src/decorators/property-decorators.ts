import { DataType, DecoratorParamsType } from "../types/enums";
import { PropertyMetadata } from "../types/metadata";
import { ConstructorType } from "../types/settings";

export function IsType(ctor: ConstructorType) {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    Reflect.defineMetadata(propertyKey, ctor.name, target);
  };
}

export function IsString(params?: DecoratorParamsType): PropertyDecorator {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.String,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsNumber(params?: DecoratorParamsType): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Number,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}

export function IsBoolean(params?: DecoratorParamsType): PropertyDecorator {
  return function (target: NonNullable<unknown>, propertyKey: string | symbol) {
    const metadata: PropertyMetadata = {
      dataType: DataType.Boolean,
      params,
    };

    Reflect.defineMetadata(propertyKey, metadata, target);
  };
}
