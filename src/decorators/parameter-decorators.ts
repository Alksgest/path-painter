export const bodyMetadataKey = Symbol("Body");
export const bodyDataMetadataKey = Symbol("BodyData");

export function FromBody(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingRequiredParameters: number[] =
    Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(
    bodyMetadataKey,
    existingRequiredParameters,
    target,
    propertyKey
  );
}
