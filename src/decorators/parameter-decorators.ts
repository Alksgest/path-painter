import {
  bodyMetadataKey,
  headerMetadataKey,
  paramMetadataKey,
  paramNameMetadataKey,
  queryMetadataKey,
} from "../types/symbols";

export function FromBody(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingParams: number[] =
    Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];

  existingParams.push(parameterIndex);

  Reflect.defineMetadata(bodyMetadataKey, existingParams, target, propertyKey);
}

export function FromHeader(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingParams: number[] =
    Reflect.getOwnMetadata(headerMetadataKey, target, propertyKey) || [];

  existingParams.push(parameterIndex);

  Reflect.defineMetadata(
    headerMetadataKey,
    existingParams,
    target,
    propertyKey
  );
}

export function FromQuery(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingParams: number[] =
    Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];

  existingParams.push(parameterIndex);

  Reflect.defineMetadata(queryMetadataKey, existingParams, target, propertyKey);
}

export function FromParam(name: string): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    let existingParams: number[] =
      Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    existingParams.push(parameterIndex);

    Reflect.defineMetadata(
      paramMetadataKey,
      existingParams,
      target,
      propertyKey
    );

    Reflect.defineMetadata(paramNameMetadataKey, name, target, propertyKey);
  };
}
