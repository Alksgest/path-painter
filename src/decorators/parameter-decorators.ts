export const requestMetadataKey = Symbol("request");
export const bodyMetadataKey = Symbol("body");
export const headerMetadataKey = Symbol("header");

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
