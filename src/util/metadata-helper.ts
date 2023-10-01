import { paramMetadataKey } from "../types/symbols";
import { ParamMetadata } from "../types/metadata";

export function getParamMetadata(
  target: object,
  propertyKey: string | symbol,
): ParamMetadata[] {
  return Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
}
