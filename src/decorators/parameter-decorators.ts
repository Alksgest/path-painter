import {
  bodyMetadataKey,
  headerMetadataKey,
  paramMetadataKey,
  queryMetadataKey,
} from "../types/symbols";
import { ParamMetadata } from "../types/metadata";

export function Body(
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number,
): void {
  Reflect.defineMetadata(bodyMetadataKey, parameterIndex, target, propertyKey);
}

export function Header(
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number,
): void {
  Reflect.defineMetadata(
    headerMetadataKey,
    parameterIndex,
    target,
    propertyKey,
  );
}

export function Query(
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number,
): void {
  Reflect.defineMetadata(queryMetadataKey, parameterIndex, target, propertyKey);
}

export function Param(name: string): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) {
    if (!propertyKey) {
      return;
    }

    const existingParams: ParamMetadata[] =
      Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    existingParams.push({ position: parameterIndex, name });

    Reflect.defineMetadata(
      paramMetadataKey,
      existingParams,
      target,
      propertyKey,
    );
  };
}
