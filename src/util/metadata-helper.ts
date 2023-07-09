import { paramDataMetadataKey, paramMetadataKey } from "../types/symbols";
import { ParamMetadata } from "../types/metadata";
import { UnknownFunction } from "../types/settings";

export function getParamMetadata(
  target: object,
  propertyKey: string | symbol,
): ParamMetadata[] {
  return Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
}

export function getParamValues(func: UnknownFunction): Record<string, unknown> {
  return Reflect.getOwnMetadata(paramDataMetadataKey, func);
}
