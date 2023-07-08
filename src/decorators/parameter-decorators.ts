import {
  bodyMetadataKey,
  headerMetadataKey,
  paramMetadataKey,
  paramNameMetadataKey,
  queryMetadataKey,
  validationMetadataKey,
} from "../types/symbols";

export function Validate() {
  return function (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    Reflect.defineMetadata(
      validationMetadataKey,
      parameterIndex,
      target,
      propertyKey,
    );
  };
}

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

    Reflect.defineMetadata(
      paramMetadataKey,
      parameterIndex,
      target,
      propertyKey,
    );

    Reflect.defineMetadata(paramNameMetadataKey, name, target, propertyKey);
  };
}
